require("dotenv").config()
const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db") 
const authRoutes  =require("./routes/authRoutes");
const errorHandler = require("./middleware/errorHandler");
const weddingRoutes = require("./routes/weddingRoutes")
const vendorRoutes = require("./routes/vendorRoutes")
const app = express()

app.use(cors())
app.use(express.json());
app.use(cookieParser())

app.use("/api/v1/auth",authRoutes)
app.use("/api/v1/wedding",weddingRoutes)
app.use("/api/v1/vendor",vendorRoutes)
app.get("/",(req,res) => {
    res.send("One_Journey API running")
})
app.use(errorHandler)
const PORT = process.env.PORT ||5000
const startServer = async () => {
    await connectDB()
    app.listen(PORT,() => {console.log(`server running on port ${PORT}`)})
}
startServer()