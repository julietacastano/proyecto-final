import winston from "winston";

const winstonLogger = winston.createLogger({
    transports:[
        new winston.transports.Console({level:"debug"}),
        new winston.transports.File({level:"warn", filename:'errors.log'})
    ]
})

export default winstonLogger