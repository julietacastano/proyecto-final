import { Router } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express"

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Express API con Swagger',
            description:
            'Ecommerce API app desarrollada con Express y documentada con Swagger',
        },
    },
    apis: ['./docs/**/*.yaml'],
}

const specs = swaggerJSDoc(options)

const docsRoutes = Router()

docsRoutes.use('/', swaggerUi.serve, swaggerUi.setup(specs))

export default docsRoutes