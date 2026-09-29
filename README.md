# Sistem Konsinyasi / Titip Jual

Satu toko menampung produk titipan dari banyak UMKM. Penjualan tercatat
per penitip, bagi hasil dihitung otomatis per periode, dan barang yang tidak
laku bisa diretur ke penitip. Stack: **Next.js 14 + TypeScript + Prisma 5 +
SQLite + Tailwind**.

## Cara Menjalankan

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run seed
npm run dev
```

Buka `http://localhost:3000`.

## Halaman

- `/` — Dashboard: ringkasan omzet / hak toko / hak penitip bulan berjalan + daftar stok menipis (≤ 5).
- `/penitip` — CRUD penitip (UMKM) beserta persen bagian toko.
- `/produk` — Daftar produk + stok tersedia, tambah produk, catat titipan stok.
- `/kasir` — Kasir penjualan: keranjang, bayar, riwayat penjualan. Validasi stok (409 jika kurang).
- `/bagi-hasil` — Bagi hasil per penitip per periode (bulan `YYYY-MM`).
- `/retur` — Retur barang tak laku ke penitip + riwayat retur.

## API

- `GET/POST /api/penitip`, `PUT /api/penitip/[id]`
- `GET/POST /api/produk`, `PUT /api/produk/[id]`
- `GET/POST /api/titipan` — catat stok masuk dari penitip
- `GET/POST /api/penjualan` — kasir (harga diambil dari `harga_jual` saat ini, disimpan sebagai snapshot)
- `GET/POST /api/retur` — retur barang (409 jika melebihi stok)
- `GET /api/stok` — stok tersedia per produk (titipan − terjual − retur)
- `GET /api/bagi-hasil?periode=YYYY-MM` — omzet, hak toko, hak penitip per penitip

## Aturan Bisnis

1. Stok tersedia per produk = titipan − terjual − retur; tidak boleh negatif.
2. Penjualan menolak item yang qty-nya melebihi stok tersedia (`409`).
3. Retur menolak qty melebihi stok tersedia (`409`) — barang yang sudah terjual tidak bisa diretur.
4. Harga jual saat transaksi disimpan di `penjualan_item` (snapshot); perubahan harga produk tidak mengubah riwayat.
5. Bagi hasil per periode (bulan `YYYY-MM`): per penitip, omzet = Σ qty × harga_satuan; hak_toko = omzet × persen_toko%; hak_penitip = omzet − hak_toko.
