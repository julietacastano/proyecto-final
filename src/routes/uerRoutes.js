import { Router } from "express";
import { authUser } from "../middleware/passportConfig.js";
import { getUsers, registerForm, userRegister, loginForm, olvidePassForm, enviarToken, cambiarPass, guardarNuevaPass, userLogout, cambiarRol} from "../controllers/userController.js";
import { justAdmin, justPremium } from "../middleware/autorizacion.js";

const userRoutes = Router()

//Mostrar users
userRoutes.get('/', justAdmin, getUsers)

//Register 
userRoutes.get('/register', registerForm)
userRoutes.post('/register', userRegister)

//Login 
userRoutes.get('/login', loginForm)
userRoutes.post('/login', authUser)

//Cambiar contraseña 
userRoutes.get('/olvidePass', olvidePassForm)
userRoutes.post('/olvidePass', enviarToken)
userRoutes.get('/olvidePass/:token', cambiarPass)
userRoutes.post('/olvidePass/:token', guardarNuevaPass)

//Logout
userRoutes.get('/logout', userLogout)

//Cambiar rol
userRoutes.post('/premium/:uid', justPremium, cambiarRol)


export default userRoutes