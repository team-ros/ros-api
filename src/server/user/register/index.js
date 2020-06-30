import express from 'express'
import minioClient from '../../../minio/connection'
import middleware from '../../../middleware'
import { User } from '../../../database/schema'
const router = express.Router()


router.post( "/", middleware, (req, res) => {
    minioClient.makeBucket(req.auth.uid, "eu", (err) => {
        if(err) {
            console.log("error creating bucket")
            res.status(503)
            res.json({
                status: false,
                bucket: false
            })
        }
        else{
            User.create({
                uid: req.auth.uid,
                bucket_name: req.auth.uid
            })
            .then((onfulfilled, onrejected) => {
                if(onfulfilled) {
                    res.json({
                        status: true,
                        bucket: true
                    })
                }
                if(onrejected) {
                    res.json({
                        status: true,
                        bucket: false
                    })
                }
            })
        }

    })

})

export default router