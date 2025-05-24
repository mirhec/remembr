import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { initializeDb } from "@/lib/db";
import { nanoid } from "nanoid";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET || "71b8378ab4cb0d8f67ef6a0fa7874114169c99e6d3b879ca407b77d14e0c",
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    // Initialize db connection
                    const db = await initializeDb();

                    // Find user by email
                    const user = await db.get(
                        "SELECT * FROM users WHERE email = ? LIMIT 1",
                        [credentials.email.toLowerCase()]
                    );

                    if (!user || !user.password) {
                        return null;
                    }

                    // Check password
                    const passwordMatch = await bcrypt.compare(credentials.password, user.password);

                    if (!passwordMatch) {
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image
                    };
                } catch (error) {
                    console.error("Authentication error:", error);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.sub as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        }
    }
});

// Helper function to create a new user
export async function registerUser({
    name,
    email,
    password
}: {
    name: string;
    email: string;
    password: string
}) {
    try {
        // Initialize db connection
        const db = await initializeDb();

        // Check if user already exists
        const existingUser = await db.get(
            "SELECT * FROM users WHERE email = ? LIMIT 1",
            [email.toLowerCase()]
        );

        if (existingUser) {
            throw new Error("User with this email already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = nanoid();
        const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

        // Create new user
        await db.run(
            `INSERT INTO users (id, name, email, password, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [
                userId,
                name,
                email.toLowerCase(),
                hashedPassword,
                now,
                now
            ]
        );

        // Retrieve the created user
        const user = await db.get(
            "SELECT * FROM users WHERE id = ?",
            [userId]
        );

        return user;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}
