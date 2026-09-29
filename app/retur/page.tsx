"use client";

import { useEffect, useState } from "react";

type Stok = { id: number; sku: string; nama: string; stok: number };
type Retur = {
  id: number;
  tanggal: string;
  qty: number;
  keterangan: string;
  nama_produk: string;
};

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, init);
  const j = await r.json();
  return { ok: r.ok, j };
}

export default function ReturPage() {
  const [stoks, setStoks] = useState<Stok[]>([]);
  const [riwayat, setRiwayat] = useState<Retur[]>([]);
  const [f, setF] = useState({ produk_id: "", qty: "", keterangan: "" });

  const load = async () => {
    const [s, r] = await Promise.all([
      api("/api/stok").then((x) => x.j),
      api("/api/retur").then((x) => x.j),
    ]);
    setStoks(s);
    setRiwayat(r);
    if (!f.produk_id && s.length > 0)
      setF((v) => ({ ...v, produk_id: String(s[0].id) }));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ok, j } = await api("/api/retur", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produk_id: Number(f.produk_id),
        qty: Number(f.qty),
        keterangan: f.keterangan,
      }),
    });
    if (!ok) return alert(j.error ?? "Gagal");
    setF((v) => ({ ...v, qty: "", keterangan: "" }));
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Retur Barang Tak Laku</h2>
      <div className="card">
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <select
            className="inp"
            value={f.produk_id}
            onChange={(e) => setF({ ...f, produk_id: e.target.value })}
            required
          >
            {stoks.map((p) => (
              <option key={p.id} value={p.id}>
                {p.sku} — {p.nama} (stok {p.stok})
              </option>
            ))}
          </select>
          <input
            className="inp w-28"
            type="number"
            min={1}
            placeholder="Qty"
            value={f.qty}
            onChange={(e) => setF({ ...f, qty: e.target.value })}
            required
          />
          <input
            className="inp"
            placeholder="Keterangan"
            value={f.keterangan}
            onChange={(e) => setF({ ...f, keterangan: e.target.value })}
          />
          <button className="btn" type="submit">
            Catat Retur
          </button>
        </form>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold">Riwayat Retur</h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Produk</th>
              <th>Qty</th>
              <th>Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {riwayat.map((r) => (
              <tr key={r.id}>
                <td>{r.tanggal}</td>
                <td>{r.nama_produk}</td>
                <td>{r.qty}</td>
                <td>{r.keterangan || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
