import mongoose from "mongoose"
import mongoosePaginate from "mongoose-paginate-v2"

const productSchema = new mongoose.Schema({
    titulo:{type: String, require:true, trim:true},
    descripcion:{type: String, require:true},
    precio: {type:Number, require:true},
    codigo:{type:String, require:true},
    stock:{type:Number, require: true},
    categoria:{type:String, require:true},
    img:{type:String},
    owner:{type:String, require:true}
})
productSchema.plugin(mongoosePaginate)

export default productSchema