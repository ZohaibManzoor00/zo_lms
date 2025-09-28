import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./themes.css";
import "./globals.css";
// import Script from "next/script";

export const metadata: Metadata = {
  title: "Zo Learning Hub",
  description: "Zo Learning Hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {/* <Script src="https://unpkg.com/@styleglide/theme-editor" /> */}

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={[
            "light",
            "dark",
            "ocean",
            "ocean-dark",
            "sunset",
            "sunset-dark",
            "forest",
            "forest-dark",
            "coffee",
            "coffee-dark",
            "lavender",
            "lavender-dark",
            "rose",
            "rose-dark",
            "mint",
            "mint-dark",
            "slate",
            "slate-dark",
            "crimson",
            "crimson-dark",
            "amber",
            "amber-dark",
            "teal",
            "teal-dark",
            "calypso",
            "calypso-dark",
          ]}
        >
          {children}
          <Toaster closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
