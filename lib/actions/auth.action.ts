"use server";

import { cookies } from "next/headers";
import { auth, db } from "@/firebase/admin";

const ONE_WEEK = 60 * 60 * 24 * 7; // in seconds

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
  // expiresIn expects milliseconds — ONE_WEEK * 1000 = 7 days in ms
  const sessionCookie = await auth.createSessionCookie(token, {
    expiresIn: ONE_WEEK * 1000,
  });
  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK, // maxAge expects seconds
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
}

export async function signIn(params: SignInParams) {
  const { email, idToken } = params;

  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      return { success: false, message: "User not found. Create an account first." };
    }
    await setSessionCookie(idToken);
    return { success: true, message: "Signed in successfully." };
  } catch (e: any) {
    console.log(e);
    return { success: false, message: "Failed to login to account" };
  }
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  return { success: true };
}

// Gets the current user from the session cookie
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db.collection("users").doc(decodedClaims.uid).get();
    if (!userRecord.exists) return null;
    return { ...userRecord.data(), id: userRecord.id } as User;
  } catch (e) {
    console.log("Error verifying session cookie:", e);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user;
}
