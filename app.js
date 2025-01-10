const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const jwt = require('koa-jwt')
const session = require('koa-session')

const index = require('./routes/index')
const users = require('./routes/users')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

app.keys = ['some secret hurr']; // 用于加密会话
app.use(session({
  key: 'koa:sess', // 这个key的名称可以随便写
  maxAge: 86400000, // session的有效期, 单位毫秒
  autoCommit: true, // 自动提交到响应头
  overwrite: true, // 是否允许覆盖
  httpOnly: true, // 设置cookie是否只允许在http(s)请求中使用，提高安全性
  signed: true, // 默认签名
  rolling: false, // 在每次请求时更新session的失效时间
  renew: false,  // 更新session时重置session失效时间
}, app))

app.use(jwt({ secret: 'JWT_SECRET' }).unless({ path: [/^\/public/, /\/login/, /\/callback/, /\.ico$/] }));

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app

// 连接数据库
const mongoose = require('mongoose')

const isDev = process.env.NODE_ENV === "development";
isDev && mongoose.set('debug', true) // 开发环境开启调试模式

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/zq');
}
main().catch(err => {
  console.log("🚀 ~ MongoDB connected failed ~  🚀", err)
})
