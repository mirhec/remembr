import { NextRequest, NextResponse } from "next/server";
import { getUserTexts } from "@/lib/api/texts";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: "Nicht autorisiert" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const searchQuery = searchParams.get("search") || "";

        const texts = await getUserTexts({
            userId: session.user.id,
            searchQuery
        });

        return NextResponse.json(texts);
    } catch (error) {
        console.error("Error fetching texts:", error);
        return NextResponse.json(
            { error: "Fehler beim Abrufen der Texte" },
            { status: 500 }
        );
    }
}
