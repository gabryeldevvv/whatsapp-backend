import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import { handleChatsSet, handleMessagesUpsert } from '../controllers/connectionController.js';

// Store the socket instance at the module level
let sockInstance = null;
let localBroadcast = null; // Store broadcast function locally

/**
 * Connects to WhatsApp, sets up event listeners, and stores the socket instance.
 * @param {Function} broadcast Function to broadcast messages via WebSocket.
 */
async function connectToWhatsApp(broadcast) {
  if (!broadcast) {
    throw new Error('Broadcast function must be provided to connectToWhatsApp');
  }
  localBroadcast = broadcast; // Store for use in event handlers

  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  console.log('[Service] Creating WA Socket...');
  sockInstance = makeWASocket({
    auth: state,
    printQRInTerminal: false, // We'll send QR via WebSocket
    syncFullHistory: true,
    logger: console, // Use console for Baileys logging (optional, can be pino)
    // browser: ['My App', 'Chrome', '1.0'] // Optional browser description
  });

  // Event listener for connection updates
  sockInstance.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) {
      console.log('[Service] QR Code received, generating...');
      qrcode.generate(qr, { small: true }); // Still log to terminal for debugging
      localBroadcast({ type: 'qr', data: qr });
      localBroadcast({ type: 'status', data: 'QR Code Received. Scan please!' });
    }
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error instanceof Boom) && lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut;
      const reason = lastDisconnect?.error?.output?.payload?.error || 'Unknown Reason';
      console.error(`[Service] Connection closed due to ${reason}, reconnecting: ${shouldReconnect}`);
      localBroadcast({ type: 'status', data: `Connection Closed: ${reason}. Reconnecting: ${shouldReconnect}` });
      if (shouldReconnect) {
        connectToWhatsApp(localBroadcast); // Reconnect with the same broadcast function
      }
    } else if (connection === 'open') {
      console.log('[Service] Connection opened!');
      localBroadcast({ type: 'status', data: 'WhatsApp Connected!' });
    }
  });

  // Event listener for chat updates
  sockInstance.ev.on('chats.set', ({ chats }) => {
    console.log('[Service] Received chats.set event');
    try {
      const formattedChats = handleChatsSet(chats);
      localBroadcast({ type: 'full_chats', data: formattedChats });
    } catch (error) {
      console.error('[Service] Error processing chats.set:', error);
    }
  });

  // Event listener for new messages
  sockInstance.ev.on('messages.upsert', ({ messages }) => {
    console.log('[Service] Received messages.upsert event');
    try {
      const formatted = handleMessagesUpsert(messages);
      if (formatted && formatted.length > 0) {
        localBroadcast({ type: 'new_messages', data: formatted });
      }
    } catch (error) {
      console.error('[Service] Error processing messages.upsert:', error);
    }
  });

  // Event listener for credential updates
  sockInstance.ev.on('creds.update', saveCreds);

  console.log('[Service] WA Socket event listeners attached.');
  // Return the socket instance if needed elsewhere, though using module-level is simpler here
  // return sockInstance;
}

/**
 * Sends a text message to a specific chat ID.
 * @param {string} chatId The recipient's JID (e.g., 'xxxxxxxxxx@s.whatsapp.net').
 * @param {string} content The text message content.
 * @returns {Promise<void>} A promise that resolves when the message is sent.
 */
async function sendMessage(chatId, content) {
  if (!sockInstance) {
    console.error('[Service] Cannot send message: WhatsApp socket is not initialized.');
    throw new Error('WhatsApp not connected');
  }
  if (!chatId || !content) {
    console.error('[Service] Cannot send message: Invalid chatId or content.');
    throw new Error('Invalid chatId or content');
  }

  try {
    console.log(`[Service] Sending message to ${chatId}: "${content}"`);
    await sockInstance.sendMessage(chatId, { text: content });
    console.log(`[Service] Message successfully sent to ${chatId}`);
  } catch (error) {
    console.error(`[Service] Error sending message to ${chatId}:`, error);
    throw error; // Re-throw the error to be caught by the caller in index.js
  }
}

export { connectToWhatsApp, sendMessage };

