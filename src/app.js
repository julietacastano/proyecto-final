import Express from "express";
import { engine } from "express-handlebars";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash"
import winstonLogger from "./utils/wistonLogger.js";
import dotenv from "dotenv"
import createError from "http-errors"
import cartRoutes from "./routes/cartRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import userRoutes from "./routes/uerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import docsRoutes from "./routes/docsRoutes.js";
import { passportInitialize, sessionInitialize } from "./middleware/passportConfig.js";

dotenv.config()

const app = Express()

app.use(cookieParser())

app.use(Express.json())
app.use(Express.urlencoded({extended:true}))

app.engine('handlebars', engine())
app.set('views', './views')
app.set('view engine', 'handlebars')

app.use('/static', Express.static('./public'))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))

app.use(passportInitialize, sessionInitialize) 

app.use(flash());

app.use((req,res,next) => {
    req.logger = winstonLogger
    next()
})

app.use('/api/docs', docsRoutes)
app.use('/api/users', userRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/carts', cartRoutes)
app.use('/api/purchase', checkoutRoutes)

app.use((req,res,next) => {
    next(createError(404, 'No encontrado'))
})
app.use((error,req,res,next) => {
    const status = error.status || 500

    res.render('404', {
        nombrePagina: `${status} - ${error.message}` 
    })
})

const port = process.env.PORT
app.listen(port,  '0.0.0.0', ()=>{ winstonLogger.http(`conectado a puerto ${port}`) })

