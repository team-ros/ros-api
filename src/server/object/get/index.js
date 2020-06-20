import express from 'express'
const router = express.Router()

// import routes
import by_idRoute from './by_id'
import by_pathRoute from './by_path'

// apply routes
router.use( "/by-id", by_idRoute )
router.use( "/by-path", by_pathRoute )

export default router