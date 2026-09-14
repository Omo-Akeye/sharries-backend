const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (value) => {
  if (typeof value !== 'string') return value;
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
};
