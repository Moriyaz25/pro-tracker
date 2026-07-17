import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/context/AuthProvider";
import PwaRegister from "@/components/PwaRegister";

export const metadata = {
  title: "Hospital PRO Tracker",
  description: "Live GPS visit verification for hospital PRO field teams.",
  applicationName: "Hospital PRO Tracker",
  formatDetection: { telephone: false },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "PRO Tracker",
  },
};

export const viewport = {
  themeColor: "#1976D2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <PwaRegister />
          <Toaster
            position="top-center"
            containerStyle={{ top: "max(16px, env(safe-area-inset-top))" }}
            toastOptions={{
              style: {
                borderRadius: "14px",
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(10px)",
                color: "#0f2942",
                boxShadow: "0 8px 24px rgba(15,71,126,0.12)",
                maxWidth: "min(92vw, 420px)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
