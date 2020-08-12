import express from 'express'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
const router = express.Router()


router.post("/", (req, res) => {
    console.log(req.headers)
    user.findOne({
        uid: req.auth.uid
    }).then((result) => {
        if (result && req.headers.existing_user == 'true') {
            res.json({
                status: true,
                login: true,
                data: req.auth
            })
        } else if (result && req.headers.existing_user == 'false') {
            res.json({
                status: false,
                user: "existing"
            })
        } else if (!result && req.headers.existing_user == 'true') {
            res.status(200)
            res.json({
                status: false,
                user: "not existing"
            })
        } else if (!result && req.headers.existing_user == 'false') {
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