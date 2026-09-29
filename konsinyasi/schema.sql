CREATE TABLE IF NOT EXISTS penitip (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nama TEXT NOT NULL,
  kontak TEXT,
  persen_toko REAL NOT NULL DEFAULT 20 CHECK (persen_toko BETWEEN 0 AND 100)
);

CREATE TABLE IF NOT EXISTS produk (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  penitip_id INTEGER NOT NULL REFERENCES penitip(id),
  nama TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  harga_jual INTEGER NOT NULL CHECK (harga_jual >= 0)
);

CREATE TABLE IF NOT EXISTS titipan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produk_id INTEGER NOT NULL REFERENCES produk(id),
  tanggal TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0)
);

CREATE TABLE IF NOT EXISTS penjualan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tanggal TEXT NOT NULL,
  catatan TEXT
);

CREATE TABLE IF NOT EXISTS penjualan_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  penjualan_id INTEGER NOT NULL REFERENCES penjualan(id),
  produk_id INTEGER NOT NULL REFERENCES produk(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  harga_satuan INTEGER NOT NULL CHECK (harga_satuan >= 0)
);

CREATE TABLE IF NOT EXISTS retur (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produk_id INTEGER NOT NULL REFERENCES produk(id),
  tanggal TEXT NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0),
  keterangan TEXT
);

CREATE INDEX IF NOT EXISTS idx_produk_penitip ON produk(penitip_id);
CREATE INDEX IF NOT EXISTS idx_item_produk ON penjualan_item(produk_id);
CREATE INDEX IF NOT EXISTS idx_titipan_produk ON titipan(produk_id);
