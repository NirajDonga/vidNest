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

        // Extract public_id from the URL
        const publicId = extractPublicId(imageUrl);
        if (!publicId) {
            console.error("Could not extract public_id from URL:", imageUrl);
            return null;
        }

        // Delete file from cloudinary using the public_id
        const response = await cloudinary.uploader.destroy(publicId, {
            invalidate: true
        });

        console.log("Cloudinary deletion response:", response);
        return response;
    } catch (error) {
        console.error("Error during cloudinary deletion:", error);
        return null;
    }
}

// Helper function to extract public_id from Cloudinary URL
const extractPublicId = (url) => {
    try {
        // Cloudinary URL format: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/public_id.extension
        const urlParts = url.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        if (uploadIndex === -1) return null;

        // Get everything after 'upload/' and before the file extension
        const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');

        // Remove version if present (v1234567890/)
        const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');

        // Remove file extension
        const publicId = pathWithoutVersion.replace(/\.[^/.]+$/, '');

        return publicId;
    } catch (error) {
        console.error("Error extracting public_id:", error);
        return null;
    }
}


export {uploadOnCloudinary, deleteFromCloudinary}