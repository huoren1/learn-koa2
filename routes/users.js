const router = require('koa-router')()
const User = require('../models/user')
router.prefix('/api/users')

router.get('/delete', async (ctx, next) => {
  const deleteRes = await User.findOneAndUpdate({ _id: ctx.query.id }, { _isDelete: true })
  ctx.body = deleteRes
})

router.post('/update', async (ctx, next) => {
  const { name, newName } = ctx.request.body
  const updateRes = await User.findOneAndUpdate({ name }, { name: newName })
  ctx.body = updateRes
})

router.get('/find', async (ctx, next) => {
  const { name, pageSize, pageNumber } = ctx.query
  const list = await User.findByName4(name)
  const totalCount = await User.countDocuments({ _isDelete: false, name: new RegExp(name, 'i') }).exec()
  const totalPages = Math.ceil(totalCount / pageSize)
  ctx.body = {
    list,
    totalCount,
    totalPages
  }
})

router.get('/getall', async (ctx, next) => {
  const { pageSize, pageNumber } = ctx.query
  const skip = pageSize * (pageNumber - 1)
  const list = await User.find({ _isDelete: false }).skip(skip).limit(pageSize).sort({ _createTime: -1 }).exec()
  const totalCount = await User.countDocuments({ _isDelete: false }).exec()
  const totalPages = Math.ceil(totalCount / pageSize)
  ctx.body = {
    list,
    totalCount,
    totalPages
  }
})

module.exports = router
