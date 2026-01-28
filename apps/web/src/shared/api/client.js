export const API_BASE =
    import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:4000';

async function parseJsonSafe(r) {
    const text = await r.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return { raw: text };
    }
}

export async function apiGet(path) {
    const r = await fetch(`${API_BASE}${path}`);
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data?.error || JSON.stringify(data));
    return data;
}

export async function apiPostForm(path, formData) {
    const r = await fetch(`${API_BASE}${path}`, { method: 'POST', body: formData });
    const data = await parseJsonSafe(r);
    if (!r.ok) throw new Error(data?.error || JSON.stringify(data));
    return data;
}
