import type { Metadata } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
    variable: "--font-space-grotesk",
    subsets: ["latin"]
});

const spaceMono = Space_Mono({
    variable: "--font-mono",
    subsets: ["latin"],
    weight: ["400"]
});

export const metadata: Metadata = {
    title: 'Unicord',
    description: 'Unicord is a simple, type-safe, and modular framework for building Discord bots in TypeScript.',
    openGraph: {
        title: 'Unicord',
        description: 'Unicord is a simple, type-safe, and modular framework for building Discord bots in TypeScript.',
        images: [
            {
                url: 'https://unicord.hat.fish/unicord.png',
                width: 1024,
                height: 1024,
                alt: 'Unicord logo'
            }
        ]
    }
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${spaceGrotesk.variable} ${spaceMono.variable}`}>
                {children}
            </body>
        </html>
    );
}
