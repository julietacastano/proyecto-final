import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local"
import { sessionDb } from "../daos/mongoDao.js";

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
    }, 
    async (email, password, done) =>{
        const usuario = await sessionDb.findOne({email})
        if(!usuario){
            return done(null, false, {message: 'Error de autenticación'})
        }

        const verificarPassword = usuario.comparePassword(password)
        if(!verificarPassword){
            return done(null, false, {message: 'Error de autenticación'})
        }

        return done(null, usuario)
    }
))

passport.serializeUser((usuario, done) => done(null, usuario._id))
passport.deserializeUser(async(id, done) => {
    const usuario = await sessionDb.findById(id)
    return done(null, usuario)
})

const passportInitialize = passport.initialize()
const sessionInitialize = passport.session()

const authUser = passport.authenticate('login',{
    successRedirect: '/api/products',
    failureRedirect: '/api/users/login',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})


export{
    passportInitialize,
    sessionInitialize,
    authUser,
}
