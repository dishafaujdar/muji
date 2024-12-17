import { NextAuthOptions, Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { emailSchema, passwordSchema } from "@/app/schema/type";
import { PrismaClientInitializationError } from "@prisma/client/runtime/library";
import { client } from "@/app/lib/Prisma";
import { JWT } from "next-auth/jwt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(credentials) {
        if (!credentials || !credentials.email || !credentials.password) {
          return null;
        }

        const emailVerification = emailSchema.safeParse(credentials.email);

        if (!emailVerification.success) {
          throw new Error("Invalid email");
        }

        const passwordValidation = passwordSchema.safeParse(
          credentials.password
        );

        if (!passwordValidation.success) {
          throw new Error(passwordValidation.error.issues[0].message);
        }

        try {
          const user = await client.user.findUnique({
            where: {
              email: emailVerification.data,
            },
          });
          
          if(!user){
            const newUser = await client.user.create({
                data:{
                    email: emailVerification.data,
                    password: passwordValidation.data,
                    provider: "Credentials"
                },
            });
            return newUser;
          }

          if(!user.password){
            const authuser = await client.user.update({
                where:{
                    email: emailVerification.data
                },
                data:{
                    password: passwordValidation.data
                }
            });
            return authuser
          };

          if(passwordValidation.data !== user.password){
            throw new Error("Invalid password");
          }

          return user;
        } 
        catch (error) {
            if (error instanceof PrismaClientInitializationError) {
                throw new Error("Internal server error");
              }
              console.log(error);
              throw error;
        }
      },
    }),
  ],

  pages:{
    signIn:"/auth"
  },
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt"
  },

  callbacks:{
    async jwt({token, account, profile}){
        if (account && profile) {
            token.email = profile.email as string;
            token.id = account.access_token;
        }
        return token;
    },
    async session({ session, token }: {
        session: Session,
        token: JWT;
      }) 
      {
        try {
            const user = await client.user.findUnique({
                where:{
                    email: token.email ?? ""
                }
            });

            if(user){
                session.user.id = user.id;
            }
        } catch (error) {
                if (error instanceof PrismaClientInitializationError) {
                  throw new Error("Internal server error");
                }
                console.log(error);
                throw error;              
            }
            return session;
      },

      async signIn({ account, profile }) {

        try {
          if (account?.provider === "google") {
  
            const user = await client.user.findUnique({
              where: {
                email: profile?.email!,
              }
            });
  
  
            if (!user) {
              const newUser = await client.user.create({
                data: {
                  email: profile?.email!,
                  name : profile?.name || undefined,
                  provider: "Google"
                }
              });
            }
          }
          return true;
        } catch (error) {
          console.log(error);
          //throw error;
          return false;
        }
      }
    }
  } satisfies NextAuthOptions;
