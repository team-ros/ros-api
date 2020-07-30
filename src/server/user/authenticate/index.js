import express from 'express'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
const router = express.Router()


router.post("/", (req, res) => {
    user.findOne({
        uid: req.auth.uid
    }).then((result) => {
        if (result) {
            res.json({
                status: true,
                login: true,
            })
        } else {
            minioClient.makeBucket(String(req.auth.uid).toLowerCase(), (err) => {
                if (err) {
                    console.log("error creating bucket", err)
                    res.status(503)
                    res.json({
                        status: false,
                        bucket: false
                    })
                }
                else {
                    user.create({
                        uid: req.auth.uid,
                        bucket_name: req.auth.uid
                    }).then((onfulfilled, onrejected) => {
                        if (onfulfilled) {
                            res.json({
                                status: true,
                                bucket: true,
                                database: true
                            })
                        }
                        if (onrejected) {
                            res.status(500)
                            res.json({
                                status: false,
                                bucket: true,
                                database: false
                            })
                        }
                    })
                }
            })
        }
    })
})

export default router