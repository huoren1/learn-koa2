const router = require('koa-router')()
const jwt = require('jsonwebtoken')
const axios = require('axios')
const { totp } = require('otplib')
const svgCaptcha = require('svg-captcha')
const path = require('path')
const User = require('../models/user')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.post('/api/login', async function (ctx, next) {
  const req = ctx.request.body
  const token = jwt.sign(
    { name: req.name }, // payload
    "JWT_SECRET", // secret
    { expiresIn: 60 * 60 } // 60 * 60 s
  );
  const checkRes = await User.checkNameAndPassword(req.name, req.password)
  if (checkRes.code !== -1) {
    return ctx.body = {
      code: 1,
      message: "登录成功",
      data: {
        token,
        ...checkRes
      }
    };
  } else {
    return ctx.body = checkRes
  }
})

router.post('/public/save', async (ctx, next) => {
  const { name, password } = ctx.request.body
  if (name?.length === 0) {
    return ctx.body = {
      success: false,
      msg: '用户名不可为空！'
    }
  }
  // const findRes = await User.find({ name })
  // if (findRes?.length) {
  //   return ctx.body = {
  //     success: false,
  //     msg: '用户名已经存在，请勿重复添加'
  //   }
  // }
  const user = new User({
    name,
    password
  })

  const isExist = await user.isExist3()
  if (isExist) {
    return ctx.body = {
      success: false,
      msg: '用户名已经存在，请勿重复添加'
    }
  }

  const userInfo = await user.save()
  ctx.body = {
    success: true,
    userInfo
  }
})

const clientId = 'client1';
const clientSecret = 'secret1';
const redirectUri = '/api/callback';
const authorizeUrl = '/auth/authorize';
const tokenUrl = 'http://localhost:3001/auth/token';

router.get('/api/third/login', async (ctx) => {
  const authUrl = `${authorizeUrl}?responseType=code&clientId=${clientId}&redirectUri=${redirectUri}`;
  ctx.redirect(authUrl);
});

router.get('/api/callback', async (ctx) => {
  try {
    const { code } = ctx.query;
    const response = await axios.post(tokenUrl, { code });
    ctx.body = response.data;
  } catch (error) {
    ctx.body = error.response.data;
  }
});

router.get('/api/test', async (ctx, next) => {
  ctx.body = 'koa2 test'
})


router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

const client_id = '00c9ec3565fbcac710267e587760b06fb94990c7f56ea9765bceabac2043c788'
const client_secret = 'd0ac8e648ff32298f59eebec1b9bceee8818fef33cdc9aff062f04dd3183602f'
const redirect_uri = 'http://localhost:8088/api/gitee/callback'

router.get('/api/gitee/login', (ctx) => {
  const authUrl = `https://gitee.com/oauth/authorize?client_id=${client_id}&response_type=code&redirect_uri=${redirect_uri}`;
  ctx.body = { authUrl };
});

router.get('/api/gitee/callback', async (ctx) => {
  try {
    const { code } = ctx.query;
    console.log("🚀 ~ router.get ~ code:", code)
    const params = {
      grant_type: 'authorization_code',
      client_id,
      client_secret,
      redirect_uri,
      code
    }
    const response = await axios.post('https://gitee.com/oauth/token', params);
    const { access_token } = response.data;
    const userInfo = await axios.get('https://gitee.com/api/v5/user?access_token=' + access_token);
    // 渲染页面
    ctx.body = `
      <h1>Hello ${userInfo.data.login}</h1>
      <img src="${userInfo.data.avatar_url}" alt="">
    `
  } catch (error) {
    ctx.body = error.response.data;
  }
});

// 生成验证码
router.get('/public/getverifycode', (ctx) => {
  // 读取手机号或邮箱等信息作为密钥
  const { secret } = ctx.query
  const verifyCode = totp.generate(secret)
  console.log("🚀 ~ router.get ~ verifyCode:", verifyCode)
  ctx.body = { verifyCode }
});

// 校验验证码
router.get('/public/checkverifycode', (ctx) => {
  const { verifyCode, secret } = ctx.query
  const isValid = totp.verify({
    secret,
    token: verifyCode,
  })
  ctx.body = { isValid }
});

// 自定义字体
svgCaptcha.loadFont(path.resolve(__dirname, '../public/fonts/mini-circle.ttf'))
const chineseChars = '的一是不了我他她它你们来到时要上下说要下雨天气好坏冷热风云雪雷电水火山石田土木';

// 生成图片验证码
router.get('/public/getsvgcode', (ctx) => {
  const captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    fontSize: 40, // 验证码字体大小
    width: 120, // 验证码图片宽度
    height: 40, // 验证码图片高度
    // charPreset: chineseChars, // 自定义字符集
    // ignoreChars: '0o1li', // 验证码字符中需要排除的字符
    // color: true, // 启用颜色
    // noise: 2, // 干扰线条的数量
    background: '#cc9966' // 背景颜色
  });

  // 保存生成的验证码结果到会话中
  ctx.session.code = captcha.text.toLowerCase();

  // 设置响应头并返回验证码图片
  ctx.response.type = 'image/svg+xml';
  ctx.body = captcha.data;
});

// 校验图片验证码
router.post('/public/checksvgcode', (ctx) => {
  const { inputCode } = ctx.request.body
  const isValid = inputCode && inputCode.toLowerCase() === ctx.session.code
  ctx.body = { isValid }
});

module.exports = router
