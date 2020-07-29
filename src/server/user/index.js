import express from 'express'
const router = express.Router()

// import routes
import deleteRoute from './delete'
import editRoute from './edit'
import authenticateRoute from './authenticate'

// apply routes
router.use( "/delete", deleteRoute )
router.use( "/edit", editRoute )
router.use( "/authenticate", authenticateRoute )

export default router