import { applyMigrations } from "@/lib/db";

// Server component to initialize database
export async function DatabaseInit() {
  // Ensure this only runs in a server environment context
  if (typeof window === "undefined") {
    try {
      // Initialize the database in the server component
      await applyMigrations();
    } catch (error) {
      console.error("Error initializing database:", error);
    }
  }
  // This is a server component that doesn't render anything
  return null;
}
