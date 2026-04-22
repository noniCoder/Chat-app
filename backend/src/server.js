import express from "express";
import dotenv from "dotenv";

import authRoutes from '../src/routes/auth.route.js'

dotenv.config()

const app = express();

const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes)

app.listen(PORT, ()=>{
    console.log(`app is running on port ${PORT}`)
})