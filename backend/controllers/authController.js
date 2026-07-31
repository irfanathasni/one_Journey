const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const ROLES = require("../constants/roles")
const MESSAGES = require("../constants/messages")
const { isValidEmail, isValidPhone, isValidPassword } = require("../utils/validators")
const RefreshToken  = require("../models/RefreshToken")
const { generateAccessToken ,generateRefreshToken } = require("../utils/generateToken")
const { OAuth2Client } = require("google-auth-library")
const generateOTP = require("../utils/generateOTP")
const sendOTPEmail = require("../utils/sendEmail")
const crypto = require("crypto")

const register = async (req,res,next) =>{
    try{
        const { name , email ,phone , password , role} = req.body
        if(!name || !email || !phone || !password) {
            return res.status(400).json({success:false,message:MESSAGES.ALL_FIELDS_REQUIRED})
        }
        if(!isValidEmail(email)) {
            return res.status(400).json({success:false,message:MESSAGES.INVALID_EMAIL})
        }
        else if(!isValidPhone(phone)) {
            return res.status(400).json({success:false,message:MESSAGES.INVALID_PHONE})
        }
        else if(!isValidPassword(password)) {
            return res.status(400).json({success:false,message:MESSAGES.INVALID_PASSWORD})
        }
        const existingUser = await User.findOne( { email})
        if(existingUser) {
            return res.status(400).json({success:false,message:MESSAGES.EMAIL_EXISTS})
        }
        const allowedRoles = [ROLES.CUSTOMER,ROLES.VENDOR]
        const finalRole = allowedRoles.includes(role) ? role : ROLES.CUSTOMER
        const hashedPassword = await bcrypt.hash(password,10)
        const otp = generateOTP()
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000)
        const newUser = await User.create({
            name,email,phone,password:hashedPassword,role:finalRole,otp,otpExpiresAt,isVerified:false
        })
        await sendOTPEmail(email,otp)
        return res.status(201).json({success:true,message:MESSAGES.REGISTER_SUCCESS})
    }catch(error){
        next(error)
    }
}

const login = async (req,res,next) => {
    try{
        const { email ,password} = req.body
        if(!email || !password ) {
            return res.status(400).json({success:false, message:MESSAGES.ALL_FIELDS_REQUIRED})
        }
        const user = await User.findOne({ email }).select("+password")
        if(!user) {
            return res.status(401).json({success:false, message:MESSAGES.INVALID_CREDENTIALS})
        }
        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) {
            return res.status(401).json({success:false,message:MESSAGES.INVALID_CREDENTIALS})
        }
        if(!user.isVerified) {
            return res.status(403).json({success:false,message:"Please verify your email before logged in"})
        }
       const accessToken = generateAccessToken(user._id,user.role)
       const refreshToken = generateRefreshToken(user._id)

       await RefreshToken.create({
        user:user._id,
        token:refreshToken,
        expiresAt:new Date(Date.now() + 7 *24 * 60 * 60 * 1000)
       })
       return res.status(200).json({success:true,message:MESSAGES.LOGIN_SUCCESS , accessToken,refreshToken ,role:user.role})
    }catch(error){
        next(error)
    }
}

const getProfile = async (req,res,next) => {
    try{
        const user = await User.findById(req.user.userId)
        if(!user) {
            return res.status(401).json({success:false,message:MESSAGES.UNAUTHORIZED})
        }
        return res.status(200).json({success:true,
            data:{
                name:user.name ,
                email:user.email,
                phone:user.phone,
                role:user.role
            },
        });
    }catch(error){
        next(error)
    }
}

const updateProfile = async (req,res,next) => {
    try {
        const {name, phone } = req.body
        const user = await User.findById(req.user.userId)
        if(!user) {
            return res.status(400).json({success:false,message:MESSAGES.UPDATE_FAILED})
        }
        if(name) user.name =name
        if (phone) user.phone = phone
        await user.save()
        return res.status(200).json({success:true,message:MESSAGES.UPDATE_SUCCESS})
    }catch(error){
       next(error)
    }
}

const changePassword = async (req,res,next) => {
    try {
        const { currentPassword , newPassword } = req.body
        if(!currentPassword ||!newPassword) {
            return res.status(400).json({success:false,message:MESSAGES.PASSWORD_FIELDS_REQUIRED})
        }
        const user = await User.findById(req.user.userId).select("+password")
        const isMatch = await bcrypt.compare(currentPassword,user.password)
        if(!isMatch) {
            return res.status(400).json({success:false,message:MESSAGES.INCORRECT_PASSWORD})
        }
        user.password = await bcrypt.hash(newPassword,10)
        await user.save()
        return res.status(200).json({success:true,message:MESSAGES.PASSWORD_CHANGE_SUCCESS})
    }catch(error) {
        next(error)
    }
}

const logout = async (req,res,next) => {
    try{
        const { refreshToken } = req.body
        if(refreshToken) {
            await RefreshToken.deleteOne({ token :refreshToken})
        }
        return res.status(200).json({success:true,message:MESSAGES.LOGOUT_SUCCESS})
    }catch(error){
        next(error)
    }
}

const refreshAccessToken = async (req,res,next) => {
    try{
        const { refreshToken } = req.body
        if(!refreshToken) {
            return res.status(401).json({success:false,message:MESSAGES.REFRESH_TOKEN_REQUIRED})
        }
        const storedToken = await RefreshToken.findOne({token:refreshToken})
        if(!storedToken) {
            return res.status(401).json({success:false,message:MESSAGES.INVALID_REFRESH_TOKEN})
        }
        if(storedToken.expiresAt < new Date()) {
            await RefreshToken.deleteOne({ _id :storedToken._id})
            return res.status(401).json({success:false ,message:MESSAGES.REFRESH_TOKEN_EXPIRED})
        }
        const decoded = jwt.verify(refreshToken,process.env.JWT_REFRESH_SECRET)
        const user = await User.findById(decoded.userId)
        if(!user) {
            return res.status(401).json({success:false,message:MESSAGES.USER_NOT_FOUND})
        }
        const newAccessToken = generateAccessToken(user._id , user.role)
        return res.status(200).json({success:true,accessToken:newAccessToken})
    }catch (error) {
        next(error)
    }
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const googleLogin = async (req, res ,next) => {
    try{
        const { idToken } = req.body
        if(!idToken) {
            return res.status(400).json({success:false,messages:"Google token required."})
        }

        const ticket = await client.verifyIdToken({ idToken,audience:process.env.GOOGLE_CLIENT_ID})
        const payload = ticket.getPayload()
        const { email ,name ,sub :googleId} = payload
        let user = await User.findOne({ email })
        if(!user) {
            user = await User.create({name,email,googleId,role:ROLES.CUSTOMER,isVerified:true})
        }
        const accessToken = generateAccessToken(user._id,user.role)
        const refreshToken = generateAccessToken(user._id)
        await RefreshToken.create({user:user._id,token:refreshToken,expiresAt:new Date(Date.now() + 7*24 *60 *60*1000)
        })
        return res.status(200).json({success:true ,message:"google login successfull" ,accessToken,refreshToken,role:user.role})
    }catch(error){
        next(error)
    }
}
const verifyOTP = async (req,res,next) => {
    try{
        const { email , otp } = req.body
        if(!email ||!otp) {
            return res.status(400).json({success:false,message:"Email and OTP are required"})
        }
        const user = await User.findOne({ email }).select("+otp +otpExpiresAt")
        if(!user) {
            return res.status(404).json({success:false,message:"User not found"})
        }
        if(user.otp !== otp) {
            return res.status(400).json({success:false,message:"Invalid OTP"})
        }
        if(user.otpExpiresAt <new Date()) {
            return res.status(400).json({success:false,message:"OTP has expired"})
        }
        user.isVerified = true
        user.otp = undefined
        user.otpExpiresAt = undefined
        await user.save()
        return res.status(200).json({success:true,message:"Email verified successfully"})
    }catch(error){
        next(error)
    }
}

const resendOTP = async (req,res,next) => {
    try {
        const { email } = req.body
        if(!email) {
            return res.status(400).json({success:false,message:"Email is required"})
        }
        const user = await User.findOne({ email })
        if(!user) {
            return res.status(404).json({success:false,message:"User not found"})
        }
        if(user.isVerified) {
            return res.status(400).json({success:false,message:"Email already verified"})
        }
        const otp = generateOTP()
        const otpExpiresAt = new Date(Date.now() + 10 *60 *1000)
        user.otp = otp
        user.otpExpiresAt = otpExpiresAt
        await user.save()
        await sendOTPEmail(email,otp)
        return res.status(200).json({success:true,message:"New OTP sent to Your email"})
    }catch(error){
        next(error)
    }
}

const forgotPassword = async (req,res,next) => {
    try{
        const { email } = req.body 
        const user = await User.findOne({ email })
        if(!user) {
            return res.status(404).json({success:false,message:"user not found"})
        }
        const resetToken = crypto.randomBytes(32).toString("hex")
        user.resetPasswordToken = resetToken
        user.resetPasswordExpires = Date.now() + 10 *60 * 1000
        await user.save()

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`
        await sendOTPEmail.sendResetpasswordEmail(email,resetLink)
        return res.status(200).json({success:true,message:"Password reset link sent to your email"})
    }catch(error){
        next(error)
    }
}

const resetPassword = async (req,res,next) => {
    try{
        const { token } = req.params
        const { password } = req.body
        const user = await User.findOne({resetPasswordToken:token,resetPasswordExpires:{$gt:Date.now()}})
        if(!user) {
            return res.status(400).json({success:false,message:"Invalid or expired reset Token "})
        }
         user.password = await bcrypt.hash(password,10)
         user.resetPasswordToken = undefined
         user.resetPasswordExpires = undefined
         await user.save()
         return res.status(200).json({success:true,message:"Password reset successfull"})
        
    }catch(error){
        next(error)
    }
}
module.exports = { register ,login ,getProfile , updateProfile , changePassword ,logout,refreshAccessToken ,googleLogin ,verifyOTP, resendOTP , forgotPassword , resetPassword}