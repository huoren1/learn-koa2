const Oauth2Server = require('node-oauth2-server')
const oauthserver = new Oauth2Server({
  model: require('../server/model'),
  grants: ['authorization_code', 'password'],
  debug: true
})
const router = require('koa-router')()

router.post('/auth/token', async (ctx) => {
  try {
    const { code } = ctx.request.body;
    const token = await require('../server/model').getToken(code);
    ctx.body = token;
  } catch (err) {
    ctx.status = err.code || 500;
    ctx.body = { error: err.message };
  }
});

router.get('/auth/authorize', async (ctx) => {
  try {
    const { clientId, redirectUri, responseType } = ctx.query;
    const client = await require('../server/model').getClient(clientId);

    // 假设用户已经登录，这里只是模拟
    const user = { id: 'user@example.com', username: 'user' };

    // 根据授权类型处理
    if (responseType === 'code') {
      // 生成授权码（这里只是简单示例，实际应更安全地生成）
      const authorizationCode = 'some-authorization-code';
      // 存储授权码与客户端、用户、重定向URI的关联（实际应存储在数据库中）
      // ...

      // 重定向到客户端的重定向URI，并附带授权码
      ctx.redirect(`${redirectUri}?code=${authorizationCode}`);
    } else {
      ctx.status = 400;
      ctx.body = 'Unsupported response_type';
    }
  } catch (err) {
    ctx.status = err.code || 500;
    ctx.body = { error: err.message };
  }
});

module.exports = router
