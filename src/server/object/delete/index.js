import express from 'express'
import { user, object } from '../../../database/schema'
const router = express.Router()

router.post( "/", (req, res) => {
    user.findOne({
        uid: req.auth.uid
    }).then((result) => {
        
    })
})

export default router