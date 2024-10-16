import { NextAuthOptions } from "next-auth";

//import that provider jiske sath apko authentication krni hai
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/User";

// Export the NextAuth configuration object
export const authOptions: NextAuthOptions = {
  // Define the authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials", // Unique identifier for this provider
      name: "Credentials", // Display name for the provider (shown on the login page)

      // Define the credentials fields (email and password) that the user will input
      credentials: {
        email: { label: "Email", type: "text" }, // The user will input their email
        password: { label: "Password", type: "password" }, // The user will input their password
      },

      // The `authorize` function is where the custom authentication logic happens
      async authorize(credentials: any): Promise<any> {
        await dbConnect(); // Connect to the database before querying the user

        try {
          // Query the database to find a user by email or username
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier }, // Check if the email matches
              { username: credentials.identifier }, // Alternatively, check if the username matches
            ],
          });

          // If no user is found, throw an error
          if (!user) {
            throw new Error("No user found with this email"); // Error: User doesn't exist
          }

          // If the user is found but not verified, throw an error
          if (!user.isVerified) {
            throw new Error("User is not verified"); // Error: User hasn't verified their email
          }

          // Compare the provided password with the hashed password stored in the database
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password, // The plain text password the user entered
            user.password // The hashed password from the database
          );

          // If the password is correct, return the user object
          if (isPasswordCorrect) {
            return user; // Success: Authentication succeeded, user object is returned
          } else {
            // If the password is incorrect, throw an error
            throw new Error("Password does not match"); // Error: Incorrect password
          }
        } catch (err: any) {
          // Catch any error and rethrow it with a message
          throw new Error(err.message || "An error occurred during login");
        }
      },
    }),
  ],

  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, //Secures the JWT tokens with a secret key stored in environment variables. this is not necessary but a good practice

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
  },
};
