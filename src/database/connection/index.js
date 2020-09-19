import mongoose from 'mongoose'

console.log(process.env.DATABASE_URL);

const connection = mongoose.connect( process.env.DATABASE_URL ,{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

export default connection
