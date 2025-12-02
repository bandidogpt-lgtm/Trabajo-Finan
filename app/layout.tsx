/* eslint-disable @next/next/no-sync-scripts */
import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Horizonte Azul",
  description: "Panel de gestión para clientes e inmuebles",
};

export default function RootLayout({ children }: { children: ReactNode }) {

  const tailwindConfigScript = `
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            brand: {
              50: '#eff6ff',
              100: '#dbeafe',
              200: '#bfdbfe',
              300: '#93c5fd',
              400: '#60a5fa',
              500: '#3b82f6',
              600: '#2563eb',
              700: '#1d4ed8'
            }
          }
        }
      }
    };
  `;

  return (
    <html lang="es">
      <head>
        <script dangerouslySetInnerHTML={{ __html: tailwindConfigScript }} />
        <script src="https://cdn.tailwindcss.com" />
      </head>

      <body className="bg-slate-100 text-slate-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
