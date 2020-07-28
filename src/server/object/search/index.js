import express from 'express'
import elastic from '@elastic/elasticsearch'
const client = new elastic.Client({ node: 'http://localhost:9200' })
const router = express.Router()

router.post( "/", (req, res) => {
    client.search({
        index: req.auth.uid,
        body: {
            query: {
                match: {
                    quote: req.query.search
                }
            }
        }
    })
})

export default router