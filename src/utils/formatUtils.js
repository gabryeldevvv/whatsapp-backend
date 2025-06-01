function formatTimestamp(timestamp) {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoje ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Ontem ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays < 7) {
    return date.toLocaleDateString([], { weekday: 'long', hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleString();
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i]);
}

export { formatTimestamp, formatBytes };
