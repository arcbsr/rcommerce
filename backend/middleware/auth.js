const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../models/UserModel");
//const config = require("../config/auth.config.js");

exports.isAuthenticatedUser = catchAsyncErrors(async (req,res,next) =>{
    const { token } = req.cookies;
    // let token = req.headers["x-access-token"];
  if (!token) {
    return next(new ErrorHandler("Please Login for access this resource", 401));
  }
  //const token = req.header(tokenHeaderKey);
  
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);//config.secret);

  req.user = await User.findById(decodedData.id);

  next();
});

// Admin Roles
exports.authorizeRoles = (...roles) =>{
    return (req,res,next) =>{
        if(!roles.includes(req.user.role)){
          return next(new ErrorHandler(`${req.user.role} can not access this resources`));
        };
        next();
    }
}