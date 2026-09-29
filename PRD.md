# PRD — Sistem Konsinyasi / Titip Jual

Satu toko menampung produk titipan dari banyak UMKM. Penjualan tercatat
per penitip, bagi hasil dihitung otomatis per periode, dan barang yang tidak
laku bisa diretur ke penitip.

## Tujuan

Pemilik toko mencatat penitip (UMKM), produk titipan + stoknya, menjual
lewat kasir sederhana, lalu tiap periode melihat bagi hasil per penitip
(toko dapat persen tertentu). Stok selalu konsisten: tidak bisa jual/retur
melebihi stok yang ada.

## Stack

- Backend: Python + Flask, SQLite (stdlib `sqlite3`)
- Frontend: HTML + vanilla JS + CSS murni

## Model Data

- `penitip`: id, nama, kontak, persen_toko (bagian toko, %, default 20)
- `produk`: id, penitip_id, nama, sku (unik), harga_jual
- `titipan`: id, produk_id, tanggal, qty — stok masuk dari penitip
- `penjualan`: id, tanggal, catatan
- `penjualan_item`: id, penjualan_id, produk_id, qty, harga_satuan
- `retur`: id, produk_id, tanggal, qty, keterangan — barang kembali ke penitip

## Aturan Bisnis

1. Stok tersedia per produk = titipan − terjual − retur. Tidak boleh negatif.
2. Penjualan menolak item yang qty-nya melebihi stok tersedia (`409`).
3. Retur menolak qty melebihi stok tersedia (`409`) — barang yang sudah
   terjual tidak bisa diretur.
4. Harga jual saat transaksi disimpan di `penjualan_item` (snapshot), jadi
   perubahan harga produk tidak mengubah riwayat.
5. Bagi hasil per periode (bulan `YYYY-MM`): per penitip,
   omzet = Σ qty × harga_satuan; hak_toko = omzet × persen_toko%;
   hak_penitip = omzet − hak_toko.

## Tahap Pengerjaan

- **F0 — Fondasi**: PRD, README, struktur, requirements, .gitignore.
- **F1 — Database + API inti**: schema, seed, CRUD penitip & produk,
  pencatatan titipan, kasir penjualan dengan validasi stok.
- **F2 — Bagi hasil & retur**: retur dengan validasi stok, laporan bagi
  hasil per periode, stok per produk/penitip.
- **F3 — UI**: Dashboard, Penitip, Produk, Kasir, Bagi Hasil, Retur.

## Kriteria Selesai

- [ ] Jual melebihi stok ditolak; retur melebihi stok ditolak
- [ ] Bagi hasil bulan berjalan benar per penitip
- [ ] Perubahan harga tidak mengubah riwayat penjualan
- [ ] `pip install -r requirements.txt && python app.py` langsung jalan

## Non-tujuan

- Barcode scanner, integrasi pembayaran, multi-toko.
