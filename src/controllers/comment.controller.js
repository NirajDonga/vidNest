import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {json} from "express";

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const pipeline = [
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup: {
                from: "user",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $lookup: {
                from: "like",
                localField: "_id",
                foreignField: "comment",
                as: "likes"
            }
        },
        {
            $addFields: {
                totalLikes: { $size: "$likes" },
                LikedByMe: {
                    $in: [
                        req.user?._id,
                        "$likes.likedBy"
                    ]
                },
                ownerDetails: { $first: "$ownerDetails" }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                _id: 1,
                content: 1,
                createdAt: 1,
                ownerDetails: {
                    username: 1,
                    "avatar.url": 1
                },
                totalLikes: 1,
                LikedByMe: 1
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ];

    const aggCursor = Comment.aggregate(pipeline);
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };
    const commentsPage = await Comment.aggregatePaginate(aggCursor, options);

    return res
        .status(200)
        .json(new ApiResponse(200, commentsPage, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const {videoId} = req.params;

    // TODO: add a comment to a video

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId");
    }

    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    const {content} = req.body;
    const owner = req.user?._id;
    if (!owner) {
        throw new ApiError(401, "Login to comment");
    }
    if (!content) {
        throw new ApiError(400, "Missing comment content");
    }

    const newComment = await Comment.create({
        content: content,
        owner: owner,
        video: videoId
    });

    if (!newComment) {
        throw new ApiError(500, "Comment creation failed");
    }

    return res.status(200)
        .json(new ApiResponse(200, newComment, "Comment added successfully"));

});

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    const {commentId} = req.params;
    const {content} = req.body;

    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }
    if(!content) {
        throw new ApiError(400, "Missing comment content");
    }

    const oldocmment = await Comment.findById(commentId);
    if(req.user?._id !== oldocmment.owner) {
        throw new ApiError(401, "You are not authorized to update this comment");
    }

    const comment = await Comment.findByIdAndUpdate(
        {
            commentId: commentId,
        },
        {
            $set: {
                content: content,
            }
        },
        { new: true }
    )
    if(!comment) {
        throw new ApiError(405, "Comment ");
    }

    res.status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));

});

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment

    const {commentId} = req.params;
    if(!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid commentId");
    }

    const comment = await Comment.findById(commentId);
    if(!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if(req.user?._id !== comment.owner) {
        throw new ApiError(401, "You are not authorized to delete this comment");
    }

    const deleted = Comment.findByIdAndDelete(commentId);

    if(!deleted) {
        throw new ApiError(405, "Comment not deleted");
    }

    return res.status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));

});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}