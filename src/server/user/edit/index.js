import express from 'express'
import middleware from '../../../middleware'
import admin from 'firebase-admin'
const router = express.Router()

router.post( "/", (req, res) => {
    let update = req.body
    
    admin.auth().updateUser(req.auth.uid, update)
        .then( userRecord => {
            console.log("User successfully updated!", userRecord.toJSON())
            res.json({
                status: true,
                update: true
            })
        })
        .catch(err => {
            console.log("Error updating user", err)
            res.status(503)
            res.json({          //status und update noch genauer spezifizieren
                status: false,
                update: false
            })
        })
})

export default router