import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// try catch for error in connecting database
// app.on for error while connecting with express


const connectDB = async () => {
    try{
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log(`\n  MongoDB connected !! DB HOST: ${connectionInstance.connection.host}`);
        // console.log(`\n ${connectionInstance.connection.port}`);
        // console.log(`\n ${connectionInstance.connection.name}`);
        // console.log(`\n ${connectionInstance.connection.readyState}`);

    } catch(error) {
        console.log("MongoDB connection error", error);
        process.exit(1);
    }

}

export default connectDB