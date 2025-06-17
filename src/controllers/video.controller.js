import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video

    if(!title) {
        throw  new ApiError(403, "Missing title");
    }
    if(!description) {
        throw new ApiError(403, "Missing description");
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if(!videoLocalPath) {
        throw new ApiError(403, "Missing video file");
    }
    if(!thumbnailLocalPath) {
        throw new ApiError(403, "Missing thumbnail file");
    }

    const videoRes = await uploadOnCloudinary(videoLocalPath);
    const thumbnailRes = await uploadOnCloudinary(thumbnailLocalPath);

    const video = await Video.create({
        videoFile: videoRes.url,
        thumbnail: thumbnailRes.url,
        title: title,
        description: description,
        duration: videoRes.duration,
        owner: req.user?._id
    });

    const uploaded = await Video.findById(video._id);
    if(!uploaded) {
        throw new ApiError(500, "Video upload failed");
    }

    return res.status(200)
        .json(new ApiResponse(200, video, "Video Uploaded successfully."));

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if(!videoId) {
        throw  new ApiError(403, "Give Video Id");
    }



})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}