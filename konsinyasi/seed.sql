INSERT INTO penitip (nama, kontak, persen_toko) VALUES
  ('UMKM Sari Rasa', '081111111111', 20),
  ('Kriya Kayu Jati', '082222222222', 25),
  ('Batik Larasati', '083333333333', 15);

INSERT INTO produk (penitip_id, nama, sku, harga_jual) VALUES
  (1, 'Keripik Singkong Balado', 'SR-001', 15000),
  (1, 'Kopi Robusta Sangrai 200g', 'SR-002', 45000),
  (2, 'Talenan Kayu Jati', 'KJ-001', 75000),
  (3, 'Kain Batik Cap 2m', 'BL-001', 180000);
