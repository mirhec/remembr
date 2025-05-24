import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json();

        // Validierung
        if (!email || !password || !name) {
            return NextResponse.json(
                { message: "Name, E-Mail und Passwort werden benötigt" },
                { status: 400 }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                { message: "Das Passwort muss mindestens 8 Zeichen lang sein" },
                { status: 400 }
            );
        }

        // Benutzer registrieren
        const user = await registerUser({ name, email, password });

        return NextResponse.json(
            { message: "Benutzer erfolgreich registriert", userId: user.id },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);

        if (error.message === "User with this email already exists") {
            return NextResponse.json(
                { message: "Ein Benutzer mit dieser E-Mail-Adresse existiert bereits" },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: "Fehler bei der Registrierung" },
            { status: 500 }
        );
    }
}
