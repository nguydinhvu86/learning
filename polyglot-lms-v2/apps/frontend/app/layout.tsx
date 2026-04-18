import type { Metadata } from 'next';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch('http://127.0.0.1:3001/api/v1/public/settings', { next: { revalidate: 10 } });
    const data = await res.json();
    return {
      title: data.platform_name || 'Polyglot LMS Hub',
      description: data.tagline || 'Trilingual Learning Engine',
    };
  } catch (err) {
    return {
      title: 'Polyglot Hub',
      description: 'E-Learning Ecosystem',
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
