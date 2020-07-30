import express from 'express'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
import { database } from 'firebase-admin'
const router = express.Router()

router.post("/", (req, res) => {
    minioClient.bucketExists(String(req.auth.uid).toLowerCase(), (err, exists) => {
        if (err) {
            console.log("error finding bucket")
        }
        if (exists) {
            let objectsList = []
            let objectsStream = minioClient.listObjects(String(req.auth.uid).toLowerCase(), '', true)

            objectsStream.on('data', (obj) => {
                objectsList.push(obj.name)
            })

            objectsStream.on('end', function () {
                minioClient.removeObjects(String(req.auth.uid).toLowerCase(), objectsList, (err) => {
                    if (err) {
                        console.log("error deleting bucket objects")
                        res.status(500)
                        res.json({
                            status: false,
                            delete: false
                        })
                    }
                    else {
                        minioClient.removeBucket(String(req.auth.uid).toLowerCase(), (err) => {
                            if (err) {
                                console.log("error deleting bucket")
                                res.status(500)
                                res.json({
                                    status: false,
                                    delete: false
                                })
                            }
                            else {
                                user.deleteOne({
                                    uid: req.auth.uid,
                                    bucket_name: req.auth.uid
                                }).then((onfullfilled, onrejected) => {
                                    if (onfullfilled) {
                                        object.deleteMany({
                                            owner_uid: req.auth.uid
                                        }).then((onfullfilled, onrejected) => {
                                            if (onfullfilled) {

                                                res.json({
                                                    status: true,
                                                    delete: true,
                                                    database: true
                                                })
                                            }
                                            if (onrejected) {
                                                res.status(500)
                                                res.json({
                                                    status: false,
                                                    delete: true,
                                                    database: false
                                                })
                                            }
                                        }).catch(err => {
                                            res.json({
                                                status: false,
                                                delete: false,
                                                debug: err
                                            })
                                        })
                                    }
                                    if (onrejected) {
                                        res.status(500)
                                        res.json({
                                            status: false,
                                            delete: true
                                        })
                                    }
                                }).catch(err => {
                                    res.json({
                                        status: false,
                                        delete: false,
                                        debug: err
                                    })
                                })
                            }
                        })
                    }
                })
            })
        } else {
            res.status(500)
            res.json({
                status: "invalid",
                bucket: "not existing"
            })
        }
    })
})

export default router