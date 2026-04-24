import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/ecommerce")
.then(() => console.log("MongoDB Connected Successfully"))
.catch((err) => console.log(err));

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},

});

const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    stock: Number,
});

const cartSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    item: {
        product_id: mongoose.Schema.Types.ObjectId,
        

    }
})