# Sistem Konsinyasi / Titip Jual

Produk titipan banyak UMKM di satu toko: penjualan per penitip, bagi hasil
otomatis per periode, retur barang tak laku.

## Cara Menjalankan

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python app.py
```

Buka http://localhost:5004. Database dibuat otomatis dan di-seed saat
pertama dijalankan.

## Struktur

```
├── PRD.md
├── requirements.txt
├── app.py
├── konsinyasi/
│   ├── __init__.py
│   ├── db.py
│   ├── schema.sql
│   ├── seed.sql
│   ├── api.py       # master + titipan + penjualan + retur
│   └── bagihasil.py # stok + bagi hasil per periode
├── static/
└── templates/
```
