import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { Apiresponse } from "../utils/ApiResponse.js";

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
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar File is required");
    }
    
    // upload to cloudnary
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar File is required");
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
        new Apiresponse(200, createdUser, "User registerd succesfully");
    )

});

export { registerUser };
