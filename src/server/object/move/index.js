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
                        console.log(uuidPath)
                        if (onfulfilled.object_user_name != req.body.Name) {
                            object.find({ //check if new name is already set
                                owner_uid: req.auth.uid,
                                object_user_name: req.body.Name
                            }).then((onfulfilled, onrejected) => {
                                if (onfulfilled) {
                                    if (onfulfilled.length == 0) { //new name is available
                                        if (oldUserPath == req.body.Path) { //object is not getting moved
                                            console.log("if")
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
                                                            object.find({
                                                                owner_uid: req.auth.uid
                                                            }).then((onfulfilled, onrejected) => {
                                                                if (onfulfilled) {
                                                                    res.json({
                                                                        status: true,
                                                                        move: true,
                                                                        storage_data: onfulfilled
                                                                    })
                                                                }
                                                                if (onrejected) {
                                                                    res.status(500)
                                                                    res.json({
                                                                        status: false,
                                                                        move: true
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
                                            }
                                        } else { //object is getting moved and renamed
                                            let check = new RegExp("^(/[^/ ]*)+/?$")
                                            if (check.test(req.body.Path)) { //check if sent path is valid
                                                const newPath = req.body.Path
                                                let parentPath = newPath
                                                let newSplittedPath = newPath.split("/")
                                                let parentName = newSplittedPath[newSplittedPath.length - 2]
                                                newSplittedPath.splice(-2, 2)
                                                if (newSplittedPath.length == 1) {
                                                    parentPath = "/" //dont search for parent when its root
                                                } else {
                                                    parentPath = newSplittedPath.join("/") + "/"
                                                }
                                                console.log(parentPath)


                                                object.findOne({ //get the parent of the new location
                                                    owner_uid: req.auth.uid,
                                                    type: true,
                                                    object_user_path: parentPath,
                                                    object_user_name: parentName
                                                }).then((onfulfilled, onrejected) => {
                                                    if (onfulfilled) {
                                                        if (!onfulfilled.object_path.includes(uuid) || !onfulfilled.object_uuid == uuid) {
                                                            console.log(onfulfilled)
                                                            const newParentUUID = onfulfilled.object_uuid
                                                            const newUUIDPath = onfulfilled.object_path + newParentUUID
                                                            const newParentPath = onfulfilled.object_user_path + onfulfilled.object_user_name
                                                            console.log(uuidPath)
                                                            object.updateOne({ //update the main object
                                                                object_uuid: req.body.Object_ID
                                                            },
                                                                {
                                                                    object_path: newUUIDPath + "/",
                                                                    object_user_path: newPath,
                                                                    object_user_name: req.body.Name,
                                                                    parent_id: newParentUUID
                                                                }).then((onfulfilled, onrejected) => {
                                                                    if (onfulfilled) {
                                                                        console.log(onfulfilled)
                                                                        object.find({
                                                                            object_path: {
                                                                                $regex: uuidPath + uuid + ".*"
                                                                            }
                                                                        }).then((onfulfilled, onrejected) => { //nested objects to update
                                                                            if (onfulfilled) {
                                                                                console.log(onfulfilled)

                                                                                if (onfulfilled.length != 0) {
                                                                                    for (let i of onfulfilled) {
                                                                                        let fullUserPath = i.object_user_path
                                                                                        let fullUUIDPath = i.object_path
                                                                                        let splittedUserPath = fullUserPath.split("/")
                                                                                        let splittedUUIDPath = fullUUIDPath.split("/")
                                                                                        console.log("for i")
                                                                                        console.log(splittedUUIDPath)
                                                                                        console.log(splittedUserPath)
                                                                                        // if (splittedUUIDPath.includes(uuid)) {
                                                                                        //nested paths
                                                                                        splittedUserPath.splice(0, splittedUUIDPath.indexOf(uuid))
                                                                                        splittedUUIDPath.splice(0, splittedUUIDPath.indexOf(uuid))
                                                                                        splittedUserPath.splice(splittedUUIDPath.indexOf(uuid), 1, req.body.Name)


                                                                                        // }



                                                                                        fullUUIDPath = newUUIDPath + "/" + splittedUUIDPath.join("/")
                                                                                        fullUserPath = newParentPath + "/" + splittedUserPath.join("/")


                                                                                        object.updateOne(i, {
                                                                                            object_user_path: fullUserPath,
                                                                                            object_path: fullUUIDPath
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
                                                                                }
                                                                                object.find({
                                                                                    owner_uid: req.auth.uid
                                                                                }).then((onfulfilled, onrejected) => {
                                                                                    if (onfulfilled) {
                                                                                        res.json({
                                                                                            status: true,
                                                                                            move: true,
                                                                                            storage_data: onfulfilled
                                                                                        })
                                                                                    }
                                                                                    if (onrejected) {
                                                                                        res.status(500)
                                                                                        res.json({
                                                                                            status: false,
                                                                                            move: true
                                                                                        })
                                                                                    }
                                                                                })
                                                                            } else {
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
                                                                        // res.json({
                                                                        //     status: true,
                                                                        //     move: true
                                                                        // })
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
                                                            res.status(406)
                                                            res.json({
                                                                status: false,
                                                                path: "invalid"
                                                            })
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
                        } else {
                            let check = new RegExp("^(/[^/ ]*)+/?$")
                            if (check.test(req.body.Path)) { //check if sent path is valid
                                const newPath = req.body.Path
                                let parentPath = newPath
                                let newSplittedPath = newPath.split("/")
                                let parentName = newSplittedPath[newSplittedPath.length - 2]
                                newSplittedPath.splice(-2, 2)
                                if (newSplittedPath.length == 1) {
                                    parentPath = "/" //dont search for parent when its root
                                } else {
                                    parentPath = newSplittedPath.join("/") + "/"
                                }
                                console.log(parentPath)


                                object.findOne({ //get the parent of the new location
                                    owner_uid: req.auth.uid,
                                    type: true,
                                    object_user_path: parentPath,
                                    object_user_name: parentName
                                }).then((onfulfilled, onrejected) => {
                                    if (onfulfilled) {
                                        if (!onfulfilled.object_path.includes(uuid) || !onfulfilled.object_uuid == uuid) {
                                            console.log(onfulfilled)
                                            const newParentUUID = onfulfilled.object_uuid
                                            const newUUIDPath = onfulfilled.object_path + newParentUUID
                                            const newParentPath = onfulfilled.object_user_path + onfulfilled.object_user_name
                                            console.log(uuidPath)
                                            object.updateOne({ //update the main object
                                                object_uuid: req.body.Object_ID
                                            },
                                                {
                                                    object_path: newUUIDPath + "/",
                                                    object_user_path: newPath,
                                                    parent_id: newParentUUID
                                                }).then((onfulfilled, onrejected) => {
                                                    if (onfulfilled) {
                                                        console.log(onfulfilled)
                                                        object.find({
                                                            object_path: {
                                                                $regex: uuidPath + uuid + ".*"
                                                            }
                                                        }).then((onfulfilled, onrejected) => { //nested objects to update
                                                            if (onfulfilled) {
                                                                console.log(onfulfilled)

                                                                if (onfulfilled.length != 0) {
                                                                    for (let i of onfulfilled) {
                                                                        let fullUserPath = i.object_user_path
                                                                        let fullUUIDPath = i.object_path
                                                                        let splittedUserPath = fullUserPath.split("/")
                                                                        let splittedUUIDPath = fullUUIDPath.split("/")
                                                                        console.log("for i")
                                                                        console.log(splittedUUIDPath)
                                                                        console.log(splittedUserPath)
                                                                        // if (splittedUUIDPath.includes(uuid)) {
                                                                        //nested paths
                                                                        splittedUserPath.splice(0, splittedUUIDPath.indexOf(uuid))
                                                                        splittedUUIDPath.splice(0, splittedUUIDPath.indexOf(uuid))
                                                                        //splittedUserPath.splice(splittedUUIDPath.indexOf(uuid), 1, req.body.Name)


                                                                        // }



                                                                        fullUUIDPath = newUUIDPath + "/" + splittedUUIDPath.join("/")
                                                                        fullUserPath = newParentPath + "/" + splittedUserPath.join("/")


                                                                        object.updateOne(i, {
                                                                            object_user_path: fullUserPath,
                                                                            object_path: fullUUIDPath
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
                                                                }
                                                                object.find({
                                                                    owner_uid: req.auth.uid
                                                                }).then((onfulfilled, onrejected) => {
                                                                    if (onfulfilled) {
                                                                        res.json({
                                                                            status: true,
                                                                            move: true,
                                                                            storage_data: onfulfilled
                                                                        })
                                                                    }
                                                                    if (onrejected) {
                                                                        res.status(500)
                                                                        res.json({
                                                                            status: false,
                                                                            move: true
                                                                        })
                                                                    }
                                                                })
                                                            } else {
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
                                                        // res.json({
                                                        //     status: true,
                                                        //     move: true
                                                        // })
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
                                            res.status(406)
                                            res.json({
                                                status: false,
                                                path: "invalid"
                                            })
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
                            }
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