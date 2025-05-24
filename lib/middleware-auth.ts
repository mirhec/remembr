import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

// Das gleiche Secret wie in der auth.ts-Datei verwenden
const AUTH_SECRET = process.env.NEXTAUTH_SECRET || "71b8378ab4cb0d8f67ef6a0fa7874114169c99e6d3b879ca407b77d14e0c";

// Vereinfachte Auth-Funktion für die Middleware ohne Datenbankzugriff
export async function getAuthForMiddleware(req: NextRequest) {
    try {
        const token = await getToken({
            req,
            secret: AUTH_SECRET
        });
        return token ? { user: { id: token.sub, email: token.email } } : null;
    } catch (error) {
        console.error("Middleware auth error:", error);
        return null;
    }
}
