import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import UnverifiedUser from "../../Models/unverifiedUser.model.js";
import  sendEmail  from "../../utils/sendEmail.js";
import User from "../../Models/user.model.js";


export const generateAccessTokenAndRefereshToken = async(userId)=>{
const user = await User.findById(userId);
const accessToken = user.generateAccessToken("5h");
const refreshToken = user.generateRefreshToken("12h");
user.refreshToken=refreshToken;
user.save({validateBeforeSave:false});
return {refreshToken,accessToken}
}

export const registerUserController = async (req, res) => {
  try {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, {}, "All fields are required");
  }
  
  if(password.length < 6){
    throw new ApiError(401,{},"password must be contain Atleast 6 characters")
  }

  const existUser = await User.findOne({ email });
  if (existUser) {
    throw new ApiError(409, {}, "User already exists");
  }

  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  await sendEmail(
    email,
    "Verify Your Email",
    `<p>Your verification code is <b>${OTP}</b>. It expires in 10 minutes.</p>`
  );

  let findUser;

  const unverifiedUserExist = await UnverifiedUser.findOne({ email });

  if (unverifiedUserExist) {
    const updatedUser = await UnverifiedUser.findOneAndUpdate(
      { email },
      {
        fullName,
        password,
        OTP
      },
      { new: true }
    );
    if (!updatedUser) {
      throw new ApiResponse(500, {}, "Something went wrong in updating user");
    }

    findUser = updatedUser;
  } else {
    const createUser = await UnverifiedUser.create({
      fullName,
      email,
      password,
      OTP
    });

    if (!createUser) {
      throw new ApiError(500, {}, "Something went wrong in registering user");
    }

    findUser = createUser;
  }

  const sanitizedUser = await UnverifiedUser.findById(findUser._id).select(
    "-password -OTP"
  );

  res
    .status(201)
    .json(new ApiResponse(200, sanitizedUser, `Check OTP at ${sanitizedUser.email}`));
} catch (error) {
   res.json(new ApiError(error.statusCode,error.error,error.message)) 
  }

};

export const resendOtpController = async (req,res)=>{
try {
  const {email} = req.body;
  if(!email){
    throw new ApiError(404,{},"Email must required")
  }
  const checkUser = await UnverifiedUser.findOne({email});
  if(!checkUser){
    throw new ApiError("User doesn't Exist signup again")
  }
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();

  await sendEmail(
    email,
    "Verify Your Email",
    `<p>Your verification code is <b>${OTP}</b>. It expires in 10 minutes.</p>`
  );
const updateOtp = await UnverifiedUser.updateOne({ email }, { $set: {OTP, otpExpiry: Date.now() + 10 * 60 * 1000 } });
  if(updateOtp.modifiedCount === 0){
    throw new ApiError(401,{},"Failed to Resend OTP!")
  }
  res.status(200).json(new ApiResponse(200,{},`OTP sent to your ${email}`))
} catch (error) {
  res.status(500).json(new ApiError(error.statusCode,error.error,error.message))
}
} 


export const verifiedAccountController = async (req, res, next) => {
  try {
    const { email, OTP } = req.body;

    if (!email || !OTP) {
      throw new ApiError(400, {}, "Email and OTP are required");
    }

    const unverifiedUser = await UnverifiedUser.findOne({ email, OTP });

    if (!unverifiedUser) {
      throw new ApiError(400, {}, "Incorrect or expired OTP");
    }

    const { fullName, password } = unverifiedUser;

    // Create verified user
    const createdUser = await User.create({ 
      fullName,
      email,
      password,isActive : true,
      lastActiveAt : new Date()});
    if (!createdUser) {
      throw new ApiError(500, {}, "Error during registration");
    }

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = await generateAccessTokenAndRefereshToken({
      _id: createdUser._id,
    });

    // Save refreshToken
    createdUser.refreshToken = refreshToken;
    await createdUser.save();

    // Delete unverified user
    await UnverifiedUser.deleteOne({ _id: unverifiedUser._id });

    // Prepare user data (sanitize)
    const userSafeData = createdUser.toObject();
    delete userSafeData.password;
    delete userSafeData.refreshToken;
    delete userSafeData.resetPasswordToken;
    delete userSafeData.resetPasswordExpires;

    req.user = createdUser;

    // Set secure cookies
    const cookieOptions = {
      httpOnly: true,
      secure: true, // Make sure you're using HTTPS in production
      sameSite: "Strict",
    };

    const responseData = {
      user: userSafeData,
      accessToken,
    };

    return res
      .status(201)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(new ApiResponse(201, responseData, "Registered successfully"));

  } catch (error) {
    return res.status(error.statusCode || 500).json(
      new ApiError(error.statusCode || 500, error.error || {}, error.message || "Internal Server Error")
    );
  }
};



//login user
export const loginUserController = async(req,res)=>{
  try{
const {email,password}=req.body;
if(!email && !password){
    throw new ApiError(401,{},"username or password required");
}
const user = await User.findOne({email});
if(!user){
    throw new ApiError(404,{},"username is incorrect");
}
const isPasswordValid= await user.isPasswordCorrect(password);
if(!isPasswordValid){
throw new ApiError(404,{},"Password is incorrect");
}

user.isActive = true;
user.lastActiveAt = new Date(); // Set current time
await user.save();
const logginUser = await User.findById(user._id)
.select("-password -refreshToken");


const options = {
    httpOnly:true,
    secure : true,
    sameSite:"Strict"
}

const {accessToken,refreshToken} = await generateAccessTokenAndRefereshToken(user._id);
res.status(200)
.cookie("accessToken",accessToken,options)
.cookie("refreshToken",refreshToken,options)
res.json(new ApiResponse(200,{
     user:logginUser,
     accessToken
},
"Login Successfully"
));
  }catch(error){
    res.json(new ApiError(error.statusCode,error.error,error.message))
  }
}

//generate accessToken
const refreshAccessToken = async(req,res)=>{
   const incomingRefreshToken = req?.cookie?.refreshToken || req.body.refreshToken;
   if(!incomingRefreshToken){
      throw new ApiError(401,"invalid access token");
   }
   const decodeToken = await Jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN);
   if(!decodeToken){
    throw new ApiError(401,"invalid token");
   }
   const user =await User.findById(decodeToken?._id);
   if(!user){
    throw new ApiError(401,"Invalid Token");
   }
   console.log(decodeToken);
   if(user?.refreshToken!=incomingRefreshToken){
    throw new ApiError(401,"Invalid Token");
   }
  const {accessToken,refreshToken}=await generateAccessTokenAndRefereshToken(user?._id);
  await User.updateOne(
  { _id: user._id },
  { $set: { refreshToken } }
  );

  const options = {
    httpOnly:true,
    secure:true,
     sameSite:"Strict"
  }
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,{accessToken,refreshToken},"successfully login"))
}



//logout user






