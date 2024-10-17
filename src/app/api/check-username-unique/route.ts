import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";
import { z } from "zod"
import { usernameValidation } from "@/schemas/signUpSchema";

//this is syntax
const UsernameQuerySchema = z.object({
    username:usernameValidation 
})
export async function GET(request: Request) {

    await dbConnect()
    try {
        const { searchParams } = new URL(request.url)//localhost:3000/api/check-username-unique?username=hanish
        const queryParam = {
          //extract the  query
          username: searchParams.get("username"), //here i will get username=hanish
        };
        //valdiate with zod
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result);
        
        if (!result.success) {
            const usernameErrors = result.error.format().
                username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0
                    ? usernameErrors.join(', ')
                    : "Invalid query parameter",
            },{status:400})
        }

        //now if we reach here we have the username
        const { username } = result.data
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true })

        //check if user is existed and verified also
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message:"Usernam alrrady taken"
            },{status:400})
        }
          return Response.json(
            {
              success: true,
              message: "Usernam avaialabe",
            },
            { status: 500 }
          );
    } catch (error) {
        console.log("Error checking username" ,error);
        return Response.json({
            success: false,
            message:"Error checking username"
        }, {
            status:500
        })
    }
}