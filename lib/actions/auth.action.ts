'use server';
import { cookies } from 'next/headers';
import { auth, db } from "@/firebase/admin";

const one_week = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

export async function signUp(params: SignUpParams) {
    const { uid, name, email } = params;

    try {
        const userRecord = await db.collection('users').doc(uid).get();
        if (userRecord.exists) {
            return {
                success: false,
                message: 'User already exists. Please sign in instead.'
            }
        }

        await db.collection('users').doc(uid).set({
            name, email
        })

        return {
            success: true,
            message: 'Account created successfully. Please sign in.'
        }

    } catch (e: any) {
        console.error('Error creating a user', e);
        if (e.code === 'auth/email-already-exists') {
            return {
                success: false,
                message: "This email is already in use."
            }
        }

        return {
            success: false,
            message: "Failed to create an account"
        }
    }
}

export async function setSessionCookie(idtoken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idtoken, {
        expiresIn: one_week// 1 day
    });

    cookieStore.set({
        maxAge: one_week, // 1 week
        name: 'session',
        value: sessionCookie,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax',
    })
}

export async function signIn(params: SignInParams) {
    const { email, idToken } = params;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if (!userRecord) {
            return {
                success: false,
                message: 'User does not exist. Please sign up instead.'
            }
        }

        await setSessionCookie(idToken);

        return {
            success: true,
            message: 'Signed in successfully.'
        }

    } catch (e: any) {
        console.error('Error signing in', e);
        return {
            success: false,
            message: "Failed to sign in"
        }
    }
}

export async function signOut() {
try{    const cookieStore = await cookies();
    cookieStore.delete('session');
    return {
        success: true,
        message: 'Signed out successfully.'
    }}
    catch (e: any) {
        console.error('Error signing out', e);
        return {
            success: false,
            message: "Failed to sign out"
        }
    }
}    

export async function getCurrentUser(): Promise<User | null> {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) {
        return null; // No session cookie found
    }
    try {
        const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
        const userRecord = await db.collection('users').doc(decodedClaims.uid).get();

        if (!userRecord.exists) {
            return null; // User does not exist in the database
        }
        
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
    } catch (error) {
        console.error('Error getting current user', error);
        return null; // Error occurred while verifying the session cookie
    }

}

export async function isAuthenticated() {
    const user = await getCurrentUser();

    return !!user; // Returns true if user exists, false otherwise
}

