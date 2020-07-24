import express from 'express'
const router = express.Router()


import minio from '../../../minio/connection'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
var upload = multer({ dest: '/tmp' })



router.post( "/*", upload.single( 'upload' ), (req, res) => {
    console.log(req._parsedUrl)
    const objectName = uuidv4()
    console.log(req.file)
    minioClient.fPutObject(String(req.auth.uid).toLowerCase(), objectName, req.file.path, ({
        'Content-Type': req.file.mimetype,
    }), (err) => {
        if(err){
            console.log(err)
            res.status(503)
            res.json({
                status: false,
                upload: false
            })
        }
        else{
            user.findOne({
                uid: req.auth.uid
            }).then((result) => {
                if(result){
                    object.create({
                        type: false,
                        file_type: req.file.mimetype,
                        object_size: req.file.size,
                        object_uuid: objectName,
                        object_user_path: req._parsedUrl.path,
                        object_user_name: req.file.originalname,
                        owner_uid: result._id
                    }).then((onfullfilled, onrejected) => {
                        if(onfullfilled){
                            console.log(onfullfilled)
                            res.json({
                                status: true,
                                upload: true,
                                database: true
                            })
                        }
                        if(onrejected){
                            res.status(503)
                            res.json({
                                status: false,
                                upload: true,
                                database: false,
                            })
                        }
                    })
                }
                else {
                    res.status(503)
                    res.json({
                        status: false,
                        upload: true,
                        database: false
                    })
                }
            })
        }
    })
})

export default router