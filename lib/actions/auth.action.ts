"use server";

import { cookies } from "next/headers";
import { auth, db } from "@/firebase/admin";

const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

export async function signUp(params: SignUpParams) {
  const { uid, name, email } = params;

  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead.",
      };
    }

    await db.collection("users").doc(uid).set({ name, email });
    return { success: true, message: "Account created successfully." };
  } catch (e: any) {
    console.error("Error creating user:", e);

    if (e.code === "auth/email-already-in-use") {
      return { success: false, message: "Email already in use" };
    }

    return { success: false, message: "Failed to create an account" };
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  const sessionCookie = await auth.createSessionCookie(token, { expiresIn: ONE_WEEK * 1000 });
  cookieStore.set('session', sessionCookie,{
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  })
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;
  
  try{
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return { success: false, message: "User not found, Create an account first" };
    }
    await setSessionCookie(idToken);
  }catch(e: any) {
    console.log(e);
    return { success: false, message: "Failed to login to account" };
}
}

export async function signOut() {
  // Will be implemented next
  return { success: false };
}

// this fn gets the user session cookie
export async function getCurrentUser(): Promise<User | null> { //prmise coz firbase takes time to fetch the user data from the database.
  const cookieStore = await cookies();
  //getting a specific session cookie from the cookie store.
  const sessionCookie = cookieStore.get("session")?.value; //get the session from cookie notebook
  
  if (!sessionCookie) {
    return null;
  }

  try {
    // verifying the session cookie and getting the user data from the database.
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true /** checkRevoked */);
    const userRecord = await db.collection('users').doc(decodedClaims.uid).get();
    if(!userRecord.exists){
      return null;
    }
    return{...userRecord.data(), id:userRecord.id} as User;
  }catch(e){
    console.log("Error verifying session cookie:", e);
    return null;
  }

  return null;
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
