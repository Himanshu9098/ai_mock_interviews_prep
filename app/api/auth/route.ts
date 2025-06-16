import { NextRequest, NextResponse } from "next/server";
import { db, auth } from "@/firebase/admin";

const ONE_WEEK = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

export async function POST(req: NextRequest) {
  const { action, ...params } = await req.json();

  if (action === "signUp") {
    const { uid, name, email } = params;
    try {
      const userRecord = await db.collection("users").doc(uid).get();
      if (userRecord.exists) {
        return NextResponse.json({
          success: false,
          message: "User already exists. Please sign in instead.",
        });
      }

      await db.collection("users").doc(uid).set({ name, email });

      return NextResponse.json({
        success: true,
        message: "Account created successfully. Please sign in.",
      });
    } catch (e: any) {
      console.error("Error creating a user", e);
      return NextResponse.json({
        success: false,
        message:
          e.code === "auth/email-already-exists"
            ? "This email is already in use."
            : "Failed to create an account",
      });
    }
  }

  if (action === "signIn") {
    const { email, idToken } = params;
    try {
      const userRecord = await auth.getUserByEmail(email);
      if (!userRecord) {
        return NextResponse.json({
          success: false,
          message: "User does not exist. Please sign up instead.",
        });
      }

      // Set session cookie
      const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: ONE_WEEK,
      });

      const response = NextResponse.json({
        success: true,
        message: "Signed in successfully.",
      });

      response.cookies.set("session", sessionCookie, {
        maxAge: ONE_WEEK / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });

      return response;
    } catch (e: any) {
      console.error("Error signing in", e);
      return NextResponse.json({
        success: false,
        message: "Failed to sign in",
      });
    }
  }

  return NextResponse.json({ success: false, message: "Invalid action" }, { status: 400 });
}