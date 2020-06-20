import express from 'express'
const router = express.Router()

// import routes
import deleteRoute from './delete'
import editRoute from './edit'
import registerRoute from './register'

// apply routes
router.use( "/delete", deleteRoute )
router.use( "/edit", editRoute )
router.use( "/register", registerRoute )

export default router