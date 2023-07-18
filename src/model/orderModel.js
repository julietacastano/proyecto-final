import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    name:{type: String, require:true},
    email:{type: String, require:true},
    address:{type: String, require:true},
    tel:{type:Number, require:true},
    created: Date,   
    products:{type:[
        {
            product:{
                type: mongoose.Schema.ObjectId,
                ref:'products',
            },      
            quantity:{type:Number},      
        }
    ]},
})

export default orderSchema