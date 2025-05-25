"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useSession } from "next-auth/react";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { Sun, Moon, Monitor, Download } from "lucide-react";
import { useAddToHomeScreenPrompt } from "@/lib/pwa";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [isInstallPromptShown, setIsInstallPromptShown] = useState(false);
  const router = useRouter();
  const { promptToInstall, isInstallable } = useAddToHomeScreenPrompt();

  // Redirect if not authenticated
  if (status === "unauthenticated") {
    router.push("/login");
  }

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
  };

  const handleInstallApp = () => {
    if (promptToInstall) {
      promptToInstall();
      setIsInstallPromptShown(true);
    }
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate mb-6">
          Einstellungen
        </h2>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Erscheinungsbild
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Passen Sie das Erscheinungsbild der Anwendung an Ihre Vorlieben
              an.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex flex-col items-center p-4 rounded-lg border ${
                  theme === "light"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <Sun
                  className={`h-8 w-8 ${
                    theme === "light" ? "text-primary-600" : "text-gray-400"
                  }`}
                />
                <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Hell
                </span>
              </button>
              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex flex-col items-center p-4 rounded-lg border ${
                  theme === "dark"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <Moon
                  className={`h-8 w-8 ${
                    theme === "dark" ? "text-primary-600" : "text-gray-400"
                  }`}
                />
                <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Dunkel
                </span>
              </button>
              <button
                onClick={() => handleThemeChange("system")}
                className={`flex flex-col items-center p-4 rounded-lg border ${
                  theme === "system"
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700"
                }`}
              >
                <Monitor
                  className={`h-8 w-8 ${
                    theme === "system" ? "text-primary-600" : "text-gray-400"
                  }`}
                />
                <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  System
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              App Installation
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Installieren Sie Remembr als App auf Ihrem Gerät für ein besseres
              Erlebnis und Offline-Zugriff.
            </p>
            <div className="mt-4">
              {typeof window !== 'undefined' && (
                <button
                  onClick={handleInstallApp}
                  disabled={isInstallPromptShown || !isInstallable}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                >
                  <Download className="mr-2 -ml-1 h-5 w-5" />
                  {isInstallPromptShown
                    ? "Installation angefragt..."
                    : isInstallable 
                      ? "Als App installieren"
                      : "Installation nicht verfügbar"}
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
