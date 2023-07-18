import { Router } from "express"
import { penelAdmin, crearProducto, publicarProducto, subirImagen, editarProductoForm, editarProducto, eliminarProducto } from "../controllers/adminController.js"
import { adminPremium } from "../middleware/autorizacion.js"

const adminRoutes = Router()

//Panel de administracion
adminRoutes.get('/', adminPremium, penelAdmin )

//Agregar un producto
adminRoutes.get('/crear', adminPremium, crearProducto)
adminRoutes.post('/crear', adminPremium, subirImagen, publicarProducto)

//Editar un producto
adminRoutes.get('/editar/:pid', adminPremium, editarProductoForm)
adminRoutes.post('/editar/:pid', adminPremium, subirImagen, editarProducto)

//Elimiar un producto
adminRoutes.delete('/eliminar/:pid', adminPremium, eliminarProducto) 

export default adminRoutes