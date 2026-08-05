import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jimbo’s Nursery | Growing Gulf Coast Gardens since 1975",
  description: "Explore Santa Fe's premier nursery specializing in cold-hardy palms, native Texas plants, and tropical garden design.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased text-nursery-midnight bg-nursery-ivory">
        {children}
      </body>
    </html>
  );
}
