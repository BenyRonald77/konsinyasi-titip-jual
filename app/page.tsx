"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

type BH = {
  periode: string;
  total_omzet: number;
  total_hak_toko: number;
  total_hak_penitip: number;
};
type Stok = {
  id: number;
  sku: string;
  nama: string;
  nama_penitip: string;
  stok: number;
};

async function api(path: string) {
  const r = await fetch(path);
  return r.json();
}

export default function Dashboard() {
  const [bh, setBh] = useState<BH | null>(null);
  const [stok, setStok] = useState<Stok[]>([]);

  useEffect(() => {
    (async () => {
      setBh(await api("/api/bagi-hasil"));
      setStok(await api("/api/stok"));
    })();
  }, []);

  const menipis = stok.filter((x) => x.stok <= 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard</h2>
      {bh && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card">
            <h4 className="text-sm text-slate-500">Omzet {bh.periode}</h4>
            <p className="text-xl font-bold">{rupiah(bh.total_omzet)}</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-slate-500">Hak toko</h4>
            <p className="text-xl font-bold">{rupiah(bh.total_hak_toko)}</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-slate-500">Hak penitip</h4>
            <p className="text-xl font-bold">{rupiah(bh.total_hak_penitip)}</p>
          </div>
        </div>
      )}
      <div>
        <h3 className="mb-2 text-lg font-semibold">Stok Menipis (≤ 5)</h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produk</th>
              <th>Penitip</th>
              <th>Stok</th>
            </tr>
          </thead>
          <tbody>
            {menipis.length === 0 ? (
              <tr>
                <td colSpan={4}>Semua stok aman.</td>
              </tr>
            ) : (
              menipis.map((x) => (
                <tr key={x.id}>
                  <td>{x.sku}</td>
                  <td>{x.nama}</td>
                  <td>{x.nama_penitip}</td>
                  <td>{x.stok}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
