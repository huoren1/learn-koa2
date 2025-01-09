const router = require('koa-router')()
const User = require('../models/user')
router.prefix('/api/users')

router.post('/save', async (ctx, next) => {
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
    password,
    createTime: new Date()
  })
  if (!user.isExist) {
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

router.get('/delete', async (ctx, next) => {
  const deleteRes = await User.deleteMany({ name: '111' })
  ctx.body = deleteRes
})

router.get('/update', async (ctx, next) => {
  const updateRes = await User.updateMany({ name: '111' }, { name: '222' })
  ctx.body = updateRes
})

router.get('/find', async (ctx, next) => {
  const findRes = await User.findByName4('admin')
  ctx.body = findRes
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
