const userCache = new Map();

function getCachedUser(jid) {
  if (!userCache.has(jid)) {
    const username = jid.split('@')[0];
    userCache.set(jid, {
      name: username,
      username: `@${username}`,
      avatar: `/static/images/avatar/${Math.floor(Math.random() * 7) + 1}.jpg`,
      online: Math.random() > 0.5
    });
  }
  return userCache.get(jid);
}

export { getCachedUser };
