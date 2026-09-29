"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

type Penitip = { id: number; nama: string };
type Stok = {
  id: number;
  sku: string;
  nama: string;
  nama_penitip: string;
  harga_jual: number;
  stok: number;
};

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, init);
  const j = await r.json();
  return { ok: r.ok, j };
}

export default function ProdukPage() {
  const [penitips, setPenitips] = useState<Penitip[]>([]);
  const [stoks, setStoks] = useState<Stok[]>([]);
  const [f, setF] = useState({ penitip_id: "", nama: "", sku: "", harga_jual: "" });
  const [t, setT] = useState({ produk_id: "", qty: "", tanggal: "" });

  const load = async () => {
    const [p, s] = await Promise.all([
      api("/api/penitip").then((x) => x.j),
      api("/api/stok").then((x) => x.j),
    ]);
    setPenitips(p);
    setStoks(s);
    if (!f.penitip_id && p.length > 0)
      setF((v) => ({ ...v, penitip_id: String(p[0].id) }));
    if (!t.produk_id && s.length > 0)
      setT((v) => ({ ...v, produk_id: String(s[0].id) }));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitProduk = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ok, j } = await api("/api/produk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        penitip_id: Number(f.penitip_id),
        nama: f.nama,
        sku: f.sku,
        harga_jual: Number(f.harga_jual),
      }),
    });
    if (!ok) return alert(j.error ?? "Gagal menyimpan");
    setF((v) => ({ ...v, nama: "", sku: "", harga_jual: "" }));
    load();
  };

  const submitTitipan = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ok, j } = await api("/api/titipan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        produk_id: Number(t.produk_id),
        qty: Number(t.qty),
        ...(t.tanggal ? { tanggal: t.tanggal } : {}),
      }),
    });
    if (!ok) return alert(j.error ?? "Gagal mencatat titipan");
    setT((v) => ({ ...v, qty: "", tanggal: "" }));
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Produk &amp; Titipan Stok</h2>
      <table className="tbl">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Produk</th>
            <th>Penitip</th>
            <th>Harga</th>
            <th>Stok</th>
          </tr>
        </thead>
        <tbody>
          {stoks.map((x) => (
            <tr key={x.id}>
              <td>{x.sku}</td>
              <td>{x.nama}</td>
              <td>{x.nama_penitip}</td>
              <td>{rupiah(x.harga_jual)}</td>
              <td>
                <b>{x.stok}</b>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="card">
        <h3 className="mb-3 text-lg font-semibold">Tambah Produk</h3>
        <form onSubmit={submitProduk} className="flex flex-wrap gap-2">
          <select
            className="inp"
            value={f.penitip_id}
            onChange={(e) => setF({ ...f, penitip_id: e.target.value })}
            required
          >
            {penitips.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nama}
              </option>
            ))}
          </select>
          <input
            className="inp"
            placeholder="Nama produk"
            value={f.nama}
            onChange={(e) => setF({ ...f, nama: e.target.value })}
            required
          />
          <input
            className="inp"
            placeholder="SKU"
            value={f.sku}
            onChange={(e) => setF({ ...f, sku: e.target.value })}
            required
          />
          <input
            className="inp w-36"
            type="number"
            min={0}
            placeholder="Harga jual"
            value={f.harga_jual}
            onChange={(e) => setF({ ...f, harga_jual: e.target.value })}
            required
          />
          <button className="btn" type="submit">
            Simpan
          </button>
        </form>
      </div>
      <div className="card">
        <h3 className="mb-3 text-lg font-semibold">Titip Stok</h3>
        <form onSubmit={submitTitipan} className="flex flex-wrap gap-2">
          <select
            className="inp"
            value={t.produk_id}
            onChange={(e) => setT({ ...t, produk_id: e.target.value })}
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
            value={t.qty}
            onChange={(e) => setT({ ...t, qty: e.target.value })}
            required
          />
          <input
            className="inp"
            type="date"
            value={t.tanggal}
            onChange={(e) => setT({ ...t, tanggal: e.target.value })}
          />
          <button className="btn" type="submit">
            Catat Titipan
          </button>
        </form>
      </div>
    </div>
  );
}
