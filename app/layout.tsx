import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestión de Clientes',
  description: 'CRUD de clientes usando Next.js con API Routes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <main>
          <div className="container">{children}</div>
        </main>
      </body>
    </html>
  );
}
