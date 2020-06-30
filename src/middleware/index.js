import admin from "../firebase-admin/index"

const middleware = (req, res, next) => {
    let token = req.header.authorization 
    if (!token) {
        res.status(401)
        res.json({
            status: false,
            authorization: "missing"
        })
    }
    else{
        admin.auth().verifyIdToken(token)
            .then(dec => {
                res.auth = dec
                next()
            })
            .catch(err => {
                console.log(err)
                res.status(401)
                res.json({
                    status: false,
                    authorization: "invalid"
                })
            })
    }
}

export default middleware