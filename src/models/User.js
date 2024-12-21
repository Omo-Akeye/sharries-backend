import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber:{type:Number,required:true,unique:true},
  password: { type: String, required: true },
  totalPurchases: {  type: Number, default: 0 },
  orderHistory: [{
    orderDate: { type: Date, default: Date.now },
    cartItems: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        src: { type: String, required: true },
        subTotal: { type: Number, required: true },
        _id: { type: String, required: true },
      }
    ],
    totalAmount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['Pending', 'Processed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    }
  }]
});

const User = mongoose.model('User', userSchema);
export default User;
