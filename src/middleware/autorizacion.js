const justAdmin = (req,res, next) => {
    if(req.user?.rol !== 'admin'){
        req.logger.error('Solo disponible para personas autorizadas')
        req.flash('error', 'Solo disponible para personas autorizadas')
        return res.redirect('/api/products')
    }
    next()
}

const adminPremium = (req,res, next) => {
    if(req.user?.rol === 'admin' || req.user?.rol === 'premium'){
        return next()
    }
    
    req.logger.error('Solo disponible para personas autorizadas')
    req.flash('error', 'Solo disponible para personas autorizadas')
    return res.redirect('/api/products')
}

const justPremium = (req,res,next) => {
    if(req.user?.rol === 'premium' || req.user?.rol === 'user'){
        req.logger.error('No autorizado a realizar el cambio')
        req.flash('error', 'No autorizado a realizar el cambio')
        return res.redirect('/api/products')
    }
    next()
}

export {
    justAdmin,
    adminPremium,
    justPremium
}