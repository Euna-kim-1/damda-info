import express from 'express';
import multer from 'multer';
import { supabase } from '../lib/supabase.js';
import { normalizeName } from '../../../web/src/shared/utils/normalizeText.js';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const BASKET_IMAGE_COUNT = 12;

function getBasketImagePath() {
  const idx = Math.floor(Math.random() * BASKET_IMAGE_COUNT) + 1;
  return `/basket/${idx}.png`;
}

function isReceiptPhotoPath(photoPath = '') {
  return String(photoPath).startsWith('receipt/');
}

function extractCount(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  if (Array.isArray(value)) {
    if (value.length === 0) return 0;
    const first = value[0];
    if (typeof first === 'number') return first;
    const parsed = Number(first?.count);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  const parsed = Number(value?.count);
  return Number.isFinite(parsed) ? parsed : 0;
}

router.get('/popular', async (req, res) => {
  try {
    const bucket = process.env.SUPABASE_BUCKET || 'damda-images';
    const parsedLimit = Number(req.query.limit || 5);
    const limit = Math.min(
      Math.max(Number.isFinite(parsedLimit) ? Math.trunc(parsedLimit) : 5, 1),
      20,
    );

    const { data: products, error: productsErr } = await supabase
      .from('products')
      .select(
        `
          id,
          name,
          price_reports(count)
        `,
      );

    if (productsErr) throw productsErr;

    const rankedProducts = (products || [])
      .map((p) => ({
        id: p.id,
        name: p.name,
        popularity_count: extractCount(p.price_reports),
      }))
      .filter((p) => p.popularity_count > 0)
      .sort((a, b) => b.popularity_count - a.popularity_count)
      .slice(0, limit);

    if (rankedProducts.length === 0) {
      return res.json({
        ok: true,
        reports: [],
        limit,
      });
    }

    const topProductIds = rankedProducts.map((p) => p.id);
    const { data: latestReports, error: latestErr } = await supabase
      .from('price_reports')
      .select(
        `
          id,
          product_id,
          price,
          unit,
          notes,
          photo_path,
          reported_at,
          stores:store_id ( id, name )
        `,
      )
      .in('product_id', topProductIds)
      .order('reported_at', { ascending: false });

    if (latestErr) throw latestErr;

    const latestByProductId = new Map();
    for (const row of latestReports || []) {
      if (!latestByProductId.has(row.product_id)) {
        latestByProductId.set(row.product_id, row);
      }
    }

    const reports = rankedProducts
      .map((p) => {
        const latest = latestByProductId.get(p.id);
        if (!latest) return null;

        const imageUrl = isReceiptPhotoPath(latest.photo_path)
          ? getBasketImagePath()
          : (supabase.storage.from(bucket).getPublicUrl(latest.photo_path)?.data
              ?.publicUrl ?? null);

        return {
          id: latest.id,
          price: latest.price,
          unit: latest.unit,
          notes: latest.notes,
          reported_at: latest.reported_at,
          product_name: p.name ?? null,
          store_name: latest.stores?.name ?? null,
          image_url: imageUrl,
          popularity_count: p.popularity_count,
        };
      })
      .filter(Boolean);

    return res.json({
      ok: true,
      reports,
      limit,
    });
  } catch (err) {
    console.error('REPORT POPULAR GET error:', err);
    return res
      .status(500)
      .json({ ok: false, error: String(err?.message || err) });
  }
});

router.get('/', async (req, res) => {
  try {
    const bucket = process.env.SUPABASE_BUCKET || 'damda-images';
    const parsedLimit = Number(req.query.limit || 10);
    const limit = Math.min(
      Math.max(Number.isFinite(parsedLimit) ? Math.trunc(parsedLimit) : 10, 1),
      50,
    );
    const parsedPage = Number(req.query.page || 1);
    const page = Math.max(
      Number.isFinite(parsedPage) ? Math.trunc(parsedPage) : 1,
      1,
    );
    const from = (page - 1) * limit;
    const fetchSize = limit + 1; // fetch one extra row to know whether next page exists
    const to = from + fetchSize - 1;
    const rawQ = String(req.query.q || '').trim();

    // if q is provided, find product_id in products
    let productIds = null;

    if (rawQ) {
      const nq = normalizeName(rawQ); // "wheat noodle" -> "wheat noodle"
      if (!nq) {
        return res.json({
          ok: true,
          reports: [],
          page,
          limit,
          total_count: 0,
          total_pages: 0,
          has_next: false,
        });
      }

      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('id')
        .ilike('normalized_name', `%${nq}%`)
        .limit(200);

      if (prodErr) throw prodErr;

      productIds = (prod || []).map((p) => p.id);

      // if no search results, return empty results
      if (productIds.length === 0) {
        return res.json({
          ok: true,
          reports: [],
          page,
          limit,
          total_count: 0,
          total_pages: 0,
          has_next: false,
        });
      }
    }

    // get price_reports + join
    let query = supabase
      .from('price_reports')
      .select(
        `
          id,
          price,
          unit,
          notes,
          photo_path,
          reported_at,
          products:product_id ( id, name ),
          stores:store_id ( id, name )
        `,
        { count: 'exact' },
      )
      .order('reported_at', { ascending: false })
      .range(from, to);

    // filter by product_id
    if (productIds) {
      query = query.in('product_id', productIds);
    }

    const { data, count, error } = await query;
    if (error) throw error;

    const totalCount = Number.isFinite(count) ? count : 0;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / limit) : 0;
    const rows = data || [];
    const hasNext = page < totalPages;
    const visibleRows = hasNext ? rows.slice(0, limit) : rows;

    const reports = visibleRows.map((r) => {
      const imageUrl = isReceiptPhotoPath(r.photo_path)
        ? getBasketImagePath()
        : (supabase.storage.from(bucket).getPublicUrl(r.photo_path)?.data
            ?.publicUrl ?? null);

      return {
        id: r.id,
        price: r.price,
        unit: r.unit,
        notes: r.notes,
        reported_at: r.reported_at,
        product_name: r.products?.name ?? null,
        store_name: r.stores?.name ?? null,
        image_url: imageUrl,
      };
    });

    return res.json({
      ok: true,
      reports,
      page,
      limit,
      total_count: totalCount,
      total_pages: totalPages,
      has_next: hasNext,
    });
  } catch (err) {
    console.error('REPORT GET error:', err);
    return res
      .status(500)
      .json({ ok: false, error: String(err?.message || err) });
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  try {
    const bucket = process.env.SUPABASE_BUCKET || 'damda-images';

    const {
      storeName,
      city,
      address,
      productName,
      price,
      unit,
      notes,
      reportedAt,
      mode,
    } = req.body;

    if (!req.file)
      return res
        .status(400)
        .json({ error: 'No image file uploaded (field name: image)' });
    if (!storeName?.trim())
      return res.status(400).json({ error: 'storeName is required' });
    if (!productName?.trim())
      return res.status(400).json({ error: 'productName is required' });
    if (!price) return res.status(400).json({ error: 'price is required' });

    const normalized = normalizeName(productName);
    if (!normalized)
      return res.status(400).json({ error: 'productName is invalid' });

    const priceNum = Number(String(price).replace('$', '').trim());
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res.status(400).json({ error: 'price is invalid' });
    }

    // 1) store upsert (name 기준)
    let storeId = null;
    {
      const { data: found, error: findErr } = await supabase
        .from('stores')
        .select('id')
        .eq('name', storeName.trim())
        .limit(1);

      if (findErr) throw findErr;

      if (found?.[0]?.id) {
        storeId = found[0].id;
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('stores')
          .insert({
            name: storeName.trim(),
            city: city?.trim() || null,
            address: address?.trim() || null,
          })
          .select('id')
          .single();

        if (insErr) throw insErr;
        storeId = inserted.id;
      }
    }

    // 2) product upsert
    let productId = null;
    {
      const { data: up, error: upErr } = await supabase
        .from('products')
        .upsert(
          { name: productName.trim(), normalized_name: normalized },
          { onConflict: 'normalized_name' },
        )
        .select('id')
        .single();

      if (upErr) throw upErr;
      productId = up.id;
    }

    // 3) storage upload
    const ext = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase();
    const isReceiptMode = String(mode || '').toLowerCase() === 'receipt';
    const modeFolder = isReceiptMode ? 'receipt' : 'single';
    const filePath = `${modeFolder}/${storeId}/${productId}/${Date.now()}.${ext}`;

    const { error: upFileErr } = await supabase.storage
      .from(bucket)
      .upload(filePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (upFileErr) throw upFileErr;

    // 4) price_reports insert
    const { data: report, error: repErr } = await supabase
      .from('price_reports')
      .insert({
        store_id: storeId,
        product_id: productId,
        price: priceNum,
        unit: unit?.trim() || null,
        notes: notes?.trim() || null,
        photo_path: filePath,
        reported_at: reportedAt
          ? new Date(reportedAt).toISOString()
          : new Date().toISOString(),
      })
      .select('*')
      .single();

    if (repErr) throw repErr;

    return res.json({ ok: true, report });
  } catch (err) {
    console.error('REPORT server error:', err);
    return res
      .status(500)
      .json({ ok: false, error: String(err?.message || err), raw: err });
  }
});

export default router;
