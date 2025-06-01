import { connectToWhatsApp } from './services/whatsappService.js';
import { setupWebSocket } from './config/websocket.js';

global.broadcast = setupWebSocket(8080);

connectToWhatsApp().catch(console.error);