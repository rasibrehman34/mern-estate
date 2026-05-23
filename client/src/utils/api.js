const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export const apiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
};

export const apiFetch = (path, options = {}) =>
  fetch(apiUrl(path), {
    credentials: 'include',
    ...options,
  });
