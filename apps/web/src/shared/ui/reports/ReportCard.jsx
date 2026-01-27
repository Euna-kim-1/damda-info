import { Card, CardContent, CardMedia, Stack, Typography } from '@mui/material';

export default function ReportCard({
  title,
  brand,
  storeName,
  price,
  imageUrl,
}) {
  const fallbackImage = '/2.png';

  return (
    <Card
      sx={{
        display: 'flex',
        borderRadius: 999,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        height: 140,
      }}
    >
      <CardMedia
        component="img"
        image={imageUrl || fallbackImage}
        alt={title || 'Report'}
        sx={{
          flex: '0 0 50%',
          width: '50%',
          height: '100%',
          objectFit: 'contain',
        }}
        onError={(e) => {
          // ✅ imageUrl이 있는데 깨졌을 때도 cart.png로 fallback
          e.currentTarget.src = fallbackImage;
        }}
      />

      <CardContent sx={{ flex: '1 1 50%', minWidth: 0, py: 1.5 }}>
        <Stack spacing={0.4} sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }} noWrap>
            {title || '-'}
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 13 }} noWrap>
            {brand ? `Brand: ${brand}` : 'Brand: -'}
          </Typography>

          <Typography sx={{ color: 'text.secondary', fontSize: 13 }} noWrap>
            {storeName ? `Store: ${storeName}` : 'Store: -'}
          </Typography>

          <Typography sx={{ fontWeight: 900, mt: 0.5 }}>
            {price || ''}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
