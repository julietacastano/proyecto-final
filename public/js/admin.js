const eliminar = e => {
    e.preventDefault()

    if(e.target.dataset.eliminar){
        let dataset = e.target.dataset.eliminar
        fetch(`/api/admin/eliminar/${dataset}`,{
            method: 'DELETE',
        }).then(result => {
            if(result.status === 200){
                window.location.replace('/api/admin')
            }
        })       
    }else if(e.target.tagName === 'A'){
        window.location.href = e.target.href}
}

const listadoProd = document.querySelector('.panel-admin');
listadoProd.addEventListener('click', eliminar)