import express from 'express'
import { user, object } from '../../../database/schema'
const router = express.Router()

// import database
import { user, object } from '../../../database/schema'

// import minio client
import minio from '../../../minio/connection'

router.post( "/", (req, res) => {

    object.findOne({
        owner_uid: req.auth.uid,
        object_uuid: req.query.object_uuid
    })
    .then(( onfulfilled, onrejected ) => {
        
        if ( onfulfilled ) {

            let ObjectRootPath = new RegExp( onfulfilled.object_user_path + ".*" )

            object.find({
                owner_uid: req.auth.uid,
                oject_user_path: {
                    $regex: ObjectRootPath
                }
            })
            .then((onfulfilled, onrejected) => {
                console.log( onfulfilled )


                if ( onfulfilled ) {
                    if ( onfulfilled.length > 1 ) {

                        let toDeleteChildObjects = []
                        for ( childObject of onfulfilled ) {
                            toDeleteChildObjects.push( childObject.object_uuid )
                        }

                        minio.removeObjects( String(req.auth.uid).toLowerCase(), toDeleteChildObjects )
                        .then((onfulfilled, onrejected) => {
                            if( onfulfilled ) {

                                toDeleteChildObjects.map(( value, index ) => {
                                    return { 
                                        owner_uid: req.auth.uid,
                                        object_uuid: value
                                    }
                                })

                                object.deleteMany( toDeleteChildObjects )
                                .then(( onfulfilled, onrejected ) => {
                                    if( onfulfilled ) {
                                        return res.json({
                                            status: true,
                                            database: true,
                                            object: true
                                        })
                                    }
                                })
                                .catch( err => {
                                    res.status( 500 )
                                    return res.json({
                                        status: true,
                                        database: false,
                                        object: true
                                    })
                                })
                            }
                            if( onrejected ) {
                                res.status( 500 )
                                    return res.json({
                                        status: false,
                                        database: true,
                                        object: false
                                    })
                            }
                        })
                        .catch( err => {
                            res.status( 500 )
                            return res.json({
                                status: false,
                                object: "invalid",
                                database: false,
                                debug: err
                            })
                        })
                    }
                    else {
                        const objectName = onfulfilled[0].object_uuid
                        minio.removeObject( String(req.auth.uid).toLowerCase(), objectName )
                        .then((onfulfilled, onrejected) => {
                            if( onfulfilled ) {
                                object.deleteOne({
                                    owner_uid: req.auth.uid,
                                    object_uuid: objectName
                                })
                                .then(( onfulfilled, onrejected ) => {
                                    if( onfulfilled ) {
                                        return res.json({
                                            status: true,
                                            object: true,
                                            database: true
                                        })
                                    }
                                    if( onrejected ) {
                                        res.status( 500 )
                                        return res.json({
                                            status: false,
                                            object: true,
                                            database: false
                                        })
                                    }
                                })
                            }
                            if( onrejected ) {
                                res.status( 500 )
                                return res.json({
                                    status: false,
                                    object: false,
                                    database: null
                                })
                            }
                        })
                        .catch( err => {
                            console.log( err )
                            res.status( 500 )
                            return res.json({
                                status: false,
                                object: false,
                                database: false,
                                debug: err
                            })
                        })
                    }
                }

                if ( onrejected ) {
                    return res.json({
                        status: false,
                        object: "invalid",
                        database: true
                    })
                }
            })
        }
        if( onrejected ) {
            res.status( 404 )
            return res.json({
                status: false,
                object: "invalid",
                database: true
            })
        }
    })
    .catch( err => {
        console.log( err )
        res.status( 500 )
        return res.json({
            status: false,
            object: null,
            database: false,
            debug: err
        })
    })

})

export default router