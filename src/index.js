import { connectToWhatsApp, sendMessage } from './services/whatsappService.js';
import { setupWebSocket } from './config/websocket.js';

// Callback function to handle messages received from WebSocket clients
const handleWebSocketMessage = (data, ws) => {
  console.log('[Index] Received WebSocket message:', data);
  if (data && data.type) {
    switch (data.type) {
      case 'send_message':
        if (data.payload && data.payload.chatId && data.payload.content) {
          console.log(`[Index] Request to send message to ${data.payload.chatId}`);
          // Call the sendMessage function from whatsappService
          // We need access to the 'sock' instance here, or sendMessage needs it.
          // Let's modify whatsappService to handle this internally or expose sock.
          // For now, let's assume sendMessage can access the socket.
          sendMessage(data.payload.chatId, data.payload.content)
            .then(() => {
              console.log(`[Index] Message sending initiated to ${data.payload.chatId}`);
              // Optionally send confirmation back to the specific client
              // ws.send(JSON.stringify({ type: 'message_sent_ack', payload: { id: data.payload.id } }));
            })
            .catch(error => {
              console.error(`[Index] Error sending message to ${data.payload.chatId}:`, error);
              // Optionally send error back to the specific client
              // ws.send(JSON.stringify({ type: 'message_send_error', payload: { id: data.payload.id, error: error.message } }));
            });
        } else {
          console.warn('[Index] Invalid send_message payload:', data.payload);
        }
        break;
      // Add other command types here if needed
      default:
        console.log('[Index] Unknown WebSocket message type:', data.type);
    }
  } else {
    console.warn('[Index] Received invalid WebSocket message format:', data);
  }
};

// Setup WebSocket server and get the broadcast function
const { broadcast } = setupWebSocket(8080, handleWebSocketMessage);

// Connect to WhatsApp, passing the broadcast function
// We will modify connectToWhatsApp to accept and use it, and also to make sock available
connectToWhatsApp(broadcast)
  .then(() => {
    console.log('[Index] WhatsApp Service initialized successfully.');
  })
  .catch(error => {
    console.error('[Index] Failed to initialize WhatsApp Service:', error);
    process.exit(1); // Exit if WhatsApp connection fails critically
  });

