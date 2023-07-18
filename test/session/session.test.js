import supertest from "supertest";
import assert from "assert"
import bcrypt from "bcrypt"
import mongoose from "mongoose";

const local = 'http://localhost:8080'
const httpClient = supertest(local)

describe('Api rest ecommerce', () => {
    describe('sessions', () => {
        before(async () => {
            const hashPass = bcrypt.hash('123456', 10)

            await mongoose.connection.collection('sessionsTest').deleteMany({})
            await mongoose.connection.collection('sessionsTest').insertOne({
                name:"Prueba",
                email:"prueba@mail.com.ar",
                password:hashPass,
                rol:'premium',                
            })
        })
        
        after(async () => {
            await mongoose.connection.collection('sessionsTest').deleteMany({})
        })
        
        describe('POST', ()=>{
            it('Session creada correctamente', async () => {
                const hashPass = bcrypt.hash('123456', 10)
                const datosUsuario = {
                    name:'Prueba',
                    email:'prueba@correo.com',
                    password:hashPass,
                    rol:'user',
                }

                const {statusCode, ok, body} =await httpClient.post('/api/users/register').send(datosUsuario)
                assert.strictEqual(statusCode, 201)
                assert.ok(ok)
            })
        })

        describe('POST', ()=>{
            it('Session creada incorrectamente', async () => {
                const datosUsuario = {
                    name:' ',
                    email:'prueba@correo.com',
                    password:'123',
                    rol:'user',
                }

                const {statusCode, ok, body} =await httpClient.post('/api/users/register').send(datosUsuario)
                assert.strictEqual(statusCode, 404)
                assert.ok(ok, 'La peticion no fue exitosa')
            })
        })

        describe('POST', ()=>{
            it('Usuario Logueado correctamente', async () => {
                const datosUsuario = {
                    name:' ',
                    email:'prueba@correo.com',
                    password:'123',
                    rol:'user',
                }

                const {statusCode, ok, body} =await httpClient.post('/api/users/register').send(datosUsuario)
                assert.strictEqual(statusCode, 404)
                assert.ok(ok)
            })
        })
    })
})