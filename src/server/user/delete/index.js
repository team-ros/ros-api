import express from 'express'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
import { database } from 'firebase-admin'
const router = express.Router()

router.post( "/", (req, res) => {
    console.log(req)
    minioClient.removeBucket(String(req.auth.uid).toLowerCase(), (err) => {
        if(err) {
            console.log("error deleting bucket")
            res.status(503)
            res.json({
                status: false,
                delete: false
            })
        }
        else {
            user.deleteOne({
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
                                delete: true,
                                database: true
                            })
                        }
                        if(onrejected){
                            res.status(503)
                            res.json({
                                status: false,
                                delete: true,
                                database: false
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