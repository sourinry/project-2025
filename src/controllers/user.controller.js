import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudnary.js";
import { apiResponse } from "../utils/apiResponse.js";

//create access and refress token
const generetAccessAndRefressToken = async (userID) => {
  try {
    const user = await User.findById(userID);
    const accessToken = user.generetAccessToken();
    const refreshToken = user.generetRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      "something went wrong while genereting access token"
    );
  }
};

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
  // console.log(req.body);

  if (
    [userName, email, fullName, password].some((filed) => filed?.trim() === "")
  ) {
    throw new apiError(400, "all fildes are required");
  }

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, "user with email or username allready exists");
  }

  const avatetLocalPath = req.files?.avater[0]?.path;
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // console.log(req.files);
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatetLocalPath) {
    throw new apiError(400, "avatar is required");
  }
  const avater = await uploadOnCloudinary(avatetLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // console.log(avater);

  if (!avater) {
    throw new apiError(400, "avater file is required");
  }

  const user = await User.create({
    fullName,
    avater: avater.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    userName: userName.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apiError(500, "something went wrong , while registring a user");
  }

  return res
    .status(201)
    .json(new apiResponse(200, createdUser, "user is registred successfully"));
});

//login user
const loginUser = asyncHandler(async (req, res) => {
  //get login details form user [ username email password] from req.body
  //validate all the data [ username, email, password]
  //find the user
  //cheak for password
  //access & refress token geneter
  //if everythings is ok login // send res

  const { userName, email, password } = req.body;

  if (!(userName || email)) {
    throw new apiError(400, "please provided userName or email");
  }

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new apiError(404, "user not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "password incorrect");
  }

  const { accessToken, refreshToken } = await generetAccessAndRefressToken(user._id);

  const logedInUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: logedInUser, accessToken, refreshToken,
        },
        "user loged in successfully"
      )
    );
});

//logout
const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiResponse(200, {}, "user logged out"));
});

export { registerUser, loginUser, logOutUser };
