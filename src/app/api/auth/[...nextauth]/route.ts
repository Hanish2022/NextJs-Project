//kuch v krna h nextauth me route and option files to bnani pdegi

import { authOptions } from "./options";
import NextAuth from "next-auth/next";

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
