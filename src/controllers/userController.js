import { check, validationResult } from "express-validator";
import sessionDao from "../daos/sessionDao.js";
import { reestablecerPassMail } from "../utils/email.js";

//Get users
const getUsers = async(req,res) => {
    const usuarios  = await sessionDao.getSessions()

    res.render('usuarios', {
        nombrePagina:'Usuarios registrados',
        usuarios
    })  
}

//Register ---------------------------------------
const registerForm =  (req,res)=>{
    const err = req.flash('error')
    const msg = req.flash('message')

    res.render('register', {
        nombrePagina:'Registro',
        err,
        msg
    })  
}
const userRegister = async (req,res)=>{
    await check('name').notEmpty().withMessage('El nombre no puede estar vacio').run(req)
    await check('email').isEmail().withMessage('Eso no parece un email').run(req)
    await check('password').isLength({min:4}).withMessage('La contraseña es muy corta').run(req)
    
    let resultadoErrores = validationResult(req)
    if(!resultadoErrores.isEmpty()){
        req.logger.error(resultadoErrores.array())
        return res.status(404).render('register', {
            nombrePagina:'Registro',
            errores:resultadoErrores.array()
        })  
    }

    const addSec = await sessionDao.addSession(req.body)

    if(addSec.error){
        req.logger.error(`${addSec.error}`)
        req.flash('error', `${addSec.error}`)
        return res.status(404).redirect('/api/users/register')
    }

    req.flash('message', `${addSec.succes}`)
    return res.status(201).redirect('/api/users/login')
}

//Login ----------------------------------------
const loginForm = (req,res)=>{
    const err = req.flash('error')
    const msg = req.flash('message')

    res.render('login', {
        nombrePagina:'Iniciar sesion',
        err,
        msg
    })  
}

//Cambiar contraseña -------------------------------------------------------------------------------
const olvidePassForm = (req,res)=>{
    const err = req.flash('error')
    const msg = req.flash('message')

    res.render('olvidePass', {
        nombrePagina:'Recuperar contraseña',
        err,
        msg
    })  
}
//Generar y enviar token
const enviarToken = async (req,res) => {
    await check('email').notEmpty().withMessage('El email no puede estar vacio').run(req)

    let resultadoErrores = validationResult(req)
    if(!resultadoErrores.isEmpty()){
        req.logger.error(resultadoErrores.array())
        return res.status(404).render('olvidePass', {
            nombrePagina:'Recuperar contraseña',
            errores:resultadoErrores.array()
        })  
    }

    const usuario = await sessionDao.getToken(req.body)

    if(usuario.error){
        req.logger.error(`${usuario.error}`)
        req.flash('error', `${usuario.error}`)
        return res.status(404).redirect('/api/users/olvidePass')
    }

    const urlReset = `${req.headers.host}/api/users/olvidePass/${usuario.token}`

    reestablecerPassMail({
        email:usuario.email,
        nombre:usuario.name,
        urlReset,
    })


    req.flash('message', 'Te enviamos un mail para recuperar tu contraseña')
    return res.status(200).redirect('/api/users/olvidePass')

}

const cambiarPass = async (req,res) => {
    const token = req.params.token
    const usuario = await sessionDao.validateToken(token)
    if(usuario.error){
        req.logger.error(`${usuario.error}`)
        req.flash('error', `${usuario.error}`)
        return res.status(404).redirect('/api/users/olvidePass')

    }

    const err = req.flash('error')

    res.status(200).render('cambiarPass', {
        nombrePagina:'Recuperar contraseña',
        err,
    })  
}
//Guardo la nueva password
const guardarNuevaPass = async (req,res) => {
    const token = req.params.token
    const password = req.body.password

    await check('password').isLength({min:4}).withMessage('La contraseña es muy corta').run(req)
    
    let resultadoErrores = validationResult(req)
    if(!resultadoErrores.isEmpty()){
        req.logger.error(resultadoErrores.array())
        return res.status(404).render('cambiarPass', {
            nombrePagina:'Recuperar contraseña',
            errores:resultadoErrores.array()
        })  
    }

    const recuperarPass = await sessionDao.updatepass(password, token)

    if(recuperarPass.error){
        req.logger.error(`${recuperarPass.error}`)
        req.flash('error', `${recuperarPass.error}`)
        return res.status(404).redirect('/api/users/olvidePass')
    }

    req.flash('message', `${recuperarPass.succes}`)
    return res.status(200).redirect('/api/users/login')
}


//Log out----------------------------------------------------------
const userLogout = (req, res, next) =>{   
    req.logout(function(err) {
        if (err) { return next(err); }
    res.status(200).redirect('/api/products');
    })
}

//Cambiar rol ------------------------------------------------------------
const cambiarRol = async (req,res) => {
    const id = req.params.uid
    const nuevoRol = await sessionDao.changeRol(id)

    if(nuevoRol.error){
        req.logger.error(`${nuevoRol.error}`)
        return res.status(404).send(`Error ${nuevoRol.error}`)
    }

    res.status(200).send(`Exito: ${nuevoRol.succes}`)
}


export {
    getUsers,
    registerForm,
    userRegister,
    loginForm,
    olvidePassForm,
    enviarToken,
    cambiarPass,
    guardarNuevaPass,
    userLogout,
    cambiarRol
}