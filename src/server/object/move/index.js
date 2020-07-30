import express from 'express'
import { user, object } from '../../../database/schema'
import body_parser from 'body-parser'
import { tr } from 'translatte/languages'
const router = express.Router()

router.use(body_parser.json())

router.post( "/", (req, res) => {
    user.findOne({
        uid: req.auth.uid
    }).then((result) => {
        object.update({
            object_user_path: req.body.newPath,
            object_user_name: req.body.newName
        }).then((onfulfilled, onrejected) => {
            if (onfulfilled) {
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
    })
})

export default router