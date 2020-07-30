import express from 'express'
import elastic from '@elastic/elasticsearch'
const client = new elastic.Client({ node: 'http://88.99.35.174:9200' })
const router = express.Router()

router.post( "/", (req, res) => {
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
})

export default router