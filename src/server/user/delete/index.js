import express from 'express'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
const router = express.Router()

router.post( "/", (req, res) => {
    minioClient.removeBucket(req.auth.uid, (err) => {
        if(err) {
            console.log("error deleting bucket")
            res.status(503)
            res.json({
                status: false,
                delete: false
            })
        }
        else {
            User.deleteOne({
                uid: req.auth.uid,
                bucket_name: req.auth.uid
            })
            .then((onfullfilled, onrejected) => {
                if(onfullfilled){

                    object.deleteMany({ 
                        owner_uid: req.auth.uid
                    })
                    .then((onfullfilled, onrejected) => {
                        if(onfullfilled){
        
                            res.json({
                                status: true,
                                delete: true
                            })
                        }
                        if(onrejected){
                            res.status(503)
                            res.json({
                                status: false,
                                delete: true
                            })
                        }
                    })
                    .catch( err => {
                        res.json({
                            status: false,
                            delete: false,
                            debug: err
                        })
                    })

                    res.json({
                        status: true,
                        delete: true
                    })
                }
                if(onrejected){
                    res.status(503)
                    res.json({
                        status: false,
                        delete: true
                    })
                }
            })
            .catch( err => {
                res.json({
                    status: false,
                    delete: false,
                    debug: err
                })
            })
        }
    })
})

export default router