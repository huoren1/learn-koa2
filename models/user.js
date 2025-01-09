const mongoose = require('mongoose')

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
    required: true,
    default: '123456',
    match: /^[a-zA-Z0-9_-]{4,16}$/, // 用户名长度为3到16个字符，可以包含字母、数字、下划线和连字符
  },
  createTime: {
    type: Date
  },
}, {
  statics: {
    findByName(name) {
      return this.find({ name: new RegExp(name, 'i') });
    }
  },
  methods: {
    isExist(cb) {
      const { name, password } = this
      return this.model('testusers').find({ name, password }, cb).length
    }
  }
})

// 定义静态属性、方法
function findUserByName(name) {
  return this.find({ name })
}
userSchema.statics.findByName2 = findUserByName
userSchema.static('findByName3', findUserByName)
userSchema.static({ findByName4: findUserByName })

const UserModel = mongoose.model('testusers', userSchema)


module.exports = UserModel
