const mongoose = require('mongoose')

const productSchma = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  price: {
    type: Number,
    require: true,
    min:0
  },
  category: {
    type: String,
    lowercase: true,
    enum: ['fruit', 'vegetable', 'dairy']
  }
})

const Product = mongoose.model('Product', productSchma)

module.exports = Product