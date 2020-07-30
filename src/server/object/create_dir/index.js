import express from 'express'
import { object } from '../../../database/schema'
import { v4 as uuidv4 } from 'uuid'
const router = express.Router()

router.post("/", (req, res) => {
    const objectName = uuidv4()
    user.findOne({
        uid: req.auth.uid
    }).then((result) => {
        object.create({
            type: true,
            object_uuid: objectName,
            object_user_path: req._parsedUrl.path,
            object_user_name: req.body.folderName,
            owner_uid: result.uid,
            parent_id: req.body.parent
        }).then((onfulfilled, onrejected) => {
            if (onfulfilled) {
                res.json({
                    status: true,
                    directory: true
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
    })
})

export default router