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

app.post("/user", async (req, resp) => {
    const user = await User.create(req.body);
    resp.json(user);
});

app.post("/product", async (req, resp) => {
    const product = await Product.create(req.body);
    resp.json(product);
});

app.post("/addtocart", async (req, resp) => {
    const { userId, productId, quantity } = req.body;
    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({
            userId,
            items: ({ productId, quantity }),
        });
    } else {
        cart.items.push({ productId, quantity });
        await cart.save();
    }
    resp.send("Add to cart");
});

app.post("/placeorder", async(req, resp) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const {userId} = req.body;
        const cart = await cart.findOne({userId}.session(session));
        if(!cart) throw new Error("Cart is Empty");

        let total=0;
        for(let item of cart.items){
            const product = await Product.findById(items.productId).session(session);
            if(!product || product.stock < item.quantity){
                throw new Error ("Stock Out");
            }
            product.stock -= item.quantity;
            await product.save({session});
            total += product.price*item.quantity;
        }
        const order = await Order.create(
            [
                {
                    userId, 
                    items: cart.items,
                    totalAmount: total,
                    status: "Order Placed",
                },   
            ],
            {session},
        );
        await Cart.deleteOne({userId}).session(session);
        await session.commitTransaction();
        resp.json(order);
    } catch(err){
        await session.shortTransaction();
        resp.status(500).send(err.message);
    } finally{
        session.endSession();
    }
});

app.get("/orders/:userId", async(req, resp) => {
    const orders = await Order.find({userId: req.params.id});
    resp.json(orders);
});

app.listen(9600, () => {
    console.log("Server started on 9600");
});

