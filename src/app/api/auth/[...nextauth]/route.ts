import NextAuth from "next-auth";

import { authOptions } from "@/app/lib/auth-context";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };