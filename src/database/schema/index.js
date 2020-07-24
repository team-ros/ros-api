import mongoose from 'mongoose'
import connection from '../connection'
import { Schema } from 'mongoose'

const UserModel = new mongoose.Schema({

    // _id: mongoose.Schema.Types.ObjectId,

    // firebase user id
    uid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // minio bucket name
    bucket_name: {
        type: String,
        required: true,
        unique: true
    }

})

const ObjectModel = new mongoose.Schema({

    // _id: mongoose.Schema.Types.ObjectId,

    // object type (file, dir)
    type: {
        type: Boolean, // file=false, dir=true
        required: true,
    },

    // file  mime type - only when object is a file
    file_type: {
        type: String
    },

    // size of a dir or file 
    object_size: {
        type: Number,
        required: true,
        default: 0
    },

    // the unique id of an object
    object_uuid: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // the pseudo path to an object the user sees
    object_user_path: {
        type: String,
        required: true,
        index: true
    },

    // the pseudo name of an object the user sees
    object_user_name: {
        type: String,
        required: true,
        index: true
    },

    // the time the object was created or uploaded
    created_at: {
        type: Date,
        required: true,
        default: ( new Date() )
    },

    // the last time the user visited the object
    last_visit: {
        type: Date,
        required: true,
        default: ( new Date() )
    },

    // the uid of the user
    owner_uid: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: "User"
    }

})

const user = mongoose.model( "user", UserModel )
const object = mongoose.model( "object", ObjectModel )

export {
    user,
    object
}
