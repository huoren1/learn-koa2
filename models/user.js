const mongoose = require('mongoose')
const moment = require('moment')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // 唯一，否则报错
    // uppercase: true, // 转大写
    // lowercase: true, // 转小写
    // trim: true, // 去首尾空白字符
    minLength: 4,
    maxlength: 16,
    // enum: ['', ''], // 给定枚举值
    match: /^[a-zA-Z0-9_-]{4,16}$/, // 用户名长度为3到16个字符，可以包含字母、数字、下划线和连字符
  },
  age: {
    type: Number,
    max: 200,
    min: 0,
    // enum: [10, 100], // 给定枚举值
  },
  password: {
    type: String,
    default: '123456',
    match: /^[a-zA-Z0-9_-]{4,16}$/, // 用户名长度为3到16个字符，可以包含字母、数字、下划线和连字符
  },
  _createTime: {
    type: Date,
    default: new Date()
  },
  _salt: {
    type: Number,
    default: 10
  },
}, {
  statics: {
    findByName(name) {
      return this.find({ name });
    }
  },
  methods: {
    isExist: async function () {
      const { name, password } = this
      const res = await this.model('testusers').find({ name, password })
      return !!res.length
    }
  }
})

// 定义静态属性、方法
function findUserByName(name) {
  return this.find({ name: { $eq: name } })
}
userSchema.statics.findByName2 = findUserByName
userSchema.static('findByName3', findUserByName)
userSchema.static({ findByName4: findUserByName })

// 登录前校验用户名是否存在及密码是否匹配
userSchema.statics.checkNameAndPassword = async function (name, password) {
  const userRes = await this.findOne({ name })
  if (userRes) {
    const match = await bcrypt.compare(password, userRes.password)
    if (match) {
      return userRes
    } else {
      return {
        code: -1,
        msg: '用户名或密码不正确'
      }
    }
  } else {
    return {
      code: -1,
      msg: '用户名或密码不正确'
    }
  }
}

userSchema.methods.isExist2 = async function () {
  const res = await this.constructor.findByName(this.name)
  return !!res.length
}

userSchema.method('isExist3', async function () {
  const res = await this.constructor.findByName(this.name)
  return !!res.length
})

// 虚拟属性
userSchema.virtual('createTime').get(function (value, virtual, doc) {
  return moment(this._createTime).format('YYYY-MM-DD HH:mm:ss')
})

// 配置模式以包含虚拟属性在toJSON中，使得查询结果中会包含虚拟属性
userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });

// 钩子
userSchema.pre('save', function (next) {
  const that = this
  bcrypt.genSalt(this._salt, function (err, salt) {
    bcrypt.hash(that.password, salt, function (err, hash) {
      that.password = hash
      return next()
    })
  })
})

const UserModel = mongoose.model('testusers', userSchema)


module.exports = UserModel
