import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";

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
    const userId = new mongoose.Types.ObjectId(user._id);
    try {
        const user = await UserModel.aggregate([
            { $match: { id: userId } },
            { $unwind: '$messages' },
            { $sort: { 'messages.createdAt': -1 } },
            { $group: { _id: '$_id', messages: { $push: '$messages' } } }
            
        ])
        if (!user || user.length === 0) {
            return Response.json(
              { success: false, message: "user not found" },
              { status: 400 }
            );
        }
         return Response.json(
           { success: true, messages:user[0].messages  },
           { status: 200 }
        );
        
    } catch (error) {
        console.log("unexcepted error occured",error);
        
        return Response.json(
          { success: true, message: "not authenticated" },
          { status: 401 }
        );
    }

}