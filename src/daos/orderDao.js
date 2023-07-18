import { orderDb } from "./mongoDao.js";

class Orders{
    constructor(model){
        this.model=model
    }

    async createOrder(cart, name, email, address, tel){
        const prod = cart.products
        const newOrder = await this.model.create({
            name: name, 
            email: email, 
            address: address,
            tel: tel,
            created:Date.now(),
            products:[...prod],
        })
        return newOrder
    }

    async getOrders(orderId){
        const order = await this.model.findById(orderId).populate('products').lean()
        if(!order){ 
        return {error:"No se encontro la orden pedido"}
        }
        
        return order
    }
}

const orderDao = new Orders(orderDb)

export default orderDao