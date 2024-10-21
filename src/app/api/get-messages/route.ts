import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { User } from "next-auth";
import mongoose from "mongoose";
//this route serves messages
export async function GET(request: Request) {
  await dbConnect();

  // Get the currently logged-in user's session
  const session = await getServerSession(authOptions);
  const user: User = session?.user as User;

  if (!session || !session.user) {
    return Response.json(
      { success: false, message: "Not Authenticated" },
      { status: 400 }
    );
  }

  // Convert the user ID (string) to ObjectId for MongoDB queries
  const userId = new mongoose.Types.ObjectId(user._id);

  try {
    // Use MongoDB aggregation to fetch the user and their messages
    const user = await UserModel.aggregate([
      { $match: { id: userId } }, // Find the user by matching their ID
      { $unwind: "$messages" }, // Deconstruct the `messages` array
      { $sort: { "messages.createdAt": -1 } }, // Sort messages by creation date (descending)
      {
        $group: {
          _id: "$_id", // Group by user ID to reassemble messages
          messages: { $push: "$messages" },
        },
      },
    ]);

    if (!user || user.length === 0) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 400 }
      );
    }

    return Response.json(
      { success: true, messages: user[0].messages },
      { status: 200 }
    );
  } catch (error) {
    console.log("Unexpected error occurred", error);
    return Response.json(
      { success: false, message: "Error fetching messages" },
      { status: 500 }
    );
  }
}
