"use client"
import { signIn, signOut, useSession } from "next-auth/react";

export function Appbar() {

    const session = useSession()

    return(
        <div className="contanier w-max bg-blue-400 flex justify-center items-center m-5 p-5">
            <div>
            {!session.data?.user && (
                <button className="p-3 gap-2 bg-blue-500" onClick={()=>signIn()}>signIN</button>
            )}
            {session.data?.user && (
                <div>
                <button className="p-3 gap-2 bg-blue-500" onClick={()=>signOut()}>signout</button>
                </div>
            )}
            </div>
        </div>
    )
}