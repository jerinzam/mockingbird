import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from './providers';
// import OrgBrandingProvider from '@/components/orgBrandingProvider';
import { OrgProvider } from '@/context/orgContext'; // <-- Import OrgProvider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>
          <OrgProvider> {/* <-- Add OrgProvider here */}
              {children}
          </OrgProvider>
        </AuthProvider>
      </body>
    </html>
  );
}