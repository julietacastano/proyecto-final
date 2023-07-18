import { check, validationResult } from "express-validator"
import cartsDao from "../daos/cartsDao.js"
import sessionDao from "../daos/sessionDao.js";
import orderDao from "../daos/orderDao.js"
import { confirmarCompra } from "../utils/email.js"
import { productDb } from "../daos/mongoDao.js";


const checkoutSummary = async (req,res) => {
    const order = await orderDao.getOrders(req.params.oid)

    const productos = order.products
    const prodsOrden = []
    let valorTotal = 0

    for(let i=0; i<productos?.length; i++){
        let id = productos[i]._id
        let quan = productos[i].quantity
        let prodEncontrado = await productDb.findById(id).lean()
        let precioAcc = (prodEncontrado.precio * quan)
        
        let prod = {...prodEncontrado, quantity:quan, precioAcc:precioAcc}

        prodsOrden.push(prod)
        valorTotal += (prodEncontrado.precio * quan)

    }
    const {name, email, address, tel} = order

    const err = req.flash('error')
    const msg = req.flash('message')
    res.status(200).render('checkout',{
        nombrePagina: 'Compra realizada',
        usuario:req.user,
        productos: prodsOrden,
        totalProds:prodsOrden.length,
        name,
        email,
        address,
        tel,
        valorTotal,
        err,
        msg
    })

}
const checkout = async (req,res) => {
    await check('name').notEmpty().withMessage('El nombre no puede estar vacio').run(req)
    await check('email').isEmail().withMessage('Eso no es un email').run(req)
    await check('address').notEmpty().withMessage('La dirección de envío no puede estar vacia').run(req)
    await check('tel').notEmpty().withMessage('El telefono no puede estar vacio').run(req)

    let resultadoErrores = validationResult(req)
    if(!resultadoErrores.isEmpty()){
        req.logger.error(resultadoErrores.array())
        const errores = resultadoErrores.array()
        errores.forEach(el => {
            req.flash('error', `${el.msg}`)
        })
        const carrito = req.user.carrito
        return res.status(404).redirect(`/api/carts/resumen/${carrito._id}`)
    }
    

    const cart = await cartsDao.getCarts(req.params.cid)
    const {name, email, address, tel } = req.body
    const newOrder = await orderDao.createOrder(cart, name, email, address, tel)

    //Registro orden en el usuario
    const userId = req.user._id.toString()
    await sessionDao.findAndUpdateOrden(userId,newOrder)

    const prodsOrder = newOrder.products
    for(let i=0; i< prodsOrder.length; i++){
        let id = prodsOrder[i]._id
        let quantity = prodsOrder[i].quantity
        let prod = await productDb.findById(id).lean()


        let newStock = parseInt(prod.stock) - parseInt(quantity)

        await productDb.findByIdAndUpdate(id, {stock:newStock})
    }

    //Vacio el carrito utilizado
    const vaciarCarrito = await cartsDao.vaciarCarrito(cart)
    if(vaciarCarrito.error){
        req.logger.error(`${vaciarCarrito.error}`)
        req.flash('error', `${vaciarCarrito.error}`)
        return res.status(404).redirect('/api/products')
    }

    //Se envia el mail de confirmacion
    const urlCheckout = `${req.headers.host}/api/purchase/${newOrder._id}`
    confirmarCompra({
        email,
        name,
        urlCheckout
    })

    return res.status(200).redirect(`/api/purchase/${newOrder._id}`)

}

export {
    checkoutSummary,
    checkout
}