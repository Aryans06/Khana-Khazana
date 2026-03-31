import {Inter} from "next/font/google"
import "./globals.css";
import Header from "@/components/ui/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { neobrutalism} from "@clerk/themes";



const inter=Inter({subsets:["latin"]});




export const metadata = {
  title: "Khana-Khazana-AI Recipe Platform",
  description: "AI recipe Generator Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={{theme:neobrutalism}} >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.className}`}>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="py-8 px-4 border-t">
            <div className="max-w-6xl mx-auto flex justify-center items-center">
              <p className="text-stone-500 text-sm">
                Made by Aryan Jha with Next.js and Tailwind CSS. All rights reserved. &copy; 2026
              </p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
