import { ReactNode } from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IP Geolocation Detector",
  description: "Detect your IP address and geolocation information",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
