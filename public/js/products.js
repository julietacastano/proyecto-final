const eliminarProdCarrito = e => {
    e.preventDefault()

    if(e.target.dataset.eliminar){
        let dataset = e.target.dataset.eliminar
        fetch(`/api/carts/eliminar/${dataset}`,{
            method: 'DELETE',
        }).then(result => {
            if(result.status === 200){
                window.location.reload()
            }
        })       
    }else if(e.target.tagName === 'A'){
        window.location.href = e.target.href}
}

const listadoProdCart = document.querySelector('.panel-carrito');
listadoProdCart.addEventListener('click', eliminarProdCarrito)

const vaciar = e => {
    e.preventDefault()
    if(e.target.classList.contains('vaciar-carrito')){
        fetch('/api/carts/vaciarCarrito',{
            method: 'DELETE',
        }).then(result => {
            if(result.status === 200){
                window.location.reload()
            }
        }) 

    }
}
const vaciarCarrito = document.querySelector('.vaciar-carrito');
vaciarCarrito.addEventListener('click', vaciar)


const updateQuantity = e => {
    e.preventDefault()

    if(e.target.dataset.sumar){
        let dataset = e.target.dataset.sumar
        fetch(`/api/carts/sumar/${dataset}`,{
            method: 'PUT',
        }).then(result => {
            if(result.status === 200){
                window.location.reload()
            }else if(result.status === 403){
                window.location.reload()
            }
        })       
    }

    if(e.target.dataset.restar){
        let dataset = e.target.dataset.restar
        fetch(`/api/carts/restar/${dataset}`,{
            method: 'PUT',
        }).then(result => {
            if(result.status === 200){
                window.location.reload()
            }else if(result.status === 403){
                window.location.reload()
            }
        })       
    }
}
listadoProdCart.addEventListener('click', updateQuantity)

