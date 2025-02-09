import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { apiResponse } from "../utils/apiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //get data from user
  //validate filed with model
  //check is allready exist [userName , email]
  //check files are present or not [ avter ]
  //uploade them to cloudinary, avter
  //create user object-create entry in DB
  //hide the password or remove [ refresh token fileds]
  //check for user creation
  //return res

  const { userName, email, fullName, password } = req.body;

  if (
    [userName, email, fullName, password].some((filed) => filed?.trim() === "")
  ) {
    throw new apiError(400, "all fildes are required");
  }

  const existedUser = User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "user with email or username allready exists");
  }

  const avatetLocalPath = req.files?.avater[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatetLocalPath) {
    throw new apiError(400, "avatar is required");
  }
  const avater = await uploadOnCloudinary(avatetLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if(!avater){
    throw new apiError(400, "avater file is required")
  }

  const user = await User.create({
    fullName,
    avater: avater.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase()
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  )

  if(!createdUser){
    throw new apiError(500, "something went wrong , while registring a user");
  }

  return res.status(201).json(
    new apiResponse(200, createdUser, "user is registred successfully")
  )

});


export { registerUser };
