// import and initialize express
import express from 'express'
const app = express()

// define port express listens on
app.listen( process.env.PORT || 8080 )

// import middleware
import cors from 'cors'
import middleware from '../middleware'

// apply middleware
app.use( cors() )
app.use( middleware )

// import routes
import userRoute from './user'
import objectRoute from './object'


// apply routes
app.use( "/user", userRoute )
app.use( "/object", objectRoute )

