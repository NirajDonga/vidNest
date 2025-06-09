import {v2 as cloudinary} from "cloudinary";
import fs from "fs"; // file system

import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});
// console.log(cloud_name);

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // upload file on cloudnary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        fs.unlinkSync(localFilePath);
        return response;

    } catch (error) {
        console.error("Error during cloudinary upload:", error);
        fs.unlinkSync(localFilePath); // remove the locally saved temporary files
        return null;
    }
}

const deleteFromCloudinary = async (imageUrl) => {
    try {
        if (!imageUrl) return null;
        
        // Delete file from cloudinary using the full URL
        const response = await cloudinary.uploader.destroy(imageUrl, {
            invalidate: true
        });
        return response;
    } catch (error) {
        console.error("Error during cloudinary deletion:", error);
        return null;
    }
}

export {uploadOnCloudinary, deleteFromCloudinary}