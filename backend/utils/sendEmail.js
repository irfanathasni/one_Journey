const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({service:"gmail",
    auth:{user:process.env.EMAIL_USER ,
        pass:process.env.EMAIL_APP_PASSWORD
    },
})

const sendOTPEmail = async(email ,otp) =>{
    await transporter.sendMail({
        from:`"One Journey Wedding Planner" <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"One Journey - Verify your email" ,
        text:`<p>Your OTP is ${otp}.It expires in 10 minutes.</p>` ,
    })
}

const sendResetpasswordEmail = async (email,resetLink) => {
    await transporter.sendMail({
        from:`"One Journey Wedding planner" <${process.env.EMAIL_USER}>`,
        to:email,
        subject:"Reset Your Password - One Journey" ,
        text:`You requested a password reset. Click the link below to set a new password. This link expires in 10 minitus.\n\n${resetLink}\n\nif you didn't request this, please ignore email.`,
        html:`<p>You requested a password reset.Click the link below to set a new password. This link expires in 10 minitus.</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>If you didn't request this,Please ignore this email,</p>`
    })
}
module.exports =  { sendOTPEmail , sendResetpasswordEmail }