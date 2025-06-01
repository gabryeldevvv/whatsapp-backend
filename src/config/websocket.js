import WebSocket, { WebSocketServer } from 'ws';

/**
 * Sets up a WebSocket server.
 * @param {number} port The port to listen on.
 * @param {(data: any, ws: WebSocket) => void} onMessageCallback Callback function executed when a message is received from a client.
 * @returns {{ broadcast: (data: any) => void }} An object containing the broadcast function.
 */
function setupWebSocket(port, onMessageCallback) {
  const wss = new WebSocketServer({ port });
  console.log(`[WebSocket] Server running on port ${port}`);

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');

    ws.on('message', (message) => {
      console.log('[WebSocket] Received message ->', message.toString());
      try {
        const parsedData = JSON.parse(message.toString());
        // Execute the callback provided by the main application logic
        if (onMessageCallback) {
          onMessageCallback(parsedData, ws);
        }
      } catch (error) {
        console.error('[WebSocket] Failed to parse message or execute callback:', error);
        // Optionally send an error message back to the client
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Client connection error:', error);
    });
  });

  /**
   * Broadcasts data to all connected clients.
   * @param {any} data The data to broadcast (will be JSON.stringify'd).
   */
  const broadcast = (data) => {
    const msg = JSON.stringify(data);
    console.log('[WebSocket] Broadcasting ->', msg);
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(msg, (err) => {
          if (err) {
            console.error('[WebSocket] Broadcast error:', err);
          }
        });
      }
    });
  };

  // Return the broadcast function so it can be used externally
  return { broadcast };
}

export { setupWebSocket };

