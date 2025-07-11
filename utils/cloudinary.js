import dotenv from "dotenv";
dotenv.config({
    path: "./.env"
});
import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET 
});

const uploadCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null
        //upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "raw"
        })
        // file has been uploaded successfull
        //console.log("file is uploaded on cloudinary ", response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        console.log("Error coming while uploading file : "+error);
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed
        return null;
    }
}




const deleteCloudinaryFile = async (secureUrl) => {
  try {
    const publicId = await getPublicIdFromUrl(secureUrl);
    console.log("publicId : ",publicId);
    
    if (!publicId) return null;

    const response = await cloudinary.uploader.destroy(publicId);
    return response; // contains { result: 'ok' } if successful
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null;
  }
};

const getPublicIdFromUrl = (secureUrl) => {
  if (!secureUrl) return null;

  try {
    const urlParts = secureUrl.split("/upload/");
    if (urlParts.length !== 2) return null;

    // Remove version info (e.g. v1749921971)
    const pathParts = urlParts[1].split("/");
    if (pathParts[0].startsWith("v")) pathParts.shift();

    const fileWithExt = pathParts.pop(); // Get last segment (e.g. "anokux7zcypjzt9cl6c3.jpg")
    const filenameWithoutExt = fileWithExt.replace(/\.[^/.]+$/, ""); // remove file extension
    const remainingPath = pathParts.join("/");

    const publicId = remainingPath ? `${remainingPath}/${filenameWithoutExt}` : filenameWithoutExt;

    return publicId; // e.g. "skillswap/xyz123" or just "xyz123"
  } catch (err) {
    console.error("Failed to extract public_id from URL:", err);
    return null;
  }
};

export {uploadCloudinary , deleteCloudinaryFile,getPublicIdFromUrl};