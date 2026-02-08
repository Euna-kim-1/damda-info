export const API_BASE =
  import.meta.env.VITE_API_BASE?.replace(/\/$/, '') || 'http://localhost:4000';

const parseJsonSafe = async (response) => {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { raw: text };
  }
};

const requestJson = async (path, options) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  const data = await parseJsonSafe(response);
  if (!response.ok) throw new Error(data?.error || JSON.stringify(data));
  return data;
};

export const apiGet = (path) => requestJson(path);

export const apiPostForm = (path, formData) =>
  requestJson(path, {
    method: 'POST',
    body: formData,
  });

export const apiPostJson = (path, body) =>
  requestJson(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

export const apiPatchJson = (path, body) =>
  requestJson(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });

export const apiDelete = (path) =>
  requestJson(path, { method: 'DELETE' });
