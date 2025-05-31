import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

import connectDB from "./db/index.js";

// this returns a promise
connectDB() 
.then(() => {
    app.on("error", (error) => {
        console.log("Express ERROR: ", error);
        throw error
    });
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on PORT : ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("MongoDB connection failed !!!", error);
}) 







