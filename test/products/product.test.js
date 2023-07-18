import supertest from "supertest";
import assert from "assert"
import mongoose from "mongoose";

const local = 'http://localhost:8080'
const httpClient = supertest(local)

describe('Api rest ecommerce', () => {
    describe('products', () => {
        before(async () => {
            await mongoose.connection.collection('productTest').deleteMany({})
            await mongoose.connection.collection('productTest').insertOne({
                titulo:"Titulo prueba",
                descripcion:"Descripcion prueba",
                precio:50,
                codigo:"1P",
                stock:10,
                categoria:"Romance",
                owner:"prueba@mail.com.ar"             
            })
        })
        
        after(async () => {
            await mongoose.connection.collection('productTest').deleteMany({})
        })

        describe('POST', () => {
            it('Producto cread0 correctamente', async () => {
                const datosProducto = {
                    titulo:"Libro 1",
                    descripcion:"Descripcion libro 1",
                    precio:100,
                    codigo:"L1",
                    stock:11,
                    categoria:"Ficcion",
                    owner:"prueba@mail.com.ar"    
                }

                const {statusCode, ok, body} =await httpClient.post('/api/admin/crear').send(datosProducto)
                assert.strictEqual(statusCode, 201)
                assert.ok(ok)
            })
        })

        describe('POST', ()=>{
            it('Producto creado incorrectamente', async () => {
                const datosProducto = {
                    titulo:" ",
                    descripcion:"Descripcion libro 1",
                    precio:"cien",
                    codigo:"L1",
                    stock:11,  
                }

                const {statusCode, ok, body} =await httpClient.post('/api/admin/crear').send(datosProducto)
                assert.strictEqual(statusCode, 404)
                assert.ok(ok, 'La peticion no fue exitosa')
            })
        })

        describe('GET', ()=>{
            it('Producto no existe', async () => {
                const idProducto = '1234'
                const {statusCode, ok, body} =await httpClient.get(`api/products/${idProducto}`)
                assert.strictEqual(statusCode, 404)
                assert.ok(ok, 'La peticion no fue exitosa')
            })
        })
    })
})