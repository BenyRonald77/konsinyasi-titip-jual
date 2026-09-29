"use client";

import { useEffect, useState } from "react";

type Penitip = { id: number; nama: string; kontak: string | null; persen_toko: number };

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, init);
  const j = await r.json();
  return { ok: r.ok, j };
}

export default function PenitipPage() {
  const [rows, setRows] = useState<Penitip[]>([]);
  const [nama, setNama] = useState("");
  const [kontak, setKontak] = useState("");
  const [persen, setPersen] = useState("20");

  const load = async () => setRows(await api("/api/penitip").then((x) => x.j));
  useEffect(() => {
    load();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { ok, j } = await api("/api/penitip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nama, kontak, persen_toko: Number(persen) }),
    });
    if (!ok) return alert(j.error ?? "Gagal menyimpan");
    setNama("");
    setKontak("");
    setPersen("20");
    load();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Penitip (UMKM)</h2>
      <table className="tbl">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Kontak</th>
            <th>% Toko</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.nama}</td>
              <td>{p.kontak || "-"}</td>
              <td>{p.persen_toko}%</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="card">
        <h3 className="mb-3 text-lg font-semibold">Tambah Penitip</h3>
        <form onSubmit={submit} className="flex flex-wrap gap-2">
          <input
            className="inp"
            placeholder="Nama UMKM"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            required
          />
          <input
            className="inp"
            placeholder="Kontak"
            value={kontak}
            onChange={(e) => setKontak(e.target.value)}
            required
          />
          <input
            className="inp w-32"
            type="number"
            min={0}
            max={100}
            step={0.1}
            placeholder="% toko"
            value={persen}
            onChange={(e) => setPersen(e.target.value)}
            required
          />
          <button className="btn" type="submit">
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
}
