import express from 'express'
import { user, object } from '../../../database/schema'
import { v4 as uuidv4 } from 'uuid'
import body_parser from 'body-parser'
const router = express.Router()

router.use(body_parser.json())

router.post("/*", (req, res) => {
    const objectName = uuidv4()
    user.findOne({
        uid: req.auth.uid
    }).then((result) => {
        object.find({
            type: true,
            object_user_path: req._parsedUrl.path,
            object_user_name: req.body.folderName
        }).then((onfulfilled, onrejected) => {
            if (onfulfilled) {
                if (onfulfilled.length == 0) {
                    if (req._parsedUrl.path == "/") {
                        object.create({
                            type: true,
                            object_uuid: objectName,
                            object_path: "/",
                            object_user_path: req._parsedUrl.path,
                            object_user_name: req.body.folderName,
                            owner_uid: result.uid,
                            parent_id: "1"
                        }).then((onfulfilled, onrejected) => {
                            if (onfulfilled) {
                                res.json({
                                    status: true,
                                    directory: true,
                                    debug: objectName
                                })
                            }
                            if (onrejected) {
                                res.status(500)
                                res.json({
                                    status: false,
                                    directory: false
                                })
                            }
                        })
                    } else {
                        let fullPath = req._parsedUrl.path
                        let splittedPath = fullPath.split("/")
                        const parentName = splittedPath[splittedPath.length - 2]

                        console.log(splittedPath)
                        console.log("parentName", parentName)

                        splittedPath.splice(-2, 2)
                        splittedPath.length == 1 ? splittedPath = "/" : splittedPath = splittedPath.join("/") + "/"

                        console.log(splittedPath)
                        object.findOne({
                            type: true,
                            object_user_name: parentName,
                            object_user_path: splittedPath,
                            owner_uid: req.auth.uid
                        }).then((onfulfilled, onrejected) => {
                            if (onfulfilled == null) {
                                res.status(406)
                                res.json({
                                    status: false,
                                    parent: "not existing"
                                })
                            }
                            if (onfulfilled) {
                                console.log(onfulfilled)
                                object.create({
                                    type: true,
                                    object_uuid: objectName,
                                    object_path: onfulfilled.object_path + onfulfilled.object_uuid + "/",
                                    object_user_path: req._parsedUrl.path,
                                    object_user_name: req.body.folderName,
                                    owner_uid: result.uid,
                                    parent_id: onfulfilled.object_uuid
                                }).then((onfulfilled, onrejected) => {
                                    if (onfulfilled) {
                                        res.json({
                                            status: true,
                                            directory: true,
                                            debug: objectName
                                        })
                                    }
                                    if (onrejected) {
                                        res.status(500)
                                        res.json({
                                            status: false,
                                            directory: false
                                        })
                                    }
                                })
                            }
                            if (onrejected) {
                                res.status(500)
                                res.json({
                                    status: false,
                                    directory: false
                                })
                            }
                            console.log(onfulfilled)
                        })
                    }
                } else {
                    res.status(406)
                    res.json({
                        status: false,
                        directory: "existing"
                    })
                }
            }
            if (onrejected) {

            }

        })
        // 
    })
})

export default router