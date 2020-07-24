import express from 'express'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
const router = express.Router()


router.post( "/", (req, res) => {

    minioClient.makeBucket(String(req.auth.uid).toLowerCase(), (err) => {
        if(err) {
            console.log("error creating bucket", err)
            res.status(503)
            res.json({
                status: false,
                bucket: false
            })
        }
        else{
            user.create({
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