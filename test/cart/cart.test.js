import supertest from "supertest";
import assert from "assert"
import mongoose from "mongoose";

const local = 'http://localhost:8080'
const httpClient = supertest(local)

describe('Api rest ecommerce', () => {
    describe('carts', () => {
        before(async () => {
            await mongoose.connection.collection('cartTest').deleteMany({})
            await mongoose.connection.collection('cartTest').insertOne({
                products:[
                    {_id:"123", quantity: 1},
                    {_id:"234", quantity: 2},
                    {_id:"345", quantity: 3}
                ]          
            })
        })
        
        after(async () => {
            await mongoose.connection.collection('cartTest').deleteMany({})
        })

        describe('POST', () => {
            it('Producto agregado al carrito correctamente', async () => {
                const producto = {
                    _id:"1", quantity: 1
                }

                const {statusCode, ok, body} =await httpClient.post('/api/carts/agregarProd/1').send(producto)
                assert.strictEqual(statusCode, 201)
                assert.ok(ok)
            })
        })

        describe('GET', ()=>{
            it('Carrito no encontrado', async () => {
                const idCarrito = '1234'

                const {statusCode, ok, body} =await httpClient.post(`/api/carts/${idCarrito}`)
                assert.strictEqual(statusCode, 404)
                assert.ok(ok, 'La peticion no fue exitosa')
            })
        })

    })
})