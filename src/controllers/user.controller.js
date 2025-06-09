import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => {
    try{
        const user = await User.findById(userId);
        const accessToken = await User.generateAccessToken();
        const refreshToken = await User.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return {accessToken, refreshToken};

    } catch {
        throw new ApiError(501, "Something went wrong while generating the access or refresh token");
    }
};

const registerUser = asyncHandler(async (req, res) => {
   
    // get user details from frontend
    const {fullname, email, username, password} = req.body;
   
    // validation - like not empty
    if([fullname, email, username, password].some((field) => 
        field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    // if user already exists: username & email
    const existsUser = await User.findOne({ username });
    const existsemail = await User.findOne({ email }); 

    if(existsUser) {
        throw new ApiError(408, "This Username already exists");
    }
    if(existsemail) {
        throw new ApiError(408, "This email is already registerd.");
    }

    // check for images, check for avtar
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is required");
    }
    
    // upload to cloudnary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    let coverImage;
    if(coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if(!avatar) {
        throw new ApiError(400, "Avatar File upload failed");
    }
    
    // create user object - create entry in db.
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })
    
    // remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )    
    
    // check for user creation
    if(!createdUser) {
        throw new ApiError(500, "something went wrong while registering user");
    }

    // return response
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd succesfully")
    )
});

const loginUser = asyncHandler(async(req, res) => {

    // req.body -> take data
    const {email, username, password} = req.body; 
    
    // username or email
    if(!username && !email) {
        throw new ApiError(400, "Username or email required");
    }
    
    // find user
    // dont have to check firther because username and email both are unique.
    const user = await User.findOne({
        $or: [{username}, {email}]
    });
    if(!user) {
        throw new ApiError(404, "user doesn't exists");
    }
    
    // password check
    const isPasswordValid = await User.isPasswordCorrect(password);
    if(!isPasswordValid) {
        throw new ApiError(401, "Incorrect Password");
    }
    
    // access and refresh token generate
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken");

    // send cookie
    const options = {
        httpOnly: true,
        secure: true
    };

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options) 
    .json(
        new ApiResponse(200, 
            {
                user: loggedInUser, accessToken, 
                refreshToken
            },
            "User loggedin successfully" 
        )
    )

});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    );

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out Successfully"));
});

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    if(!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken, 
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id);
        if(!user) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
    
        if(incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {newAccessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        return res.status(200)
        .cookie("accessToken", newAccessToken, options)
        .cookie("RefreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, {newAccessToken, newRefreshToken}, "AccessToken refreshed successfully")
        );
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token");
    }

});

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body;

    const user = User.findById(req.user?._id)
    
    const isPasswordCorrect = user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid Passsword");
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false});

    return res.status(200)
    .json(new ApiResponse(200, "Password changed successfully"));

});

const getCurrentUse = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current USer fetched Successfully");
});

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, email} = req.body;

    if(!fullname && !email) {
        throw new ApiError(400, "All fields are required");
    }

    const updates = {};
    if (fullname) updates.fullname = fullname;
    if (email) updates.email = email;

    User.findByIdAndUpdate(
        req.user?._id,  
        { $set: updates },
        { new:true }
    ).select("-password");

    return res.status(200)
    .json(new ApiResponse(200, user, "Account details updated Successfully")); 

});

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.file?.path;

    if(!avatarLocalPath) {
        throw new ApiError("avatar file is missing");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if(!avatar.url) {
        throw new ApiError(400, "error while uploading avatar");
    }
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                avatar = avatar.url;
            }
        },
        {new: true}
    ).select("-password");

    return res.status(200)
    .json(new ApiResponse(200, user, "Avatar updated Successfully")); 
});

const updateUserCoverImage = asyncHandler(async(req, res) => {
    const coverImageLocalPath = req.file?.path;

    if(!coverImageLocalPath) {
        throw new ApiError("CoverImage file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!coverImage.url) {
        throw new ApiError(400, "error while uploading cover Image");
    }
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                coverImage: coverImage.url;
            }
        },
        {new: true}
    ).select("-password");

    return res.status(200)
    .json(new ApiResponse(200, user, "cover iamge updated Successfully")); 
});


export { 
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUse,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage
 };
