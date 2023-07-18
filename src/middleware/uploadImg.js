import multer from "multer";
import { nanoid } from "nanoid";
import path from "path"

const fileStorage = multer.diskStorage({
    destination: (req,file,cb) => {
        cb(null, 'public/uploads/prodImg')
    },
    filename: (req,file,cb) =>{
        cb(null, nanoid() + path.extname(file.originalname))
    }
})

const configMulter = {
    limits: {fileSize: 100000},
    storage:fileStorage,
    fileFilter(req,file,cb){
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
            cb(null,true)
        }else{
            cb(new Error('Formato de la imagen no valido'), false)
        }
    },
}

const uploadImg = multer(configMulter).single('imagen')


export default uploadImg