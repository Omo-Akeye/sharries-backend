import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    userID:{type: String, required: false},
    name:{type: String, required: true},
    email:{type: String, required: true},
    phoneNumber:{type: Number, required: true},
    additionalNote:{type: String, required: false},
    shippingFee:{type: Number, required: true},
    shippingAddress:{type: String, required: true},
    orderID:{type: String, required: true},
    paymentMethod:{type: String, required: true},
    paymentStatus:{type: String, required: true},
    orderStatus:{type: String, required: true},
    dateCreated: { type: Date, default: Date.now },  
    estimatedDeliveryDate: { 
      type: Date, 
      default: function() {
        const date = new Date(this.dateCreated);
        date.setDate(date.getDate() + 3);
        return date;
      }
    },
    cartItems: [
        {
          name: { type: String, required: true },
          price: { type: Number, required: true },
          quantity: { type: Number, required: true },
          src: { type: String, required: true },
          subTotal: { type: Number, required: true },
          _id: { type: String, required: true },
        },
      ],
})

const Order = mongoose.model("Order", OrderSchema);
export default Order; 
