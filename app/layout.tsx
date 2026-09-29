import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Titip Jual / Konsinyasi",
  description: "Sistem konsinyasi titip jual UMKM",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/penitip", label: "Penitip" },
  { href: "/produk", label: "Produk" },
  { href: "/kasir", label: "Kasir" },
  { href: "/bagi-hasil", label: "Bagi Hasil" },
  { href: "/retur", label: "Retur" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen text-slate-900">
        <header className="bg-slate-900 text-white">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <h1 className="text-xl font-bold">Titip Jual / Konsinyasi</h1>
            <nav className="mt-2 flex flex-wrap gap-2">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className="rounded bg-slate-700 px-3 py-1.5 text-sm hover:bg-slate-600"
                >
                  {n.label}
                </a>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
