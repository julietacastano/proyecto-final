import productDao from "../daos/productDao.js";

//Muestra todos los productos con un limit -------------------------------------
const getProducts = async(req,res) => {
    const {pagina} = req.query
    const redex = /^[0-9]$/
    if(!redex.test(pagina)){
        return res.redirect('/api/products?pagina=1')
    }

    const limit = 4
    const offset = ((pagina * limit) - limit)

    const products = await productDao.getProducts(pagina, limit, offset)

    const todosProds = await productDao.allProds()
    let total = todosProds.length
    let pages = Math.ceil(total/limit)
    const cantPag = []

    for(let i=1; i<=pages ; i++){
        cantPag.push(i)
    }

    const carrito = req.user?.carrito

    const err = req.flash('error')
    const msg = req.flash('message')
    res.status(200).render('home', {
        nombrePagina:'Productos',
        products: products,
        usuario:req.user,
        admin: req.user?.rol === 'admin' ? true : false || req.user?.rol === 'premium' ? true : false,
        carrito,
        err,
        msg,
        pagina,
        cantPag
    })  
}
//Buscador ------------------------------------------------------------
const buscador = async (req,res) =>{
    const search = req.body.q
    const products = await productDao.buscador(search)

    if(products.error){
        req.logger.error(`${products.error}`)
    }


    res.status(200).render('home', {
        nombrePagina:'Productos',
        products,
        usuario:req.user,
    })  
}

//Filtro ---------------------------------------------------------------------------------
const filtro = async (req,res,) => {
    const productos = await productDao.filtroCat(req.params.cat)

    if(productos.error){
        req.logger.error(`${productos.error}`)
        req.flash('error', `${productos.error}`)
        res.status(404).send('Error')
    }
    
    res.status(200).send(`${productos.succes}`)   
}
//Get categorias
const getCat = async (req,res) => {
    const products = await productDao.filtroCat(req.params.cat)

    if(products.error){
        req.logger.error(`${products.error}`)
        return res.status(404)
    }

    res.status(200).render('categoria', {
        nombrePagina:`Productos ${req.params.cat}`,
        products: products,
        usuario:req.user,
    })  
}

//Mostrar productos por ID--------------------------------------------------------
const getProdById = async (req,res)=>{
    const producto = await productDao.getProductById(req.params.pid)

    if(producto.error){
        req.logger.error(`${producto.error}`)
        req.flash('error', `${producto.error}`)
        return res.status(404).redirect('/api/products?pagina=1')
    }

    const carrito = req.user?.carrito

    const err = req.flash('error')
    const msg = req.flash('message')
    res.status(200).render('detalle',{
        nombrePagina:'Producto seleccionado',
        producto:[producto],
        usuario:req.user,
        admin: req.user?.rol === 'admin' ? true : false || req.user?.rol === 'premium' ? true : false,
        carrito,
        stock: producto.stock > 0 ? true : false ,
        err,
        msg
    })

}



//Exports -----------------------------------
export {
    getProducts,
    buscador,
    filtro,
    getCat,
    getProdById,
}