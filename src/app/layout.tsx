import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Z — Autonomous Career Agent",
  description:
    "AI-powered job application platform. Upload your CV, target a role, and let Project Z auto-tailor your resume, write cover letters, and submit applications.",
  keywords: [
    "AI job application",
    "auto apply",
    "career agent",
    "cover letter generator",
    "CV tailor",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
