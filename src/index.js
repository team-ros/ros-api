import "dotenv/config"

// throw error if no database connnection is set in the environment
if( !process.env.DATABASE_URL ) throw "no database connection url set"

// checks for s3 credentials
// if( !process.env.S3_ENDPOINT ) throw " no s3 endpoint defined"
// if( !process.env.S3_PORT ) throw "no s3 port defined"
// if( !process.env.S3_USE_SSL ) throw "no s3 use ssl defined"
// if( !process.env.S3_ACCESS_KEY ) throw "no s3 access key defined"
// if( !process.env.S3_SECRET_KEY ) throw "no s3 secret key defined"


import "./server"