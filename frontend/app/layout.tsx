import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { THEME_STORAGE_KEY } from "@/store/theme-store";
import { ThemeInit } from "@/components/landing/theme-toggle";
import "../styles/globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "LunarSync",
  description: "Multi-modal lunar image correspondence.",
  openGraph: {
    type: "website",
    title: "LunarSync",
    description: "Multi-modal lunar image correspondence.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${plexMono.variable}`}>
      <head>
        {/* Apply the persisted theme before first paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var v=JSON.parse(localStorage.getItem('${THEME_STORAGE_KEY}')||'{}');if(v&&v.state&&v.state.theme==='light'){document.documentElement.classList.add('light')}}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
