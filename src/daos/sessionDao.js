import { nanoid } from "nanoid";
import { sessionDb } from "./mongoDao.js";

class Sessions {
    constructor (model){
        this.model = model
    }

    //Get sessions
    async getSessions(){
        const usuarios = await this.model.find().lean()
        return usuarios
    }

    //Crear usuario ------------------------------------------------------
    async addSession({name, email, edad, password, rol}){
        const usuario = await this.model.findOne({email:email})

        if(usuario){
            return {error:"Email registrado, por favor avanzar a log in"}
        }

        const newSession = await this.model.create({
            name:name,
            email: email,
            edad: edad,
            password,
            rol:rol
        })

        return {succes:`Felicitaciones ${newSession.name}, tu cuenta se ha creado correctamente`}
    }
    
    //Agregar carrito al usuario----------------------------------------------------------------------
    async findAndUpdateCarrito (id, nuevoCarrito){
        const newCart = await this.model.findByIdAndUpdate(id,{carrito:nuevoCarrito})
        return newCart
    }

    //Agregar Orden al carrito ---------------------------------------------------------------------
    async findAndUpdateOrden (id, nuevaOrden){
        const newOrder = await this.model.findByIdAndUpdate(id,{ordenes:nuevaOrden})
        return newOrder
    }

    //Generar token para cambiar password -----------------------------------------------
    async getToken({email}){
        const usuario = await this.model.findOne({email})
        if(!usuario){return {error:"El email no corresponde con un usuario registrado"}}

        const token = nanoid()
        
        usuario.token = token
        usuario.expira = Date.now() + 3600000

        await usuario.save()

        return usuario

    }
    async validateToken(token){
        const usuario = await this.model.findOne({
            token:token,
            expira:{$gt:Date.now()}
        })

        if(!usuario){
            return {error: 'El formulario expiro, por favor vuelve a intentar'}
        }

        return{succes: 'Token valido'}

    }

    //Cambiar password ------------------------------------------------------
    async updatepass(password, token){
        const usuario = await this.model.findOne({
            token:token,
            expira:{$gt:Date.now()}
        })
        if(!usuario){return {error: 'Error al reestablecer contraseña, por favor vuelve a intentar'}}

        usuario.password = password
        usuario.token = undefined
        usuario.expira = undefined

        await usuario.save()

        return {succes:'Contraseña actualizada con exito'}
    }

    async changeRol (userId){
        const user = await this.model.findById(userId)
        if(!user){return {error: 'No se encontro el usuario pedido'}}

        if(user.rol == 'premium'){
            user.rol = 'user'
            await user.save()

            return {succes:'Se cambio el estado con exito. Estado actual: User'}
        }
        if(user.rol == 'user'){
            user.rol = 'premium'
            await user.save()

            return {succes:'Se cambio el estado con exito. Estado actual: Premium'}
        }

        return {error:'No se pudo realizar el cambio, por favor vuelve a intentar'}
    }

}

const sessionDao = new Sessions(sessionDb)

export default sessionDao
