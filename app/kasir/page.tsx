"use client";

import { useEffect, useState } from "react";
import { rupiah } from "@/lib/format";

type Katalog = { id: number; sku: string; nama: string; harga_jual: number; stok: number };
type CartItem = { produk_id: number; nama: string; harga: number; qty: number };
type Jual = {
  id: number;
  tanggal: string;
  total: number;
  items: { nama_produk: string; qty: number; harga_satuan: number }[];
};

async function api(path: string, init?: RequestInit) {
  const r = await fetch(path, init);
  const j = await r.json();
  return { ok: r.ok, j };
}

export default function KasirPage() {
  const [katalog, setKatalog] = useState<Katalog[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [produkId, setProdukId] = useState("");
  const [qty, setQty] = useState("1");
  const [catatan, setCatatan] = useState("");
  const [riwayat, setRiwayat] = useState<Jual[]>([]);

  const load = async () => {
    const [k, r] = await Promise.all([
      api("/api/stok").then((x) => x.j),
      api("/api/penjualan").then((x) => x.j),
    ]);
    setKatalog(k);
    setRiwayat(r);
    if (!produkId && k.length > 0) setProdukId(String(k[0].id));
  };
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tambah = () => {
    const p = katalog.find((x) => x.id === Number(produkId));
    if (!p) return;
    const q = Number(qty) || 0;
    if (q <= 0) return;
    setCart((prev) => {
      const ada = prev.find((x) => x.produk_id === p.id);
      if (ada)
        return prev.map((x) =>
          x.produk_id === p.id ? { ...x, qty: x.qty + q } : x
        );
      return [...prev, { produk_id: p.id, nama: p.nama, harga: p.harga_jual, qty: q }];
    });
  };

  const bayar = async () => {
    if (!cart.length) return alert("Keranjang kosong");
    const { ok, j } = await api("/api/penjualan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map(({ produk_id, qty }) => ({ produk_id, qty })),
        catatan,
      }),
    });
    if (!ok) return alert(j.error ?? "Gagal");
    alert("Terjual! Total " + rupiah(j.total));
    setCart([]);
    setCatatan("");
    load();
  };

  const total = cart.reduce((a, x) => a + x.qty * x.harga, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Kasir Penjualan</h2>
      <div className="card flex flex-wrap gap-2">
        <select
          className="inp"
          value={produkId}
          onChange={(e) => setProdukId(e.target.value)}
        >
          {katalog.map((x) => (
            <option key={x.id} value={x.id}>
              {x.sku} — {x.nama} · {rupiah(x.harga_jual)} (stok {x.stok})
            </option>
          ))}
        </select>
        <input
          className="inp w-24"
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(e.target.value)}
        />
        <button className="btn" type="button" onClick={tambah}>
          + Keranjang
        </button>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold">Keranjang</h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>Produk</th>
              <th>Qty</th>
              <th>Harga</th>
              <th>Subtotal</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((x, i) => (
              <tr key={i}>
                <td>{x.nama}</td>
                <td>{x.qty}</td>
                <td>{rupiah(x.harga)}</td>
                <td>{rupiah(x.qty * x.harga)}</td>
                <td>
                  <button
                    className="btn-danger"
                    onClick={() => setCart(cart.filter((_, j) => j !== i))}
                  >
                    hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3}>
                <b>Total</b>
              </td>
              <td>
                <b>{rupiah(total)}</b>
              </td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            className="inp"
            placeholder="Catatan (opsional)"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
          />
          <button className="btn" onClick={bayar}>
            Bayar
          </button>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-lg font-semibold">Riwayat Penjualan</h3>
        <div className="space-y-2">
          {riwayat.slice(0, 20).map((j) => (
            <div className="card" key={j.id}>
              <b>#{j.id}</b> · {j.tanggal} · {rupiah(j.total)}
              <ul className="ml-4 list-disc text-sm text-slate-600">
                {j.items.map((i, k) => (
                  <li key={k}>
                    {i.nama_produk} × {i.qty} @ {rupiah(i.harga_satuan)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
