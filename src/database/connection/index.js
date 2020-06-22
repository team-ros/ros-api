import mongoose from 'mongoose'

const connection = mongoose.createConnection( process.env.DATABASE_URL ,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

export default connection