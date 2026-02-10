import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Truth Engine Profile Viewer',
    description: 'Powered by Truth Engine',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white antialiased">
                {children}
            </body>
        </html>
    );
}
