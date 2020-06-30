import mongoose from 'mongoose'

const connection = mongoose.connect( process.env.DATABASE_URL ,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

export default connection