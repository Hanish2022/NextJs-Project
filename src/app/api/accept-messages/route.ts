import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";

//ek post req bnao jis se jo currently login user h vo toggle kr paye to whether he want to accept or not messages


//this one is for status updating of message accepting
export async function POST(request:Request) {
    await dbConnect()

    //now i have currentlhy login user
    //getiserversession current user ka session de deta h
    const session = await getServerSession(authOptions);
    //session k andr user h
    const user: User = session?.user as User;
    if (!session || !session.user) {
         return Response.json(
           { success: false, message: "Not Authenticated" },
           { status: 400 }
         );
    }

    //now i want id of user
    const userId = user._id;
    //accept krna h message or not
    const { acceptMessages } = await request.json();

    try {
      const updatedUser=  await UserModel.findByIdAndUpdate(
            userId,
            { isAcceptingMessage: acceptMessages },
            {new:true}
        )
        if (!updatedUser) {
            return Response.json(
              {
                success: false,
                message: "failed to update use rstatus to acept messages",
              },
              { status: 400 }
            );
        }
         return Response.json(
           {
             success: true,
                 message: "Message accpetence sattus updatyed successfully",
                 updatedUser
             
           },
           { status: 200 }
         );
    } catch (error) {
        console.log("Failed to update user status to accept messages");
        
        return Response.json(
          {
            success: false,
            message: "Failed to update user status to accept messages",
          },
          { status: 500 }
        );
    }

}


//this one gives back the message acceptance status
export async function GET(request:Request) {
     await dbConnect();

     //now i want to have currentlhy login user
     const session = await getServerSession(authOptions);
     //session k andr user h
     const user: User = session?.user as User;
     if (!session || !session.user) {
       return Response.json(
         { success: false, message: "Not Authenticated" },
         { status: 400 }
       );
     }

     //now i want id of user
    const userId = user._id;
   try {
     const foundUser = await UserModel.findById(userId);
     
       if (!foundUser) {
         return Response.json(
           {
             success: false,
             message: "user not found",
           },
           { status: 400 }
         );
     }
      return Response.json(
        {
          success: true,
              message: "user found",
             isAcceptingMessages:foundUser.isAcceptingMessage
        },
        { status: 200 }
      );
  
   } catch (error) {
      console.log("error in getting message accpetance message");

      return Response.json(
        {
          success: false,
          message: "error in getting message accpetance message",
        },
        { status: 500 }
      );
  
   }   
}