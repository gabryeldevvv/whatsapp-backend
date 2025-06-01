import WebSocket from 'ws';

const ws = new WebSocket('ws://localhost:3001');

ws.on('open', () => {
    console.log('✅ Conectado ao WebSocket');
});

ws.on('message', (data) => {
    const message = JSON.parse(data);
    console.log('📩 Mensagem:', message);
});

ws.on('close', () => {
    console.log('❌ WebSocket desconectado');
});