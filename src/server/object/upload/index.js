import express from 'express'
import elastic from '@elastic/elasticsearch'
import lodash from 'lodash'
const client = new elastic.Client({ node: 'http://88.99.54.174:9200' })
const router = express.Router()


import minio from '../../../minio/connection'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
var upload = multer({ dest: '/tmp' })

const cocoSsd = require('@tensorflow-models/coco-ssd');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs').promises;



router.post("/*", upload.single('upload'), (req, res) => {
    console.log(req._parsedUrl)
    const objectName = uuidv4()
    console.log(req.file)
    minioClient.fPutObject(String(req.auth.uid).toLowerCase(), objectName, req.file.path, ({
        'Content-Type': req.file.mimetype,
    }), (err) => {
        if (err) {
            console.log(err)
            res.status(503)
            res.json({
                status: false,
                upload: false
            })
        }
        else {
            user.findOne({
                uid: req.auth.uid
            }).then((result) => {
                if (result) {
                    object.create({
                        type: false,
                        file_type: req.file.mimetype,
                        object_size: req.file.size,
                        object_uuid: objectName,
                        object_user_path: req._parsedUrl.path,
                        object_user_name: req.file.originalname,
                        owner_uid: result._id
                    }).then((onfullfilled, onrejected) => {
                        if (onfullfilled) {

                            res.json({
                                status: true,
                                upload: true,
                                database: true
                            })
                            if (req.file.mimetype.startsWith("image")) {
                                Promise.all([cocoSsd.load(), fs.readFile(req.file.path)])
                                    .then((results) => {
                                        // First result is the COCO-SSD model object.
                                        const model = results[0];
                                        // Second result is image buffer.
                                        const imgTensor = tf.node.decodeImage(new Uint8Array(results[1]), 3);
                                        // Call detect() to run inference.
                                        return model.detect(imgTensor);
                                    })
                                    .then((predictions) => {
                                        let results = predictions
                                        let resultValues = []
                                        for (let value of results) {
                                            resultValues.push(value.class)
                                        }
                                        let count = {};
                                        resultValues.forEach(function (i) { count[i] = (count[i] || 0) + 1; });
                                        console.log(resultValues)
                                        console.log(count)
                                        let countString = ""
                                        for (let i in count) {
                                            countString += count[i] + " " + i + " "
                                        }
                                        console.log(countString)
                                        client.index({
                                            index: req.auth.uid,
                                            body: {
                                                search: countString
                                            }
                                        }).then((onfullfilled, onrejected) => {
                                            if(onfullfilled){
                                                
                                            }
                                            if(onrejected){
                                                
                                            }
                                        })
                                    })
                            }
                        }
                        if (onrejected) {
                            res.status(503)
                            res.json({
                                status: false,
                                upload: true,
                                database: false,
                            })
                        }
                    })
                }
                else {
                    res.status(503)
                    res.json({
                        status: false,
                        upload: true,
                        database: false
                    })
                }
            })
        }
    })
})

export default router