import { NextRequest, NextResponse } from "next/server";
import { getTextById, updateText, deleteText } from "@/lib/api/texts";
import { auth } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Nicht autorisiert" },
                { status: 401 }
            );
        }

        const id = params.id;
        const text = await getTextById(id);

        if (!text) {
            return NextResponse.json({ message: "Text nicht gefunden" }, { status: 404 });
        }

        // Ensure user has access to this text
        if (text.userId !== session.user.id) {
            return NextResponse.json({ message: "Zugriff verweigert" }, { status: 403 });
        }

        return NextResponse.json(text);
    } catch (error) {
        console.error("Error fetching text:", error);
        return NextResponse.json(
            { message: "Fehler beim Abrufen des Textes" },
            { status: 500 }
        );
    }
}

// Update text
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Nicht autorisiert" },
                { status: 401 }
            );
        }

        const id = params.id;

        // Check if the text exists and belongs to the user
        const existingText = await getTextById(id);
        if (!existingText) {
            return NextResponse.json({ message: "Text nicht gefunden" }, { status: 404 });
        }

        if (existingText.userId !== session.user.id) {
            return NextResponse.json({ message: "Zugriff verweigert" }, { status: 403 });
        }

        // Update text
        const { title, content, tags } = await request.json();

        // Validation
        if (!title || !content) {
            return NextResponse.json(
                { message: "Titel und Inhalt sind erforderlich" },
                { status: 400 }
            );
        }

        const updatedText = await updateText({
            id,
            title,
            content,
            tags
        });

        return NextResponse.json({
            message: "Text erfolgreich aktualisiert",
            text: updatedText
        });
    } catch (error) {
        console.error("Error updating text:", error);
        return NextResponse.json(
            { message: "Fehler beim Aktualisieren des Textes" },
            { status: 500 }
        );
    }
}

// Delete text
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Nicht autorisiert" },
                { status: 401 }
            );
        }

        const id = params.id;

        // Check if the text exists and belongs to the user
        const existingText = await getTextById(id);
        if (!existingText) {
            return NextResponse.json({ message: "Text nicht gefunden" }, { status: 404 });
        }

        if (existingText.userId !== session.user.id) {
            return NextResponse.json({ message: "Zugriff verweigert" }, { status: 403 });
        }

        // Delete text
        await deleteText(id);

        return NextResponse.json({ message: "Text erfolgreich gelöscht" });
    } catch (error) {
        console.error("Error deleting text:", error);
        return NextResponse.json(
            { message: "Fehler beim Löschen des Textes" },
            { status: 500 }
        );
    }
}
