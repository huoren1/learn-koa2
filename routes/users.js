const router = require('koa-router')()
const User = require('../models/user')
router.prefix('/api/users')

router.get('/delete', async (ctx, next) => {
  const deleteRes = await User.deleteMany({ name: 'zhang' })
  ctx.body = deleteRes
})

router.get('/update', async (ctx, next) => {
  const updateRes = await User.updateMany({ name: 'zhang' }, { name: '222222' })
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
