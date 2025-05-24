"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ArrowUp, ArrowDown } from "lucide-react";

interface Text {
  id: string;
  title: string;
  content: string;
  tags: string;
  createdAt: Date;
  updatedAt: Date;
  lastPracticedAt: Date | null;
}

enum ViewMode {
  WORD,
  PARAGRAPH,
}

export default function PracticeTextPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, status } = useSession();
  const [text, setText] = useState<Text | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.WORD);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const router = useRouter();

  // For parsed content
  const [words, setWords] = useState<string[]>([]);
  const [paragraphs, setParagraphs] = useState<string[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch text
  useEffect(() => {
    if (status === "authenticated" && id) {
      const fetchText = async () => {
        try {
          const response = await fetch(`/api/texts/${id}`);
          if (!response.ok) {
            throw new Error("Failed to fetch text");
          }

          const data = await response.json();
          setText(data);

          // Parse content into words
          const wordArray = data.content.split(/\s+/);
          setWords(wordArray);

          // Parse content into paragraphs
          const paragraphArray = data.content.split(/\n\s*\n/);
          setParagraphs(paragraphArray);
        } catch (error) {
          console.error("Error fetching text:", error);
          setError(
            "Fehler beim Laden des Textes. Bitte versuchen Sie es später erneut."
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchText();
    }
  }, [id, status]);

  const handleNext = () => {
    const maxIndex =
      viewMode === ViewMode.WORD ? words.length - 1 : paragraphs.length - 1;
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const toggleViewMode = () => {
    // Reset index when switching modes
    setCurrentIndex(0);
    setViewMode(
      viewMode === ViewMode.WORD ? ViewMode.PARAGRAPH : ViewMode.WORD
    );
  };

  const handleComplete = async () => {
    if (!text) return;

    setIsCompleting(true);
    try {
      const response = await fetch(`/api/texts/practice/${id}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Markieren als geübt");
      }

      // Navigate back to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Error completing practice:", error);
      setError(
        "Fehler beim Markieren des Textes als geübt. Bitte versuchen Sie es später erneut."
      );
    } finally {
      setIsCompleting(false);
    }
  };

  if (status === "loading" || isLoading) {
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

  if (error) {
    return (
      <>
        <Header user={session?.user} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-md p-4 text-sm">
            {error}
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="mr-2 -ml-1 h-5 w-5" />
              Zurück zum Dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  if (!text) {
    return (
      <>
        <Header user={session?.user} />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-md p-4 text-sm">
            Text nicht gefunden.
          </div>
          <div className="mt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="mr-2 -ml-1 h-5 w-5" />
              Zurück zum Dashboard
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header user={session?.user} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
              {text.title} üben
            </h2>
            {text.tags && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tags: {text.tags}
              </p>
            )}
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button
              onClick={toggleViewMode}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              {viewMode === ViewMode.WORD ? (
                <>
                  <ArrowDown className="mr-2 -ml-1 h-5 w-5" />
                  Absatzweise
                </>
              ) : (
                <>
                  <ArrowUp className="mr-2 -ml-1 h-5 w-5" />
                  Wortweise
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <ArrowLeft className="mr-2 -ml-1 h-5 w-5" />
              Zurück
            </Link>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6 min-h-[300px]">
            <div className="font-medium text-gray-900 dark:text-white">
              {viewMode === ViewMode.WORD ? (
                <div className="space-x-1 text-lg">
                  {words.slice(0, currentIndex + 1).map((word, index) => (
                    <span key={index}>{word} </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 text-lg">
                  {paragraphs
                    .slice(0, currentIndex + 1)
                    .map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {viewMode === ViewMode.WORD
                    ? `Wort ${currentIndex + 1} von ${words.length}`
                    : `Absatz ${currentIndex + 1} von ${paragraphs.length}`}
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={handleNext}
                  disabled={
                    (viewMode === ViewMode.WORD &&
                      currentIndex === words.length - 1) ||
                    (viewMode === ViewMode.PARAGRAPH &&
                      currentIndex === paragraphs.length - 1)
                  }
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            <Check className="mr-2 -ml-1 h-5 w-5" />
            {isCompleting ? "Wird gespeichert..." : "Als geübt markieren"}
          </button>
        </div>
      </main>
    </>
  );
}
