import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { hash } from "crypto";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json(); //this is basically req.body from express

    //check if user have username and verified also
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false, //we wont rrgsiter user kyuki pehle se bna hua h user and verfied v h
          message: "Username is already taken",
        },
        { status: 400 }
      );
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    //verification code || OTP
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

      if (existingUserByEmail) {
        //if current user Verified
        if (existingUserByEmail.isVerified) {
             return Response.json(
               {
                 success: false,
                 message: "user exists with this mail",
               },
               { status: 400 }
             );
        }
        //! Now user exists with ths mail but not verified
        else {
            const hashedPassword = await bcrypt.hash(password, 10);
            //update user password
            existingUserByEmail.password = hashedPassword;
            existingUserByEmail.verifyCode = verifyCode;//verify now
            existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
            
            await existingUserByEmail.save()

    }
    } else {
      //! if existingUserByEmail nai mila means user comes for first time so use register krlo
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }
      //send verification email
     const emailResponse= await sendVerificationEmail(
          email,
          username,
          verifyCode
      )
      if (!emailResponse.success)//here we know that we need to have success if we wanna send email
      {
          return Response.json({
              success: false,
              message:emailResponse.message
          },{status:500})
      }
      return Response.json(
        {
          success: true,
          message: "User registered successfully, Please verify ur email",
        },
        { status: 201 }
      );

      
  } catch (error) {
    console.log("error regsitering user", error);
    return Response.json(
      {
        //this is frontend response
        success: false,
        message: "error registering usr",
      },
      {
        status: 500,
      }
    );
  }
}
