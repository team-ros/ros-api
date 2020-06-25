import { Client } from 'minio'

import "dotenv/config"

 
const minioClient = new Client({
    endPoint: String( process.env.S3_ENDPOINT ),
    port: Number( process.env.S3_PORT ),
    useSSL: false, // Boolean( process.env.S3_USE_SSL ),
    accessKey: String( process.env.S3_ACCESS_KEY ),
    secretKey: String( process.env.S3_SECRET_KEY )
});

export default minioClient