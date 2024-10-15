import { resend } from "@/lib/resend";
import VerificationEmail from "../../emails/VerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";


export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode:string,
):
    Promise<ApiResponse> //this line means we are returing a promise named apiresponse which expect following parameters to return

{
    try {
         await resend.emails.send({
           from: "Acme <onboarding@resend.dev>",
           to: email,
           subject: "Verification code",
           react: VerificationEmail({username,otp:verifyCode})
         });
        return { success: true, message: "successfully send email verificiaton" };
    } catch (emailError) {
        console.error("error sending verificaton mail", emailError);
        return {success:false,message:'Failed to send email verificiaton'}
        
    }
}