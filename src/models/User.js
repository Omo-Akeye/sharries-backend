import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: Number, required: true, unique: true },
  password: { type: String, required: true },
  totalSpent: { type: Number, default: 0 },
  totalPurchases: { type: Number, default: 0 },
  orderHistory: [{
    orderID: { type: String, required: true }, 
    orderDate: { type: Date, default: Date.now },
    cartItems: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
      src: { type: String, required: true },
      subTotal: { type: Number, required: true },
      _id: { type: String, required: true },
    }],
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    }
  }]
});

userSchema.methods.calculateTotalSpent = function() {
  return this.orderHistory.reduce((total, order) => total + order.totalAmount, 0);
};

userSchema.pre('save', function(next) {
  if (this.isModified('orderHistory')) {
    this.totalSpent = this.calculateTotalSpent();
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
