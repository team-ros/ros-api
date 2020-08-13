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
            object.findOne({ //get the object we want to modify
                object_uuid: req.body.Object_ID
            }).then((onfulfilled, onrejected) => { 
                if (onfulfilled) {
                    
                    if (onfulfilled.type == true) { //check if object is file or directory (in this case its a directory)
                        const oldUserPath = onfulfilled.object_user_path
                        const uuidPath = onfulfilled.object_path
                        const oldName = onfulfilled.object_user_name
                        const uuid = onfulfilled.object_uuid
                        if (onfulfilled.object_user_name != req.body.Name) {
                            object.find({ //check if new name is already set
                                owner_uid: req.auth.uid,
                                object_user_name: req.body.Name
                            }).then((onfulfilled, onrejected) => {
                                if (onfulfilled) {
                                    if (onfulfilled.length == 0) { //new name is available

                                        if (oldUserPath == req.body.Path) { //object is not getting moved
                                            

                                            let check = new RegExp("^(/[^/ ]*)+/?$")
                                            if (check.test(req.body.Path)) { //check if sent path is valid
                                                object.updateOne({ //update the main object
                                                    object_uuid: req.body.Object_ID
                                                },
                                                {
                                                    object_user_name: req.body.Name
                                                }).then((onfulfilled, onrejected) => {
                                                    if (onfulfilled) {
                                                        console.log(onfulfilled)
                                                        object.find({
                                                            object_path: {
                                                                $regex: uuidPath + ".*"
                                                            }
                                                        }).then((ObjectToUpdate) => {
                                                            console.log(ObjectToUpdate)
                                                            for (let i of ObjectToUpdate) {
                                                                let fullUserPath = i.object_user_path
                                                                let fullUUIDPath = i.object_path
                                                                let splittedUserPath = fullUserPath.split("/")
                                                                let splittedUUIDPath = fullUUIDPath.split("/")

                                                                if (splittedUUIDPath.includes(uuid)) {
                                                                    splittedUserPath[splittedUUIDPath.indexOf(uuid)] = req.body.Name
                                                                }

                                                                fullUserPath = splittedUserPath.join("/")
                                                                fullUUIDPath = splittedUUIDPath.join("/")


                                                                object.updateOne(i, {
                                                                    object_user_path: fullUserPath
                                                                }).then((onfulfilled, onrejected) => {
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
                                                        res.json({
                                                            status: true,
                                                            move: true
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
                                            }
                                        }
                                    } 
                                }
                                if (onrejected) {
                                    res.status(500)
                                    res.json({
                                        status: false,
                                        move: false
                                    })
                                }
                            })
                            //check if there are multiple entrys with the same name first
                        }
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