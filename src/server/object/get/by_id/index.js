import express from 'express'
import { user, object } from '../../../../database/schema'
import minioClient from '../../../../minio/connection'
import body_parser from 'body-parser'
const router = express.Router()

router.use(body_parser.json())

router.post( "/", (req, res) => {
    user.findOne({
        uid: req.auth.uid
    }).then((onfulfilled, onrejected) => {
        if (onfulfilled) {
            object.findOne({
                owner_uid: req.auth.uid,
                object_uuid: req.body.Object_ID
            }).then((onfulfilled, onrejected) => {
                if (onfulfilled) {
                    if (onfulfilled != null) {
                        if (onfulfilled.type == false) {
                            minioClient.presignedUrl('GET', String(req.auth.uid).toLowerCase(), req.body.Object_ID, 3600, (err, presignedUrl) => {
                                if (err) return console.log(err)
                                console.log(presignedUrl)
                              })
                            // minioClient.fGetObject(String(req.auth.uid).toLowerCase(), onfulfilled.object_uuid, `/tmp/${onfulfilled.object_uuid}/${onfulfilled.object_user_name}`, (err) => {
                            //     if (err) {
                            //         res.status(500)
                            //         res.json({
                            //             status: false,
                            //             object: false,
                            //             debug: err
                            //         })
                            //     }
                            // })
                            // res.setHeader('Content-Type', onfulfilled.file_type)
                            // res.sendFile(`/tmp/${onfulfilled.object_uuid}/${onfulfilled.object_user_name}`)
                        } else {
                            res.status(406)
                            res.json({
                                status: false,
                                object: "directory"
                            })
                        }
                    } else {
                        res.status(404)
                        res.json({
                            status: false,
                            object: "not found"
                        })
                    }
                }
                if (onrejected) {

                }
            })
        }
        if (onrejected) {

        }
    })
})

export default router