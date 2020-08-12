import express from 'express'
import { user, object } from '../../../database/schema'
import body_parser from 'body-parser'
const router = express.Router()

// import minio client
import minio from '../../../minio/connection'
import minioClient from '../../../minio/connection'

router.use(body_parser.json())

router.post("/", (req, res) => {
    user.findOne({
        uid: req.auth.uid
    }).then((onfulfilled, onrejected) => {
        if (onfulfilled) {
            object.findOne({
                owner_uid: req.auth.uid,
                object_uuid: req.body.Object_ID
            }).then((onfulfilled, onrejected) => {
                if (onfulfilled) {
                    const objectToDelete = onfulfilled
                    if (onfulfilled.type == false) {
                        minioClient.removeObject(String(req.auth.uid).toLowerCase(), onfulfilled.object_uuid)
                            .then((onfulfilled, onrejected) => {
                                if (onfulfilled) {
                                    object.deleteOne({
                                        owner_uid: req.auth.uid,
                                        object_uuid: req.body.Object_ID
                                    }).then((onfulfilled, onrejected) => {
                                        if (onfulfilled) {
                                            res.json({
                                                status: true,
                                                delete: true
                                            })
                                        }
                                        if (onrejected) {
                                            res.status(500)
                                            res.json({
                                                status: false,
                                                delete: false
                                            })
                                        }
                                    })
                                }
                                if (onrejected) {
                                    res.status(500)
                                    res.json({
                                        status: false,
                                        delete: false
                                    })
                                }
                            })
                    } else {
                        object.find({
                            object_path: {
                                $regex: onfulfilled.object_path + ".*"
                            }
                        }).then((onfulfilled, onrejected) => {
                            if (onfulfilled) {
                                
                                let folderToDelete = []
                                let filesToDelete = []

                                for (let i of onfulfilled) {
                                    let fullPath = i.object_path
                                    let splittedPath = fullPath.split("/")

                                    if (splittedPath.includes(objectToDelete.object_uuid)) {
                                        if (i.type == true) {
                                            folderToDelete.push(i)
                                        } else {
                                            filesToDelete.push(i)
                                        }
                                    }
                                }
                                console.log(folderToDelete)
                                console.log(filesToDelete)

                                if (folderToDelete.length != 0) {
                                    for (let ii of folderToDelete) {
                                        object.deleteOne({
                                            owner_uid: req.auth.uid,
                                            object_uuid: ii.object_uuid
                                        }).then((onfulfilled, onrejected) => {
                                            if (onrejected) {
                                                res.status(500)
                                                res.json({
                                                    status: false,
                                                    delete: false
                                                })
                                            }
                                        })
                                    }
                                }

                                if (filesToDelete.length != 0) {
                                    console.log("deletecall")
                                    minioClient.removeObjects(String(req.auth.uid).toLowerCase(), filesToDelete)
                                        .then((result) => {
                                            console.log(result)
                                            if (onfulfilled) {
                                                console.log("onfulfilled")
                                                for (let iii of filesToDelete) {
                                                    object.deleteOne({
                                                        owner_uid: req.auth.uid,
                                                        object_uuid: iii.object_uuid
                                                    }).then((onfulfilled, onrejected) => {
                                                        if (onrejected) {
                                                            res.status(500)
                                                            res.json({
                                                                status: false,
                                                                delete: false
                                                            })
                                                        }
                                                    })
                                                }     
                                            }
                                            if (onrejected) {
                                                res.status(500)
                                                res.json({
                                                    status: false,
                                                    delete: false
                                                })
                                            }
                                        })
                                }

                                object.deleteOne({
                                    owner_uid: req.auth.uid,
                                    object_uuid: req.body.Object_ID
                                }).then((onfulfilled, onrejected) => {
                                    if (onfulfilled) {
                                        res.json({
                                            status: true,
                                            delete: true
                                        })
                                    }
                                    if (onrejected) {
                                        res.status(500)
                                        res.json({
                                            status: false,
                                            delete: false
                                        })
                                    }
                                })                          
                            }

                            if (onrejected) {
                                res.status(500)
                                res.json({
                                    status: false,
                                    delete: false
                                })
                            }
                        })
                    }
                }
                if (onrejected) {
                    res.status(404)
                    res.json({
                        status: false,
                        object: "not found"
                    })
                }
            })
        }
        if (onrejected) {
            res.status(404)
            res.json({
                status: false,
                user: "not found"
            })
        }
    })
})

export default router