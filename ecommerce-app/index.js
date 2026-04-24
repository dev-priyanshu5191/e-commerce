import express from "express";
import mongoose, { mongo } from "mongoose";

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/ecommerce")
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
});

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
});

const cartSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    items: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            quantity: Number,
        },
    ],
});

const orderSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    items: Array,
    totalAmount: Number,
    status: String,
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Cart = mongoose.model("Cart", cartSchema);
const Order = mongoose.model("Order", orderSchema);

app.post("/user", async(req, resp) => {
    const user = await User.create(req.body);
    resp.json(user);
});

app.post("/product", async(req, resp) => {
    const product = await Product.create(req.body);
    resp.json(product);
});

app.post("/addtocart", async(req, resp) => {
    const {userId, productId, quantity} = req.body;
    let cart = await Cart.findOne({userId});
    if(!cart){
        cart = await Cart.create({
            userId,
            items: ({productId, quantity}),
        });
    } else{
        cart.items.push({productId, quantity});
        await cart.save();
    }
});
