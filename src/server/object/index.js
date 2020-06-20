import express from 'express'
const router = express.Router()

// import routes
import create_dirRoute from './create_dir'
import deleteRoute from './delete'
import getRoute from './get'
import moveRoute from './move'
import searchRoute from './search'
import uploadRoute from './upload'

// apply routes
router.use( "/create-dir", create_dirRoute )
router.use( "/delete", deleteRoute )
router.use( "/get", getRoute )
router.use( "/move", moveRoute )
router.use( "/search", searchRoute )
router.use( "/upload", uploadRoute )

export default router