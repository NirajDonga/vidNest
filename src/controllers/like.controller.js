import mongoose, {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params;
    //TODO: toggle like on video

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid videoId provided");
    }

    const liked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    });

    if(liked) {
        await Like.findByIdAndDelete(liked?._id);
        return res.status(200)
            .json(new ApiResponse(200, {}, "Like Removed From video"));
    }
    else {
        await Like.create({
            video: videoId,
            likedBy: req.user?._id
        });
        return res.status(200)
            .json(new ApiResponse(200, {}, "Like Added To video"));
    }

});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    //TODO: toggle like on comment

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid commentId provided");
    }

    const liked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    });

    if(liked) {
        await Like.findByIdAndDelete(liked?._id);
        return res.status(200)
            .json(new ApiResponse(200, {}, "Like Removed From Comment"));
    }
    else {
        await Like.create({
            comment: commentId,
            likedBy: req.user?._id
        });
        return res.status(200)
            .json(new ApiResponse(200, {}, "Like Added To Comment"));
    }

});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    const userId = req.user?._id;
    if(!userId) {
        throw new ApiError(400, "Invalid user id");
    }

    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(userId),
                video: { $exists: true }
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "likedVideos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails"
                        }
                    },
                    {
                        $addFields: {
                            ownerDetails: { $arrayElemAt: ["$ownerDetails", 0] }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likedVideo: { $arrayElemAt: ["$likedVideos", 0] }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 0,
                likedVideo: {
                    _id: 1,
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    views: 1,
                    createdAt: 1,
                    ownerDetails: {
                        username: 1,
                        avatar: 1
                    }
                }
            }
        }
    ]);

    return res.status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
});

export {
    toggleCommentLike,
    toggleVideoLike,
    getLikedVideos
}