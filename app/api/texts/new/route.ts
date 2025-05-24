import { NextRequest, NextResponse } from "next/server";
import { createText } from "@/lib/api/texts";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Nicht autorisiert" },
                { status: 401 }
            );
        }

        const { title, content, tags } = await request.json();

        // Validierung
        if (!title || !content) {
            return NextResponse.json(
                { message: "Titel und Inhalt sind erforderlich" },
                { status: 400 }
            );
        }

        const text = await createText({
            title,
            content,
            tags,
            userId: session.user.id
        });

        return NextResponse.json(
            { message: "Text erfolgreich gespeichert", textId: text.id },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating text:", error);
        return NextResponse.json(
            { message: "Fehler beim Speichern des Textes" },
            { status: 500 }
        );
    }
}
