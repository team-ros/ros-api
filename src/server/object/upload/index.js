import express from 'express'
const router = express.Router()


import minio from '../../../minio/connection'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
var upload = multer({ dest: '/tmp' })

router.post( "/", upload.single( 'file' ), (req, res) => {
    const objectName = uuidv4()

})

export default router