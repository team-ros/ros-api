import express from 'express'
import { user, object } from '../../../database/schema'
import body_parser from 'body-parser'
import { tr } from 'translatte/languages'
const router = express.Router()

router.use(body_parser.json())

router.post("/", (req, res) => {
    user.findOne({
        uid: req.auth.uid
    }).then((onfulfilled, onrejected) => {
        if (onfulfilled) {
            object.findOne({
                object_uuid: req.body.Object_ID
            }).then((onfullfilled, onrejected) => {
                if (onfulfilled) {
                    const oldPath = onfulfilled.object_user_path
                    const oldName = onfulfilled.object_user_name
                    let check = new RegExp("^(/[^/ ]*)+/?$")
                    if (check.test(req.body.Path)) {
                        object.updateOne({
                            object_uuid: req.body.Object_ID
                        },
                            {
                                object_user_path: req.body.Path,
                                object_user_name: req.body.Name
                            }).then((onfulfilled, onrejected) => {
                                if (onfulfilled) {
                                    object.find({
                                        object_user_path: {
                                            $regex: oldPath + ".*"
                                        }
                                    }).then((ObjectToUpdate) => {
                                        for (let i of ObjectToUpdate) {
                                            let fullPath = i.object_user_path
                                            let splittedPath = fullPath.split("/")

                                            if (splittedPath.includes(oldName)) {
                                                splittedPath[splittedPath.indexOf(oldName)] = req.body.Name
                                            }

                                            fullPath = splittedPath.join("/")

                                            object.updateOne(i, {
                                                object_user_path: fullPath
                                            }).then((onfulfilled, onrejected) => {
                                                if (onfulfilled) {
                                                    res.json({
                                                        status: true,
                                                        move: true
                                                    }).end()
                                                }
                                                if (onrejected) {
                                                    res.status(500)
                                                    res.json({
                                                        status: false,
                                                        move: false
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                                if (onrejected) {
                                    res.status(500)
                                    res.json({
                                        status: false,
                                        move: false
                                    })
                                }
                            })
                    } else {
                        res.status(500)
                        res.json({
                            status: false,
                            Path: "invalid"
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