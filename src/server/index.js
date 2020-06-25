// import and initialize express
import express from 'express'
const app = express()

// define port express listens on
app.listen( process.env.PORT || 8080 )

// import middleware
import cors from 'cors'

// apply middleware
app.use( cors() )

// import routes
import userRoute from './user'
import objectRoute from './object'

// apply routes
app.use( "/user", userRoute )
app.use( "/object", objectRoute )

