import { check, validationResult } from "express-validator"
import multer from "multer"
import productDao from "../daos/productDao.js"
import uploadImg from "../middleware/uploadImg.js"
import { avisarEliminado } from "../utils/email.js"

//Panel de administrador------------------------------------------------------------
const penelAdmin = async (req, res, next) =>{
    const {pagina} = req.query
    const redex = /^[0-9]$/
    if(!redex.test(pagina)){
        return res.redirect('/api/admin?pagina=1')
    }

    const limit = 5
    const offset = ((pagina * limit) - limit)

    if(req.user.rol === 'premium'){
        const owner = req.user.email
        const products = await productDao.getProductsPremium(owner)

        const msg = req.flash('message')
        const err = req.flash('error')
        return res.render('admin', {
            nombrePagina:'Panel de administración',
            products,
            msg,
            err
        })  
    }

    const products = await productDao.getProducts(pagina, limit, offset)

    const todosProds = await productDao.allProds()
    let total = todosProds.length
    let pages = Math.ceil(total/limit)
    const cantPag = []

    for(let i=1; i<=pages ; i++){
        cantPag.push(i)
    }

    const msg = req.flash('message')
    const err = req.flash('error')
    res.status(200).render('admin', {
        nombrePagina:'Panel de administración',
        products,
        cantPag,
        msg,
        err
    })  
}

//Agregar un producto nuevo ------------------------------------------
const crearProducto = (req,res) => {

    res.render('crear',{
        nombrePagina:'Agregar un producto',
    })
}
const publicarProducto = async(req,res)=>{
    await check('titulo').notEmpty().withMessage('El titulo no puede estar vacio').run(req)
    await check('descripcion').notEmpty().withMessage('La descripción no puede estar vacia').run(req)
    await check('precio').isFloat({min:1}).withMessage('El precio debe ser mayor a 0').run(req)
    await check('codigo').notEmpty().withMessage('El código no puede estar vacio').run(req)
    await check('stock').isNumeric().withMessage('El stock no puede estar vacio').run(req)
    await check('categoria').notEmpty().withMessage('Por favor elegi una categoria').run(req)

    let resultadoErrores = validationResult(req)
    if(!resultadoErrores.isEmpty()){
        req.logger.error(`${resultadoErrores.array()}`)
        const completado = req.body
        return res.status(404).render('crear', {
            nombrePagina:'Registro',
            errores:resultadoErrores.array(),
            completado
        })  
    }

    const newProd = req.body
    if(req.file){
        newProd.img = req.file.filename
    }

    const owner = req.user.email
    newProd.owner = owner

    const agregarProd = await productDao.addProduct(newProd)
    

    if(agregarProd.error){
        req.logger.error(`${agregarProd.error}`)
        const completado = req.body
        return res.status(404).render('crear', {
            nombrePagina:'Registro',
            errores:[{msg:`${agregarProd.error}`}],
            completado
        })  
    }

    req.flash('message', `${agregarProd.succes}`)
    res.status(201).redirect('/api/admin')
}
//Upload Img -----------------------------------------------------------------------------------
const subirImagen = (req,res, next) => {

    uploadImg(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Multer error
            if(err.code === 'LIMIT_FILE_SIZE'){
                req.logger.error('El archivo intentando subir es muy grande')
                const completado = req.body
                return res.render('crear', {
                    nombrePagina:'Registro',
                    errores:[{msg:'El archivo es muy grande: máximo 100KB'}],
                    completado
                })  

            } else {
                req.logger.error(err.message)
                const completado = req.body
                return res.render('crear', {
                    nombrePagina:'Registro',
                    errores:[{msg:`${err.message}`}],
                    completado
                })  

            }
        } else if (err) {
            // unknown error 
            req.logger.error(err.message)
            const completado = req.body
            return res.render('crear', {
                nombrePagina:'Registro',
                errores:[{msg:`${err.message}`}],
                completado
            })         
        }
        // Everything went fine.
        next()
    })
}

//Editar producto  ----------------------------------------------------------------
const editarProductoForm = async (req,res)=>{
    const id = req.params.pid
    const producto = await productDao.getProductById(id)

    //Los premium solo pueden editar productos propios
    if(req.user.rol === 'premium'){
        const owner = req.user.email
        const prodOwner = producto.owner
        if(owner !== prodOwner){
            req.logger.error('No autorizado')
            req.flash('error', 'No autorizado')
            return res.status(403).redirect('/api/admin?pagina=1')
        }       
    }

    if(producto.error){
        req.logger.error(`${producto.error}`)
        req.flash('error', `${producto.error}`)
        return res.status(404).redirect('/api/admin?pagina=1')
    }

    res.render('editar',{
        nombrePagina:`Editar producto: ${producto.titulo}`,
        producto:[producto],
    })

}
const editarProducto = async (req,res) => {
    await check('titulo').notEmpty().withMessage('El titulo no puede estar vacio').run(req)
    await check('descripcion').notEmpty().withMessage('La descripción no puede estar vacia').run(req)
    await check('precio').isFloat({min:1}).withMessage('El precio debe ser mayor a 0').run(req)
    await check('codigo').notEmpty().withMessage('El código no puede estar vacio').run(req)
    await check('stock').isNumeric().withMessage('El stock no puede estar vacio').run(req)
    await check('categoria').notEmpty().withMessage('Por favor elegi una categoria').run(req)

    let resultadoErrores = validationResult(req)
    
    const id = req.params.pid
    const producto = await productDao.getProductById(id)
    
    if(!resultadoErrores.isEmpty()){
        req.logger.error(resultadoErrores.array())
        return res.render('editar', {
            nombrePagina:`Editar producto: ${producto.titulo}`,
            errores:resultadoErrores.array(),
            producto:[producto],
        })
    }

    //Los premium solo pueden editar productos propios
    if(req.user.rol === 'premium'){
        const owner = req.user.email
        const prodOwner = producto.owner
        if(owner !== prodOwner){
            req.logger.error('No autorizado')
            req.flash('error', 'No autorizado')
            return res.status(403).redirect('/api/admin?pagina=1')
        }       
    }

    const datosProd = req.body
    if(req.file){
        datosProd.img = req.file.filename
    }

    const prodEditado = await productDao.updatePrduct(id, datosProd)

    if(prodEditado.error){
        req.logger.error(`${prodEditado.error}`)
        req.flash('error', `${prodEditado.error}`)
        return res.status(404).redirect('/api/admin?pagina=1')
    }

    req.flash('message', `${prodEditado.succes}`)
    res.status(200).redirect('/api/admin')
}

//Elimiar un producto------------------------------------------------------------------------
const eliminarProducto =  async (req,res, next)=>{
    const id = req.params.pid
    const producto = await productDao.getProductById(id)

    //Los premium solo pueden eliminar productos propios
    if(req.user.rol === 'premium'){
        const owner = req.user.email
        const prodOwner = producto.owner
        if(owner !== prodOwner){
            req.logger.error('No autorizado')
            req.flash('error', 'No autorizado')
            return res.status(403).send('Error')
        } 
        const prodDeleted = await productDao.deleteProduct(id)
        if(prodDeleted.error){
            req.logger.error(`${prodDeleted.error}`)
            req.flash('error', `${prodDeleted.error}`)
            res.status(403).send('Error')
        }

        avisarEliminado({
            email:owner,
            nombre:req.user.name,
            titulo:producto.titulo
        })
        
        req.flash('message', `${prodDeleted.succes}`)
        return res.status(200).send(`${prodDeleted.succes}`)
    }
    
    const prodDeleted = await productDao.deleteProduct(id)

    if(prodDeleted.error){
        req.logger.error(`${prodDeleted.error}`)
        req.flash('error', `${prodDeleted.error}`)
        res.status(403).send('Error')
    }
    
    req.flash('message', `${prodDeleted.succes}`)
    res.status(200).send(`${prodDeleted.succes}`)
}


//Exports -----------------------------------
export {
    penelAdmin,
    crearProducto,
    publicarProducto,
    subirImagen,
    editarProductoForm,
    editarProducto,
    eliminarProducto
}