const authCodes = [];
const tokens = [
  {
    token: {
      accessToken: 'some-authorization-code'
    }
  }
];
// 内存中的客户端和用户数据（仅用于演示）
const clients = [
  {
    clientId: 'client1',
    clientSecret: 'secret1',
    grants: ['authorization_code', 'password'],
    redirectUris: '/api/callback'
  }
];

const users = [
  {
    id: 'user1',
    username: 'user1',
    password: 'password1'
  }
];

module.exports = {
  // 用户模型（内存存储，可以替换为数据库）
  getClient: (clientId, clientSecret) => {
    return new Promise((resolve, reject) => {
      const client = clients.find(c => c.clientId === clientId || c.clientSecret === clientSecret);
      if (client) {
        resolve(client);
      } else {
        reject(new Error('Invalid client'));
      }
    });
  },
  getUser: (username, password) => {
    return new Promise((resolve, reject) => {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Invalid user'));
      }
    });
  },
  saveAuthorizationCode: async (code, client, user) => {
    // 保存授权码（这里简单存储在内存中）
    authCodes.push({ code, client, user });
    return true;
  },
  getAuthorizationCode: async (code) => {
    return authCodes.find(c => c.code === code);
  },
  revokeAuthorizationCode: async (code) => {
    authCodes = authCodes.filter(c => c.code !== code);
    return true;
  },
  saveToken: async (token, client, user) => {
    // 保存令牌（这里简单存储在内存中）
    tokens.push({ token, client, user });
    return true;
  },
  getToken: async (accessToken) => {
    return tokens.find(t => t.token.accessToken === accessToken);
  },
}
