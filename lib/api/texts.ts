import { initializeDb, toDate } from "@/lib/db";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

// Type definitions for better type safety
export interface Text {
    id: string;
    title: string;
    content: string;
    tags: string | null;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
    lastPracticedAt: Date | null;
}

// Helper function to transform DB row to Text object
function mapRowToText(row: any): Text {
    return {
        id: row.id,
        title: row.title,
        content: row.content,
        tags: row.tags,
        userId: row.user_id,
        createdAt: toDate(row.created_at) || new Date(),
        updatedAt: toDate(row.updated_at) || new Date(),
        lastPracticedAt: toDate(row.last_practiced_at)
    };
}

// Get all texts for a user, sorted by last practiced date
export async function getUserTexts({
    userId,
    searchQuery = ""
}: {
    userId: string;
    searchQuery?: string
}): Promise<Text[]> {
    try {
        const db = await initializeDb();

        let query = `
      SELECT * FROM texts
      WHERE user_id = ?
    `;
        const params = [userId];

        // Add search filter if provided
        if (searchQuery) {
            query += ` AND title LIKE ?`;
            params.push(`%${searchQuery}%`);
        }

        // Add order by clause
        query += `
      ORDER BY
        CASE WHEN last_practiced_at IS NULL THEN 0 ELSE 1 END DESC,
        last_practiced_at DESC,
        created_at DESC
    `;

        const rows = await db.all(query, params);
        return rows.map(mapRowToText);
    } catch (error) {
        console.error("Error fetching user texts:", error);
        throw error;
    }
}

// Get a specific text by ID
export async function getTextById(id: string): Promise<Text | null> {
    try {
        const db = await initializeDb();
        const row = await db.get(
            `SELECT * FROM texts WHERE id = ? LIMIT 1`,
            [id]
        );

        return row ? mapRowToText(row) : null;
    } catch (error) {
        console.error("Error fetching text by ID:", error);
        throw error;
    }
}

// Create a new text
export async function createText({
    title,
    content,
    tags,
    userId
}: {
    title: string;
    content: string;
    tags?: string;
    userId: string
}): Promise<Text> {
    try {
        const db = await initializeDb();

        const id = nanoid();
        const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

        await db.run(
            `INSERT INTO texts (id, title, content, tags, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, title, content, tags || null, userId, now, now]
        );

        const text = await getTextById(id);
        if (!text) {
            throw new Error("Failed to create text");
        }

        return text;
    } catch (error) {
        console.error("Error creating text:", error);
        throw error;
    }
}

// Update an existing text
export async function updateText({
    id,
    title,
    content,
    tags
}: {
    id: string;
    title: string;
    content: string;
    tags?: string;
}): Promise<Text> {
    try {
        const db = await initializeDb();
        const now = Math.floor(Date.now() / 1000);

        await db.run(
            `UPDATE texts
       SET title = ?, content = ?, tags = ?, updated_at = ?
       WHERE id = ?`,
            [title, content, tags || null, now, id]
        );

        const text = await getTextById(id);
        if (!text) {
            throw new Error("Failed to update text");
        }

        return text;
    } catch (error) {
        console.error("Error updating text:", error);
        throw error;
    }
}

// Delete a text
export async function deleteText(id: string): Promise<void> {
    try {
        const db = await initializeDb();

        await db.run(
            `DELETE FROM texts WHERE id = ?`,
            [id]
        );
    } catch (error) {
        console.error("Error deleting text:", error);
        throw error;
    }
}

// Mark a text as practiced
export async function markTextAsPracticed(id: string): Promise<Text> {
    try {
        const db = await initializeDb();
        const now = Math.floor(Date.now() / 1000);

        await db.run(
            `UPDATE texts
       SET last_practiced_at = ?, updated_at = ?
       WHERE id = ?`,
            [now, now, id]
        );

        const text = await getTextById(id);
        if (!text) {
            throw new Error("Failed to mark text as practiced");
        }

        return text;
    } catch (error) {
        console.error("Error marking text as practiced:", error);
        throw error;
    }
}
