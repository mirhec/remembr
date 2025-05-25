/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Aktuelle Konfiguration für Next.js 15.3.2
  serverExternalPackages: ["sqlite3", "better-sqlite3"],
  // PWA-Konfiguration durch next-pwa wird in einer separaten Datei hinzugefügt werden

  // Enable standalone output for minimal Docker image
  output: "standalone",
};

module.exports = nextConfig;
