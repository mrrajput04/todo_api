const { userData, otpSchema, RefreshToken } = require("../models");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const JwtService = require("../services/JwtService");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, REFRESH_SECRET } = require("../config");
const CustomErrorHandler = require("../error/CustomErrorHandler");
const { emailService } = require("../services/emailVerify");
const { otpEmail } = require("../services/otpEmail");
const otpGenerator = require("otp-generator");
const path = require("path");

const salt = 10;

exports.getApi = (req, res) => {
  res.send("You are ready to go!");
};

exports.userRegister = async (req, res, next) => {
  const registerSchema = Joi.object({
    firstName: Joi.string().min(3).max(15).required(),
    lastName: Joi.string().min(3).max(15).required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-z0-9!@#$]{5,30}$"))
      .min(6)
      .max(30)
      .required(),
    confirm_password: Joi.ref("password"),
  });

  const { error } = registerSchema.validate(req.body);

  if (error) {
    error.status = 400;
    return next(error);
  }
  
  try {
    const exist = await userData.exists({ email: req.body.email });
    if (exist) {
      return next(
        CustomErrorHandler.alreadyExist({message:'This email already exists'})
      );
    }
  } catch (err) {
    return next(err);
  }

  const { firstName, lastName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const header = req.headers.host;
  const user = new userData({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });
  let access_token;
  let refresh_token;
  try {
    const result = await user.save();
    access_token = JwtService.sign({ _id: result._id });
    refresh_token = JwtService.sign({ _id: result._id }, REFRESH_SECRET, "1y");
    await RefreshToken.create({ token: refresh_token });
    emailService(result.email, access_token, header);
    res.status(200).json({
      message:
        "User registered successfully, Please check your email to verify",
      refresh_token: refresh_token,
    });
  } catch (err) {
    return next(err);
  }
};

exports.userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userData.findOne({ email });
    if (user.isVerified === false) {
      return res.status(400).json({ message: 'please verify your email' });
    }
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ user_id: userData._id, email }, JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      return res.status(200).json({ access_token: user.token, message:'login successful'});
    }
    res.status(400).json({message: 'Invalid email or password'});
  } catch (error) {
    next(error);
  }
};

// exports.genAccessToken = async(req,res)=>{
//   const Id = req.token.user_id;
//   console.log(Id,'==<<<')
//   res.send(Id)
// };

exports.forgetPassword = async (req, res, next) => {
  try {
    const email = req.body.email;
    const exist = await userData.exists({ email });
    if (!exist) {
      return next(CustomErrorHandler.notFound({message:'invalid email'}));
    }
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
    });
    const otpSave = new otpSchema({ otp, email });
    await otpSave.save();
    otpEmail(otp, req.body.email);
    res.status(200).json({ message: 'check your email to reset password' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.otpVerify = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await userData.findOne({ email });
    if (!user) {
      return next(CustomErrorHandler.notFound({message:'invalid email'}));
    }
    const userExist = await otpSchema.findOne({ email, otp });
    if (!userExist) {
      return next(CustomErrorHandler.wrongOtp({message:'invalid otp'}));
    }
    const token = jwt.sign({ user_id: user._id }, JWT_SECRET, {
      expiresIn: "2h",
    });
    res.status(200).json({ access_token: token });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const Id = req.token.user_id;
    const password = req.body.password;
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userData.findByIdAndUpdate(
      Id,
      { password: hashedPassword },
      { new: true }
    );
    res.status(200).json({
      message: "password updated successfully",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const Id = req.auth._id;
    const user = await userData.findById(Id);
    if (!user) {
      res.sendFile(path.join(__dirname, "../view/notVerify.html"));
      return next(CustomErrorHandler.unAuthorized({message:'unauthorized access'}));
    }
    user.isVerified = true;
    await user.save();
    res.sendFile(path.join(__dirname, "../view/verify.html"));
  } catch (error) {
    return next(CustomErrorHandler.unAuthorized({message:'unauthorized access'}));
  }
};
