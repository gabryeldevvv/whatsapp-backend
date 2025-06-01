function extractMessageContent(msg) {
  return msg?.conversation 
    || msg?.extendedTextMessage?.text 
    || (msg?.imageMessage ? '[Imagem]' : '[Mídia]');
}

export { extractMessageContent };
