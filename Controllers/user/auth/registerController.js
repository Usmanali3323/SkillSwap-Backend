import UnverifiedUser from "../../../Models/unverifiedUser.model.js";
import User from "../../../Models/user.model.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import sendEmail from "../../../utils/sendEmail.js";


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