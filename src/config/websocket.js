import WebSocket from 'ws';

function setupWebSocket(port) {
  const wss = new WebSocket.Server({ port });
  console.log(`WebSocket Server running on port ${port}`);

  return (data) => {
    const msg = JSON.stringify(data);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg);
      }
    });
  };
}

export { setupWebSocket };
