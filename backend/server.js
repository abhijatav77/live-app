import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import { connectDb } from './config/database.js'
import errorHandler from './middleware/errorHandler.js'
import authRoute from './routes/authRoute.js'
import sessionRoute from './routes/sessionRoute.js'


const app = express()
const PORT = process.env.PORT

const corsOption = {
    origin: process.env.CLIENT_URL,
    credentials: true
}

app.use(cors(corsOption))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get("/", (req, res) => {
    res.json({
        success: 'okay',
        message: "live class server"
    })
})

//api routes
app.use('/api/auth', authRoute)
app.use('/api/session', sessionRoute)

app.use(errorHandler)

connectDb()
.then(()=>{

    app.listen(PORT, ()=>{
        console.log(`Server runnig on port ${PORT}`)
    })
}).catch((error)=>{console.log(error.message)})