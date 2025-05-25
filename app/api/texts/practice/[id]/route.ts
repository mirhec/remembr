import { NextRequest, NextResponse } from "next/server";
import { markTextAsPracticed, getTextById } from "@/lib/api/texts";
import { auth } from "@/lib/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { message: "Nicht autorisiert" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // Check if the text exists and belongs to the user
        const text = await getTextById(id);
        if (!text) {
            return NextResponse.json({ message: "Text nicht gefunden" }, { status: 404 });
        }

        if (text.userId !== session.user.id) {
            return NextResponse.json({ message: "Zugriff verweigert" }, { status: 403 });
        }

        // Mark as practiced
        const updatedText = await markTextAsPracticed(id);

        return NextResponse.json({
            message: "Text erfolgreich als geübt markiert",
            lastPracticedAt: updatedText.lastPracticedAt
        });
    } catch (error) {
        console.error("Error marking text as practiced:", error);
        return NextResponse.json(
            { message: "Fehler beim Markieren des Textes als geübt" },
            { status: 500 }
        );
    }
}
