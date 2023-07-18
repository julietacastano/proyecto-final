import { cartDb } from './mongoDao.js';
import { productDb } from './mongoDao.js';

class Carts{
    constructor(model){
        this.model=model
    }

    //Muestra carritos-------------------------------------------
    async getCarts(cartId){
        const cart = await this.model.findById(cartId).populate('products').lean()
        if(!cart){ 
        return {error:"No se encontro el carrito pedido"}
        }
        
        return cart
    }

    //Crea carrito----------------------------------------------------------
    async createCart(){
        const newCart = await this.model.create({
            products:[],
        })
        return newCart
    }

    //Agregar producto al carrito ---------------------------------------
    async addToCart(idCart, idProd){
        //Encuentro carrito y lo valido 
        const findCartId = await this.model.findById(idCart)
        if(!findCartId){return {error:"El carrito no existe"}}

        //Encuentro prod y lo valido
        const findProdId = await productDb.findById(idProd)
        if(!findProdId){return {error:"El producto no existe"}}

        const prodFound = findCartId.products.find(el => {
            if(el._id.toString() ===  idProd.toString()){
            return true
            }
        })
        if(prodFound){
            return {repetido: 'El producto ya fue agregado, para modificar la cantidad hacelo desde el carrito'}
        }


        await findCartId.products.push({_id:idProd})
        await this.model.replaceOne({_id:idCart},findCartId)

        return findCartId


    }

    //Eliminar productos del carrito--------------------------------------------------
    async deleteProduct(idCart, idProd){
        const findCartId = await this.model.findById(idCart)
        if(!findCartId){return {error:"No se encontro el carrito pedido"}}

        const findProdId = await productDb.findById(idProd)
        if(!findProdId){return {error:"el producto no existe"}}

        const nuevoCarrito  = []
        const productos = findCartId.products
    
        for(let i=0; i<productos.length; i++){
            let id = productos[i]._id

            if(id.toString() !==  idProd.toString()){
                let prodEncontrado = await productDb.findById(id).lean()
                nuevoCarrito.push(prodEncontrado)
            }
        }
        // console.log(nuevoCarrito)
        
        await this.model.findByIdAndUpdate(findCartId, {products:nuevoCarrito})
        // console.log(carritoActualizado)
        
        return {succes:'Producto eliminado con exito'}

    } 

    //Vaciar Carrito --------------------------------------------------------------------
    async vaciarCarrito(idCart){
        const findCartId = await this.model.findById(idCart)
        if(!findCartId){return {error:"No se encontro el carrito pedido"}}

        const productos = findCartId.products
        const length = productos.length

        const carritoVacio = productos.splice(length)

        await this.model.findByIdAndUpdate(findCartId, {products:carritoVacio})

        return {succes:'Productos eliminados'}

    }

    async sumarCantidad(idCart, idProd){
        const findCartId = await this.model.findById(idCart)
        if(!findCartId){return {error:"No se encontro el carrito pedido"}}

        const findProdId = await productDb.findById(idProd)
        if(!findProdId){return {error:"el producto no existe"}}
        // console.log(findProdId.stock)

        const productos = findCartId.products

        const prodFound = productos.find(el => el._id.toString() ===  idProd.toString())
        if(prodFound.quantity >= findProdId.stock){
            return {error:'No hay mas stock disponible para agregar'}
        }
        prodFound.quantity += 1 
        // console.log(productos)

        await this.model.findByIdAndUpdate(findCartId, {products:productos})

        return {succes:'Cantidad actualizada'}

    }
    async restarCantidad (idCart, idProd){
        const findCartId = await this.model.findById(idCart)
        if(!findCartId){return {error:"No se encontro el carrito pedido"}}

        const productos = findCartId.products

        const prodFound = productos.find(el => el._id.toString() ===  idProd.toString())
        if(prodFound.quantity <= 1){
            return {error:'No es posible tener una cantidad menor a 1'}
        }
        prodFound.quantity -= 1 
        //console.log(productos)

        await this.model.findByIdAndUpdate(findCartId, {products:productos})

        return {succes:'Cantidad actualizada'}
    }
}

const cartsDao = new Carts(cartDb)

export default cartsDao