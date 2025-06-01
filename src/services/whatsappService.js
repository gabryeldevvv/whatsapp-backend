import { useMultiFileAuthState, makeWASocket } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import { handleChatsSet, handleMessagesUpsert } from '../controllers/connectionController.js';

async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info');

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    syncFullHistory: true
  });

  sock.ev.on('connection.update', (update) => {
    if (update.qr) {
      qrcode.generate(update.qr, { small: true });
      broadcast({ type: 'qr', data: update.qr });
    }
    if (update.connection === 'open') {
      broadcast({ type: 'status', data: 'Conectado!' });
    }
  });

  sock.ev.on('chats.set', ({ chats }) => {
    const formattedChats = handleChatsSet(chats);
    broadcast({ type: 'full_chats', data: formattedChats });
  });

  sock.ev.on('messages.upsert', ({ messages }) => {
    const formatted = handleMessagesUpsert(messages);
    broadcast({ type: 'new_messages', data: formatted });
  });

  sock.ev.on('creds.update', saveCreds);
}

export { connectToWhatsApp };
