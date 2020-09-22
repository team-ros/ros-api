import express from 'express'
import { user, object } from '../../../../database/schema'
const router = express.Router()

router.post( "/*", (req, res) => {
    console.log(req._parsedUrl.path)
    user.findOne({
        uid: req.auth.uid
    }).then((onfulfilled, onrejected) => {
        if (onfulfilled) {
            object.find({
                owner_uid: req.auth.uid,
                object_path: {
                    $regex: req._parsedUrl.path + ".*"
                }
            }).then((onfulfilled, onrejected) => {
                if (onfulfilled) {
                    res.json({
                        status: true,
                        storage_data: onfulfilled
                    })
                }
                if (onrejected) {
                    res.status(500)
                    res.json({
                        status: false,
                        database: false
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