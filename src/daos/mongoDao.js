import mongoose from "mongoose";
import dotenv from "dotenv"
import productSchema from "../model/productModel.js";
import cartSchema from "../model/cartModel.js";
import sessionSchema from "../model/sessionModel.js";
import orderSchema from "../model/orderModel.js";
dotenv.config()

const uli = process.env.DB_ULI

//Modelo de productos
const productDb = mongoose.model('products', productSchema)

//Modelo de carts
const cartDb = mongoose.model('cart', cartSchema)

//Modelo de session
const sessionDb = mongoose.model('session', sessionSchema)

//Modelo de orden de compra
const orderDb = mongoose.model('orders', orderSchema)

await mongoose.connect(uli)

export{
    productDb,
    cartDb,
    sessionDb,
    orderDb
}
