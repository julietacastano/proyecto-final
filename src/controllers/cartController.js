import cartsDao from "../daos/cartsDao.js";
import { productDb } from "../daos/mongoDao.js";
import productDao from "../daos/productDao.js";
import sessionDao from "../daos/sessionDao.js";

//Mostrar carrito vacio-----------------------------------------------------------------------------------
const getEmptyCart = async(req,res)=>{
    if(!req.user.carrito){
        const newCart = await cartsDao.createCart()
        const userId = req.user._id.toString()
        await sessionDao.findAndUpdateCarrito(userId,newCart)
        
        return res.redirect(`/api/carts/${newCart._id}`)
    }


    res.status(200).render('cart',{
        nombrePagina:'Carrito',
        usuario:req.user,
        admin: req.user?.rol !== 'user' ? true : false,    })
}

//Muestra carrito ---------------------------------------------------------------------------------------
const getCart = async (req,res)=>{
    if(!req.user.carrito){
        const newCart = await cartsDao.createCart()
        const userId = req.user._id.toString()
        await sessionDao.findAndUpdateCarrito(userId,newCart)
        
        return res.render('cart',{
            nombrePagina:'Carrito',
            usuario:req.user,
            admin: req.user?.rol !== 'user' ? true : false,        })
    }

    const cart = await cartsDao.getCarts(req.params.cid) 
    const prodsCarrito = []
    let valorTotal = 0
    const productos = cart.products

    for(let i=0; i<productos?.length; i++){
        let id = productos[i]._id
        let quan = productos[i].quantity
        let prodEncontrado = await productDb.findById(id).lean()
        let precioAcc = (prodEncontrado.precio * quan)

        if(quan <= prodEncontrado.stock){
            let prod = {...prodEncontrado, quantity:quan, precioAcc:precioAcc}
    
            prodsCarrito.push(prod)
            valorTotal += (prodEncontrado.precio * quan)
        }else{
            await cartsDao.deleteProduct(cart, id)
        }

    }

    const msg = req.flash('message')
    const err = req.flash('error')
    res.status(200).render('cart',{
        nombrePagina:'Carrito',
        usuario:req.user,
        admin: req.user?.rol !== 'user' ? true : false,
        carrito: cart,
        productos:prodsCarrito,
        totalProds:prodsCarrito.length,
        valorTotal,
        err,
        msg
    })
}

//Agrega productos al carrito ----------------------------------------------------------------------------
const addProdToCart = async (req,res)=>{
    if(!req.user.carrito){
        console.log('hasta aca')
        //Crear el carrito
        const newCart = await cartsDao.createCart()
        const userId = req.user._id.toString()
        await sessionDao.findAndUpdateCarrito(userId,newCart)
        
        //Agrego el producto
        await cartsDao.addToCart(newCart._id ,req.params.pid)

        req.flash('message', 'El producto se agrego con exito')
        return res.status(200).redirect(`/api/products/${req.params.pid}`)
    }

    //Los premium no pueden agregar productos propios
    const id = req.params.pid
    const producto = await productDao.getProductById(id)
    if(req.user.rol == 'premium'){
        const owner = req.user.email
        const prodOwner = producto.owner
        if(owner === prodOwner){
            req.logger.error('No es posible agregar productos propios al carrito')
            req.flash('error', 'No es posbile agregar productos propios al carrito')
            return res.status(404).redirect('/api/products')
        }  
    }

    //El carrito ya esta creado / Paso a agregar producto
    const carritoUsuario = req.user.carrito
    const carrito = await cartsDao.addToCart(carritoUsuario ,req.params.pid)

    //Existia otro carrito, lo reemplazo cuando agrego un producto
    if(carrito.error){
        const newCart = await cartsDao.createCart()
        const userId = req.user._id.toString()
        await sessionDao.findAndUpdateCarrito(userId,newCart)
        
        //Agrego el producto
        await cartsDao.addToCart(newCart._id ,req.params.pid)
        req.flash('message', 'El producto se agrego con exito')
        return res.status(200).redirect(`/api/products/${req.params.pid}`)
    }

    // Producto repetido
    if(carrito.repetido){
        req.logger.error(`${carrito.repetido}`)
        req.flash('error', `${carrito.repetido}`)
        return res.status(404).redirect(`/api/products/${req.params.pid}`)
    }

    //Todo ok
    req.flash('message', 'El producto se agrego con exito')
    return res.status(200).redirect(`/api/products/${req.params.pid}`)

}

//Emilina productos al carrito -------------------------------------------------
const deleteProdCart = async(req, res) => {
    const carritoUsuario = req.user.carrito
    if(!carritoUsuario){
        req.logger.error('No se encontro el carrito solicitado')
        req.flash('error', 'No se encontro el carrito solicitado')
        return res.status(404).redirect('/api/products')
    }

    const prodDeleteCart = await cartsDao.deleteProduct(carritoUsuario, req.params.pid)

    if(prodDeleteCart.error){
        req.logger.error(`${prodDeleteCart.error}`)
        req.flash('error', `${prodDeleteCart.error}`)
        res.status(403).send('Error')
    }
    
    req.flash('message', `${prodDeleteCart.succes}`)
    res.status(200).send(`${prodDeleteCart.succes}`)
}

//Vaciar Carrito ----------------------------------------------------------------------------------------
const vaciarCart = async(req,res) => {
    const carritoUsuario = req.user.carrito
    if(!carritoUsuario){
        req.logger.error('No se encontro el carrito solicitado')
        req.flash('error', 'No se encontro el carrito solicitado')
        return res.status(404).redirect('/api/products')
    }

    const vaciarCarrito = await cartsDao.vaciarCarrito(carritoUsuario, req.params.pid)

    
    if(vaciarCarrito.error){
        req.logger.error(`${vaciarCarrito.error}`)
        req.flash('error', `${vaciarCarrito.error}`)
        res.status(403).send('Error')
    }
    
    req.flash('message', `${vaciarCarrito.succes}`)
    res.status(200).send(`${vaciarCarrito.succes}`)


}

//Manejar cantidades
const sumarQuantity = async (req,res) => {
    const carritoUsuario = req.user.carrito
    if(!carritoUsuario){
        req.logger.error('No se encontro el carrito solicitado')
        req.flash('error', 'No se encontro el carrito solicitado')
        return res.status(404).redirect('/api/products')
    }

    const carritoActualizado = await cartsDao.sumarCantidad(carritoUsuario, req.params.pid)
    
    if(carritoActualizado.error){
        req.logger.error(`${carritoActualizado.error}`)
        req.flash('error', `${carritoActualizado.error}`)
        res.status(403)
    }
    res.status(200).send(`${carritoActualizado.succes}`)

}
const restarQuantity = async (req,res) => {
    const carritoUsuario = req.user.carrito
    if(!carritoUsuario){
        req.logger.error('No se encontro el carrito solicitado')
        req.flash('error', 'No se encontro el carrito solicitado')
        return res.status(404).redirect('/api/products')
    }

    const carritoActualizado = await cartsDao.restarCantidad(carritoUsuario, req.params.pid)

    if(carritoActualizado.error){
        req.logger.error(`${carritoActualizado.error}`)
        req.flash('error', `${carritoActualizado.error}`)
        res.status(403)
    }
    res.status(200).send(`${carritoActualizado.succes}`)
}

//Resumen -----------------------------------------------------------------------------------------------
const getSummary = async (req,res) => {

    const cart = await cartsDao.getCarts(req.params.cid) 
    const prodsCarrito = []
    let valorTotal = 0
    const productos = cart.products

    for(let i=0; i<productos?.length; i++){
        let id = productos[i]._id
        let quan = productos[i].quantity
        let prodEncontrado = await productDb.findById(id).lean()
        let precioAcc = (prodEncontrado.precio * quan)

        
        if(quan <= prodEncontrado.stock){
            let prod = {...prodEncontrado, quantity:quan, precioAcc:precioAcc}
    
            prodsCarrito.push(prod)
            valorTotal += (prodEncontrado.precio * quan)
        }else{
            await cartsDao.deleteProduct(cart, id)

        }

    }

    const msg = req.flash('message')
    const err = req.flash('error')
    res.status(200).render('resumen',{
        nombrePagina:'Resumen de compra',
        usuario:req.user,
        name:req.user.name,
        email:req.user.email,
        carrito: cart,
        productos:prodsCarrito,
        totalProds:prodsCarrito.length,
        valorTotal,
        err,
        msg
    })
}



//Exports --------------------------------------------------------------------
export {
    getEmptyCart,
    getCart,
    addProdToCart,
    deleteProdCart,
    vaciarCart,
    sumarQuantity,
    restarQuantity,
    getSummary,
}