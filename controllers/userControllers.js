
const { config } = require("dotenv");
const Users = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary");
const { resetCode, mailConfig } = require("../utils/resetPassword");
const ResetCode = require("../model/resetCodeModel");

// Helper function for email validation
function validateEmail(email) {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return emailRegex.test(email);
}

// Password validation function
function validatePassword(password) {
  const minLength = 8;
  const maxLength = 12;
  const lengthRequirement = new RegExp(`^.{${minLength},${maxLength}}$`);
  const complexityRequirement = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/;

  if (!lengthRequirement.test(password)) {
    return {
      isValid: false,
      message: `Password must be between ${minLength} and ${maxLength} characters long.`,
    };
  }

  if (!complexityRequirement.test(password)) {
    return {
      isValid: false,
      message:
        "Password must include uppercase letters, lowercase letters, numbers, and special characters.",
    };
  }

  // Determine password strength
  let strength = "Weak";
  if (password.length >= 10) {
    strength = "Medium";
  }
  if (password.length === 12 && complexityRequirement.test(password)) {
    strength = "Strong";
  }

  return {
    isValid: true,
    message: `Password strength: ${strength}`,
  };
}

const createUser = async (req, res) => {
  console.log(req.body);
  const { firstName, lastName, email, password, confirmPassword } = req.body;

  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    return res.json({
      success: false,
      message: "Please enter all the fields.",
    });
  }

  // Email validation
  if (!validateEmail(email)) {
    return res.json({
      success: false,
      message: "Invalid email format.",
    });
  }

  // Password validation
  const passwordValidationResult = validatePassword(password);
  if (!passwordValidationResult.isValid) {
    return res.json({
      success: false,
      message: passwordValidationResult.message,
    });
  }

  try {
    const existingUser = await Users.findOne({ email: email });
    if (existingUser) {
      return res.json({
        success: false,
        message: "User already exists.",
      });
    }

    const randomSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, randomSalt);

    const newUser = new Users({
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: encryptedPassword,
      confirmPassword: encryptedPassword
    });

    await newUser.save();
    res.status(200).json({
      success: true,
      message: "User created successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json("Server Error");
  }
};

const loginUser = async (req, res) => {
  console.log(req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      success: false,
      message: "Please enter all fields.",
    });
  }

  if (!validateEmail(email)) {
    return res.json({
      success: false,
      message: "Invalid email format.",
    });
  }

  try {
    const user = await Users.findOne({ email: email });
    if (!user) {
      return res.json({
        success: false,
        message: "User does not exist.",
      });
    }

    const databasePassword = user.password;
    const isMatched = await bcrypt.compare(password, databasePassword);

    if (!isMatched) {
      return res.json({
        success: false,
        message: "Invalid Credentials.",
      });
    }

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET, {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      success: true,
      message: "User logged in successfully.",
      token: token,
      userData: user,
      isAdmin: user.isAdmin,
    });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Server Error",
      error: error,
    });
  }
};

const resetPassword = async (req, res) => {
  const UserData = req.body;
  console.log(UserData);
  if (!validateEmail(UserData?.email)) {
    return res.json({
      success: false,
      message: "Invalid email format.",
    });
  }

  const user = await Users.findOne({ email: UserData?.email });
  if (!user) {
    return res.json({
      success: false,
      message: "No user found with the given email.",
    });
  }

  const OTP = resetCode();
  console.log(user.id);
  console.log(OTP);

  await ResetCode.findOneAndUpdate(
    {
      userId: user.id,
    },
    {
      resetCode: OTP,
    },
    { upsert: true }
  );

  const MailConfig = mailConfig();

  const mailOptions = {
    from: "bhanurai001@gmail.com",
    to: UserData?.email,
    subject: "Password Reset Code",
    text: `Your password reset code is: ${OTP}`,
  };

  try {
    await MailConfig.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "Code has been sent to your given email",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Failed to send reset code to your email:" + error.message,
    });
  }
};

const verifyResetCode = async (req, res) => {
  const { resetCode, email } = req.body;

  if (!validateEmail(email)) {
    return res.json({
      success: false,
      message: "Invalid email format.",
    });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.json({
        success: false,
        message: "User not found with the provided email.",
      });
    }

    const savedResetCode = await ResetCode.findOne({ userId: user._id });
    if (!savedResetCode || savedResetCode.resetCode != resetCode) {
      return res.json({
        success: false,
        message: "Invalid reset code.",
      });
    }

    return res.json({
      success: true,
      message: "Reset code verified successfully.",
    });
  } catch (error) {
    console.error("Error in verifyResetCode:", error);
    return res.json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

const updatePassword = async (req, res) => {
  const { email, password } = req.body;

  if (!validateEmail(email)) {
    return res.json({
      success: false,
      message: "Invalid email format.",
    });
  }

  const passwordValidationResult = validatePassword(password);
  if (!passwordValidationResult.isValid) {
    return res.json({
      success: false,
      message: passwordValidationResult.message,
    });
  }

  try {
    const randomSalt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, randomSalt);

    await Users.findOneAndUpdate({ email }, { password: encryptedPassword });

    return res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.json({
      success: false,
      message: "Server Error: " + error.message,
    });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decodedToken.id;
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    res.status (200).json({
      success: true,
      message: "User profile retrieved successfully",
      userProfile: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact,
        location: user.location,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status (401).json({
      success: false,
      message: "Unauthorized",
    });
  }
};

const updateUserProfile = async (req, res) => {
  console.log(req.files);
  try {
    // Check if user object exists in the request
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not authenticated.",
      });
    }

    const user = await Users.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { firstName, lastName, email, contact, location, profileImage } = req.body;

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email && validateEmail(email)) user.email = email;
    if (contact) user.contact = contact;
    if (location) user.location = location;
    if (req.files) {
      const uploadedImage = await cloudinary.v2.uploader.upload(
        req.files.profileImage.path,
        {
          folder: "profile_images",
          crop: "scale",
        }
      );
      user.profileImage = uploadedImage.secure_url;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      userProfile: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        contact: user.contact,
        location: user.location,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

module.exports = {
  createUser,
  loginUser,
  resetPassword,
  verifyResetCode,
  updatePassword,
  getUserProfile,
  updateUserProfile,
};
