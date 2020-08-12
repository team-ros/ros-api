import express from 'express'
import elastic from '@elastic/elasticsearch'
import lodash from 'lodash'
import translatte from 'translatte'
import pdf from 'pdf-parse'
import fileSystem from 'fs'
import mammoth from 'mammoth'
const client = new elastic.Client({ node: 'http://88.99.35.174:9200' })
const router = express.Router()


import minio from '../../../minio/connection'
import { v4 as uuidv4 } from 'uuid'
import multer from 'multer'
import minioClient from '../../../minio/connection'
import { user, object } from '../../../database/schema'
import { data } from '@tensorflow/tfjs-node'
var upload = multer({ dest: '/tmp' })

const cocoSsd = require('@tensorflow-models/coco-ssd');
const tf = require('@tensorflow/tfjs-node');
const fs = require('fs').promises;



router.post("/*", upload.single('upload'), (req, res) => {
    console.log(req._parsedUrl)
    const objectName = uuidv4()
    console.log(req.file)
    minioClient.bucketExists(String(req.auth.uid).toLowerCase(), (err, exists) => {
        if (err) {
            console.log("error finding bucket")
        }
        if (exists) {
            minioClient.fPutObject(String(req.auth.uid).toLowerCase(), objectName, req.file.path, ({
                'Content-Type': req.file.mimetype,
            }), (err) => {
                if (err) {
                    console.log(err)
                    res.status(500)
                    res.json({
                        status: false,
                        upload: false
                    })
                } else {
                    user.findOne({
                        uid: req.auth.uid
                    }).then((result) => {
                        if (result) {
                            console.log(result)
                            if (req._parsedUrl.path == "/") {
                                object.create({
                                    type: false,
                                    file_type: req.file.mimetype,
                                    object_size: req.file.size,
                                    object_uuid: objectName,
                                    object_path: "/",
                                    object_user_path: req._parsedUrl.path,
                                    object_user_name: req.file.originalname,
                                    owner_uid: result.uid,
                                    parent_id: "1"        
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
                                                    translatte(countString, { to: "de" }).then((transletedString) => {
                                                        console.log(transletedString.text)
                                                        client.index({
                                                            index: req.auth.uid.toLowerCase(),
                                                            body: {
                                                                search: transletedString.text,
                                                                object_uuid: objectName
                                                            }
                                                        }).then((onfullfilled, onrejected) => {
                                                            if (onfullfilled) {
                                                                console.log(onfullfilled)
                                                            }
                                                            if (onrejected) {
                                                                console.log(onrejected)
                                                            }
                                                        })
                                                    })
    
                                                })
                                        }
                                        if (req.file.mimetype == "application/pdf") {
                                            let dataBuffer = fileSystem.readFileSync(req.file.path)
                                            pdf(dataBuffer).then((data) => {
                                                console.log(data.text)
                                                client.index({
                                                    index: req.auth.uid.toLowerCase(),
                                                    body: {
                                                        search: data.text,
                                                        object_uuid: objectName
                                                    }
                                                })
                                            })
                                        }
                                        if (req.file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                                            mammoth.extractRawText({ path: req.file.path })
                                                .then(function (result) {
                                                    console.log(result.value)
                                                    client.index({
                                                        index: req.auth.uid.toLowerCase(),
                                                        body: {
                                                            search: result.value,
                                                            object_uuid: objectName
                                                        }
                                                    })
                                                })
                                                .done();
                                        }
                                    }
                                    if (onrejected) {
                                        res.status(500)
                                        res.json({
                                            status: false,
                                            upload: true,
                                            database: false,
                                        })
                                    }
                                })
                            } else {
                                let fullPath = req._parsedUrl.path
                                let splittedPath = fullPath.split("/")
                                const parentName = splittedPath[splittedPath.length - 2]
                                console.log(splittedPath)
                                console.log("parentName", parentName)

                                object.findOne({
                                    owner_uid: req.auth.uid,
                                    object_user_name: parentName,
                                    type: true
                                }).then((onfullfilled, onrejected) => {
                                    if (onfullfilled) {
                                            object.create({
                                                type: false,
                                                file_type: req.file.mimetype,
                                                object_size: req.file.size,
                                                object_uuid: objectName,
                                                object_path: onfullfilled.object_path + onfullfilled.object_uuid + "/",
                                                object_user_path: req._parsedUrl.path,
                                                object_user_name: req.file.originalname,
                                                owner_uid: result.uid,
                                                parent_id: onfullfilled.object_uuid     
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
                                                                translatte(countString, { to: "de" }).then((transletedString) => {
                                                                    console.log(transletedString.text)
                                                                    client.index({
                                                                        index: req.auth.uid.toLowerCase(),
                                                                        body: {
                                                                            search: transletedString.text,
                                                                            object_uuid: objectName
                                                                        }
                                                                    }).then((onfullfilled, onrejected) => {
                                                                        if (onfullfilled) {
                                                                            console.log(onfullfilled)
                                                                        }
                                                                        if (onrejected) {
                                                                            console.log(onrejected)
                                                                        }
                                                                    })
                                                                })
                
                                                            })
                                                    }
                                                    if (req.file.mimetype == "application/pdf") {
                                                        let dataBuffer = fileSystem.readFileSync(req.file.path)
                                                        pdf(dataBuffer).then((data) => {
                                                            console.log(data.text)
                                                            client.index({
                                                                index: req.auth.uid.toLowerCase(),
                                                                body: {
                                                                    search: data.text,
                                                                    object_uuid: objectName
                                                                }
                                                            })
                                                        })
                                                    }
                                                    if (req.file.mimetype == "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
                                                        mammoth.extractRawText({ path: req.file.path })
                                                            .then(function (result) {
                                                                console.log(result.value)
                                                                client.index({
                                                                    index: req.auth.uid.toLowerCase(),
                                                                    body: {
                                                                        search: result.value,
                                                                        object_uuid: objectName
                                                                    }
                                                                })
                                                            })
                                                            .done();
                                                    }
                                                }
                                                if (onrejected) {
                                                    res.status(500)
                                                    res.json({
                                                        status: false,
                                                        upload: true,
                                                        database: false,
                                                    })
                                                }
                                            })
                                        
                                    }
                                    if (onfullfilled == null) {
                                        res.status(406)
                                        res.json({
                                            status: false,
                                            parent: "not existing"
                                        })
                                    }
                                    if (onrejected) {
                                        console.log(onrejected)
                                    }
                                })
                            }
                        } else {
                            res.status(500)
                            res.json({
                                status: false,
                                upload: true,
                                database: false
                            })
                        }
                    })
                }
            })
        } else {
            res.status(500)
            res.json({
                status: "invalid",
                bucket: "not existing"
            })
        }
    })
})

export default router