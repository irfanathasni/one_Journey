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
        text:`<p>Your OTP is<b> ${otp}</b>.It expires in 10 minutes.</p>` ,
    })
}
module.exports = sendOTPEmail