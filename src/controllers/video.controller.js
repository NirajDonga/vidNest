import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.model.js";
import {User} from "../models/user.model.js";
import {Like} from "../models/like.model.js";
import {Comment} from "../models/comment.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body;
    // get video, upload to cloudinary, create video

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
    const { videoId } = req.params;
    // get video by id

    if(!videoId) {
        throw  new ApiError(403, "Give Video Id");
    }
    if(!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid Video Id");
    }

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "likes",
                localField: "_id",
                foreignField: "video",
                as: "likes"
            }
        },
        {
            $lookup: {
                from: "User",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscription",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribers",
                        }
                    },
                    {
                        $addFields: {
                            subscriberCount: "$subscribersCount",
                            isSubscribed: {
                                $in: [
                                    req.user?._id,
                                    "$subscribers.subscriber" // subscriber in subscription model
                                ]
                            }
                        }
                    },
                    {
                        $project: {
                            username: 1,
                            "avatar.url": 1,
                            subscribersCount: 1,
                            isSubscribed: 1
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalLikes: {$size: "$likes"},
                owner: {$first: "$owner"},
                isLiked: {
                    $in: [
                        req.user?._id,
                        "$likes.likedBy" // likedBy in like model
                    ]
                }
            }
        },
        {
            $project: {
                "videoFile.url": 1,
                title: 1,
                description: 1,
                views: 1,
                totalLikes: 1,
                subscribersCount: 1,
                owner: 1,
                isLiked: 1,
                createdAt: 1,
                duration: 1,
            }
        }
    ]);

    if(!video) {
        throw new ApiError(403, "Video fetch failed");
    }

    await Video.findByIdAndUpdate(videoId, {
        $inc: {
            views: 1,
        }
    })

    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {
            watchHistory: videoId
        }
    });

    return res.status(200)
        .json(new ApiResponse(200, video, "Video Fetched successfully."));

})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: update video details like title, description, thumbnail

    if(!videoId) {
        throw new ApiError(403, "Give Video Id");
    }
    if(!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid Video Id");
    }

    const {title, description, thumbnail} = req.body;

    const updates = {};
    if(title) updates.title = title;
    if(description) updates.description = description;
    if(thumbnail) updates.thumbnail = thumbnail;

    const updatedVideo = await Video.findByIdAndUpdate(videoId,
        { $set: updates },
        { new: true }
    );

    return res.status(200)
        .json(new ApiResponse(200, updatedVideo, "Video Updated successfully."));

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: delete video

    if(!videoId) {
        throw new ApiError(403, "Give Video Id");
    }
    if(!isValidObjectId(videoId)) {
        throw new ApiError(403, "Invalid Video Id");
    }

    const video = Video.findById(videoId);
    if(!video) {
        throw new ApiError(403, "Video Not Found");
    }

    if(video?.owner.toString() !== req?.user._id.toString()) {
        throw new ApiError(403, "You are not owner");
    }

    const thumbnailUrl = video.thumbnail;
    const videoFileUrl = video.videoFile;

    await video.deleteOne();

    if(thumbnailUrl) await deleteFromCloudinary(thumbnailUrl);
    if(videoFileUrl) await deleteFromCloudinary(videoFileUrl);

    await Like.deleteMany({
        video: videoId
    });

    await Comment.deleteMany({
        video: videoId
    });

    res.status(200)
        .json(new ApiResponse(200, {}, "Video Deleted successfully."));

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