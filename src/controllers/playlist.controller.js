import mongoose, {isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body;

    //TODO: create playlist

    if(!name) {
        throw new ApiError(400, "Missing name");
    }

    const newPlayList = await Playlist.create({
        name: name,
        description: description? description : "",
        owner: req.user?._id,
    });

    if(!newPlayList) {
        throw new ApiError(500, "Playlist creation failed");
    }

    return res.status(200)
        .json(new ApiResponse(200, newPlayList, "Playlist created succe ssfully"));

});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params;
    //TODO: get user playlists

    if(!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const playLists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
            }
        },
        {
            $addFields: {
                totalVideos: {$size: "$videos"},
                videos: { $arrayElemAt: ["$videos", 0] },
                coverThumbnail: { $arrayElemAt: ["$videos.thumbnail", 0] }
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                totalVideos: 1,
                coverThumbnail: 1,
                videos: 1,
                updatedAt: 1,
            }
        }
    ]);

    return res.status(200)
        .json(new ApiResponse(200, playLists, "Playlists fetched successfully"));

});

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    //TODO: get playlist by id

    if(!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    if(!await Playlist.findById(playlistId)) {
        throw new ApiError(404, "Playlist not found");
    }

    const playList = await Playlist.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        // owner of playlist Details
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "playListOwner",
            }
        },
        { $unwind: "$playListOwner" },

        // vidios details
        {
            $lookup: {
                from: "video",
                localField: "videos",
                foreignField: "_id",
                as: "playListVideos",
                pipeline: [
                    { $match:   { isPublished: true } },
                    { $sort:    { createdAt: -1 } },
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        }
                    },
                    { $unwind: "$ownerDetails" },
                    {
                        $project: {
                            _id: 1,
                            "vidioFile.url": 1,
                            "thumbnail.url": 1,
                            title: 1,
                            duration: 1,
                            createdAt: 1,
                            views: 1,
                            owner: {
                                "$ownerDetails._id": 1,
                                "$ownerDetails.username": 1
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$playListVideos" },
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                totalVideos: 1,
                owner: {
                    "$playListOwner._id": 1,
                    "$playListOwner.username": 1,
                    "$playlistOwner.avatar.url": 1
                },
                playListVideos: 1
            }
        }
    ]);

    return res.status(200)
        .json(new ApiResponse(200, playList, "Playlist fetched successfully"));

});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params;
    // TODO: remove video from playlist

});

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params;
    const {name, description} = req.body;
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}