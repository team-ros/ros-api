import express from 'express'
import elastic from '@elastic/elasticsearch'
import minioClient from '../../../minio/connection'
const client = new elastic.Client({ node: process.env.ELASTIC_URL })
const router = express.Router()

router.post( "/", (req, res) => {
    minioClient.bucketExists(String(req.auth.uid).toLowerCase(), (err, exists) => {
        if (err) {
            console.log("error finding bucket")
        }
        if (exists) {
            client.search({
                index: req.auth.uid.toLowerCase(),
                body: {
                    query: {
                        match: {
                            search: req.query.search
                        }
                    }
                }
            }).then((result) => {
                let searchResultsArray = result.body.hits.hits
        
                let searchResultsReply = []
                for (let i of searchResultsArray) {
                    searchResultsReply.push(i._source)
                }
                res.json({
                        status: true,
                        search: true,
                        data: searchResultsReply
                })
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
