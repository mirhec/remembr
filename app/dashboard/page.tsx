"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import Link from "next/link";
import { Plus, Search, Clock, Book, Tag, Edit, FileText } from "lucide-react";

interface Text {
  id: string;
  title: string;
  content: string;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
  lastPracticedAt: Date | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [texts, setTexts] = useState<Text[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Fetch texts when authenticated
    if (status === "authenticated") {
      const fetchTexts = async () => {
        try {
          const response = await fetch(
            `/api/texts?search=${encodeURIComponent(searchQuery)}`
          );
          if (!response.ok) throw new Error("Failed to fetch texts");

          const data = await response.json();
          setTexts(data);
        } catch (error) {
          console.error("Error fetching texts:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchTexts();
    }
  }, [status, searchQuery, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Wird geladen...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              Meine Texte
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Link
              href="/texts/new"
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <Plus className="mr-2 -ml-1 h-5 w-5" />
              Neuen Text hinzufügen
            </Link>
          </div>
        </div>

        <div className="my-6">
          <form onSubmit={handleSearch}>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-700 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Texte durchsuchen..."
              />
            </div>
          </form>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Texte werden geladen...
            </p>
          </div>
        ) : texts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <Book className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              Keine Texte gefunden
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchQuery
                ? "Keine Texte entsprechen Ihrer Suche."
                : "Sie haben noch keine Texte hinzugefügt."}
            </p>
            <div className="mt-6">
              <Link
                href="/texts/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <Plus className="mr-2 -ml-1 h-5 w-5" />
                Ersten Text hinzufügen
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {texts.map((text) => (
              <div
                key={text.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col"
              >
                <div className="p-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                      {text.title}
                    </h3>
                    <Link
                      href={`/texts/edit/${text.id}`}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="sr-only">Bearbeiten</span>
                    </Link>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                      {text.content}
                    </p>
                  </div>
                  {text.tags && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <Tag className="h-3 w-3 mr-1" />
                        {text.tags}
                      </div>
                    </div>
                  )}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <Clock className="h-3 w-3 mr-1" />
                      {text.lastPracticedAt ? (
                        <span>
                          Zuletzt geübt:{" "}
                          {new Date(text.lastPracticedAt).toLocaleDateString(
                            "de-DE"
                          )}
                        </span>
                      ) : (
                        <span>Noch nicht geübt</span>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <Link
                        href={`/texts/practice/${text.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Üben
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
