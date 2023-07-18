import nodemailer from "nodemailer"

const reestablecerPassMail = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from:'BookStore.com',
        to:datos.email,
        subject:'Reestablecer contraseña de BookStore',
        html:`<h1 style="text-align:center; font-family: Arial, Helvetica;">Reestablecer contraseña</h1>
            <p style="font-family: Arial, Helvetica;">Hola ${datos.nombre}, has solicitado reestablecer tu contraseña, haz click en el siguiente enlace. Este enlace es temporal, si se vence es necesario que vuelvas a solicitar otro e-mail.</p>

            <p style="font-family: Arial, Helvetica;">Por favor copia el siguiente link en el navegador:</p>
            <a>${datos.urlReset}</a>
            
            <p style="font-family: Arial, Helvetica;">Si no solicitaste este e-mail, puedes ignorarlo</p>
        `
    })
}

const confirmarCompra = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from:'BookStore.com',
        to:datos.email,
        subject:'Gracias por comprar en Book Store',
        html:`<h1 style="text-align:center; font-family: Arial, Helvetica;">Confirmación de compra</h1>
            <p style="font-family: Arial, Helvetica;">Hola ${datos.nombre}, gracias por tu compra! Tu orden de compra ha sido confirmada. Para ver su detalle podes hacer click en el siguiente enlace</p>
            <a>${datos.urlCheckout}</a>

            <p style="font-family: Arial, Helvetica;">Si no funciona, por favor copia el siguiente link en el navegador:</p>
            <a>${datos.urlCheckout}</a>
            
            <p style="font-family: Arial, Helvetica;">Saludos,</p>
            <p style="font-family: Arial, Helvetica;">Book Store.</p>

        `
    })
}

const avisarEliminado = async (datos) => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    await transporter.sendMail({
        from:'BookStore.com',
        to:datos.email,
        subject:'Tu producto ha sido eliminado con exito',
        html:`<h1 style="text-align:center; font-family: Arial, Helvetica;">Tu producto ha sido eliminado con exito</h1>
            <p style="font-family: Arial, Helvetica;">Hola ${datos.nombre}, tu producto con nombre ${datos.titulo} ha sido eliminado</p>

            <p style="font-family: Arial, Helvetica;">Si no solicitaste la eliminación, es posible que lo haya eliminado un administrador</p>
            
            <p style="font-family: Arial, Helvetica;">Saludos,</p>
            <p style="font-family: Arial, Helvetica;">Book Store.</p>

        `
    })
}

export {
    reestablecerPassMail,
    confirmarCompra,
    avisarEliminado
}