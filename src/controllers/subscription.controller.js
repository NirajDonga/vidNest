import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const userId = req.user?._id;
    if(!userId) {
        throw new ApiError(400, "Login to subscribe to a channel");
    }

    const isSubscribed = Subscription.findOne({
       subscribe: userId,
       channel: channelId
    });

    if(isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id);

        return res.status(200)
            .json(new ApiResponse(200, {}, "Unsubscribed from channel"));
    }
    else {
        await Subscription.create({
            subscribe: userId,
            channel: channelId
        });

        return res.status(200)
            .json(new ApiResponse(200, {}, "Subscribed to channel"));
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channelId");
    }

    const userId = req.user?._id;
    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: channelId
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscribe",
                foreignField: "_id",
                as: "subscribers",
                pipeline: [
                    {
                        $lookup: {
                            from: "subscription",
                            localField: "_id",
                            foreignField: "channel",
                            as: "subscribedToSubscriber",
                        }
                    },
                    {
                        $addFields: {
                            iSubscribed: {
                                $in: [
                                    userId,
                                    "$subscribedToSubscriber.subscriber"
                                ]
                            },
                            subscriberCount: {
                                $size: "$subscribedToSubscriber"
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                subscribers: { $arrayElemAt: ["$subscribers", 0] }
            }
        },
        {
            $project: {
                subscribers: {
                    _id: 1,
                    username: 1,
                    "avatar.url": 1,
                    subscriberCount: 1,
                    iSubscribed: 1,
                }
            }
        }
    ]);

    return res.status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriberId");
    }

    await Subscription.aggregate([
        {
            $match: {
                subscribe: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "user",
                localField: "channel",
                foreignField: "_id",
                as: "subscribedChannels",
                pipeline: [
                    {
                        $lookup: {
                            from: "video",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos",
                            pipeline: [
                                {
                                    $sort: { createdAt: -1 }
                                },
                            ]
                        }
                    },
                    {
                        $addFields: {
                            videos: { $size: "$videos" },
                            latestVideo: {
                                $arrayElemAt: ["$videos", 0]
                            }
                        }
                    }
                ]
            }
        },
        {
           $unwind: "subscribedChannels"
        },
        {
            $project: {
                _id: 0,
                subscribedChannels: {
                    _id: 1,
                    username: 1,
                    "avatar.url": 1,
                    videos: 1,
                    latestVideo: {
                        "videoFile.url": 1,
                        "thumbnail.url": 1,
                        owner: 1,
                        title: 1,
                        duration: 1,
                        createdAt: 1,
                        views: 1,
                    }
                }
            }
        }
    ]);


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}