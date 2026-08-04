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

const sendVendorStatusEmail = async (email,businessName,status,reason) =>{
    const isApproved = status === "approved" 

    const subject = isApproved
        ? "Your vendor application has been approved"
        : "Update on your vendor applicaiton"

    const text = isApproved
        ?`congragulations, Your vendor profile "${businessName}" has approved.You can receive bookings on  One_Journey`
        :`<p>Your vendor profile <b>${businessName}</b> was not approved.</p>
        \n\nReason:${reason}\n\n
        <p>You can update your profile and reapply.</p>`

    const html = isApproved
        ?`<P>Congragulations,Your vendor profile <b>${businessName}</b>has been approved. You can now bookings on One_Journey</p>`
        :`<p>Your vendor profile <b>${businessName}</b> was not approved</p>
        <p><b>Reason:</b>${reason}</p>
        <p>You can update your profile and reapplay</p>`

    await transporter.sendMail({
        from:`"One Journey weddong planner" <${process.env.EMAIL_USER}>`,
        to:email ,
        subject,
        text,
        html,
    })
}


module.exports =  { sendOTPEmail , sendResetpasswordEmail ,sendVendorStatusEmail }