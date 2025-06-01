import  { extractMessageContent } from '../utils/messageUtils.js';
import  { formatTimestamp, formatBytes } from '../utils/formatUtils.js';
import  { getCachedUser } from '../cache/userCache.js';

function handleChatsSet(chats) {
  return chats.map(chat => {
    const sender = getCachedUser(chat.id);
    if (chat.name) sender.name = chat.name;

    return {
      id: chat.id,
      sender,
      messages: chat.messages 
        ? Array.from(chat.messages.values()).map(msg => ({
            id: msg.key.id,
            content: extractMessageContent(msg.message),
            timestamp: formatTimestamp(msg.messageTimestamp),
            unread: !msg.key.fromMe && !msg.userReceipt?.read,
            sender: msg.key.fromMe ? 'You' : sender,
            attachment: msg.message?.documentMessage && {
              fileName: msg.message.documentMessage.fileName,
              type: msg.message.documentMessage.mimetype.split('/')[1],
              size: formatBytes(msg.message.documentMessage.fileLength)
            }
          }))
        : []
    };
  });
}

function handleMessagesUpsert(messages) {
  return messages.map(msg => ({
    chatId: msg.key.remoteJid,
    message: {
      id: msg.key.id,
      content: extractMessageContent(msg.message),
      timestamp: formatTimestamp(msg.messageTimestamp),
      unread: !msg.key.fromMe,
      sender: msg.key.fromMe ? 'You' : getCachedUser(msg.key.remoteJid),
      attachment: msg.message?.documentMessage && {
        fileName: msg.message.documentMessage.fileName,
        type: msg.message.documentMessage.mimetype.split('/')[1],
        size: formatBytes(msg.message.documentMessage.fileLength)
      }
    }
  }));
}

export { handleChatsSet, handleMessagesUpsert };
