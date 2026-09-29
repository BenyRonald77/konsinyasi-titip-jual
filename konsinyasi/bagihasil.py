"""Stok tersedia + bagi hasil per periode."""
from datetime import date

from flask import Blueprint, jsonify, request

from konsinyasi.db import get_conn

bh_bp = Blueprint("bagihasil", __name__, url_prefix="/api")


def stok_produk(conn, produk_id: int) -> int:
    masuk = conn.execute("SELECT COALESCE(SUM(qty),0) FROM titipan"
                         " WHERE produk_id = ?", (produk_id,)).fetchone()[0]
    jual = conn.execute("SELECT COALESCE(SUM(qty),0) FROM penjualan_item"
                        " WHERE produk_id = ?", (produk_id,)).fetchone()[0]
    ret = conn.execute("SELECT COALESCE(SUM(qty),0) FROM retur"
                       " WHERE produk_id = ?", (produk_id,)).fetchone()[0]
    return masuk - jual - ret


@bh_bp.get("/stok")
def stok():
    conn = get_conn()
    try:
        prods = conn.execute(
            """SELECT p.*, t.nama AS nama_penitip FROM produk p
               JOIN penitip t ON t.id = p.penitip_id ORDER BY t.nama, p.nama""").fetchall()
        return jsonify([{"id": p["id"], "sku": p["sku"], "nama": p["nama"],
                         "nama_penitip": p["nama_penitip"],
                         "harga_jual": p["harga_jual"],
                         "stok": stok_produk(conn, p["id"])}
                        for p in prods])
    finally:
        conn.close()


@bh_bp.get("/bagi-hasil")
def bagi_hasil():
    """Bagi hasil per periode bulan (param: periode=YYYY-MM, default bulan ini)."""
    periode = request.args.get("periode") or date.today().strftime("%Y-%m")
    conn = get_conn()
    try:
        rows = conn.execute(
            """SELECT t.id, t.nama, t.persen_toko,
                      COALESCE(SUM(pi.qty * pi.harga_satuan), 0) AS omzet
               FROM penitip t
               LEFT JOIN produk p ON p.penitip_id = t.id
               LEFT JOIN penjualan_item pi ON pi.produk_id = p.id
               LEFT JOIN penjualan j ON j.id = pi.penjualan_id
                    AND substr(j.tanggal, 1, 7) = ?
               GROUP BY t.id ORDER BY t.nama""", (periode,)).fetchall()
        out, tot_omzet, tot_toko, tot_penitip = [], 0, 0, 0
        for r in rows:
            omzet = r["omzet"] or 0
            hak_toko = round(omzet * r["persen_toko"] / 100)
            hak_penitip = omzet - hak_toko
            out.append({"penitip_id": r["id"], "nama": r["nama"],
                        "persen_toko": r["persen_toko"], "omzet": omzet,
                        "hak_toko": hak_toko, "hak_penitip": hak_penitip})
            tot_omzet += omzet
            tot_toko += hak_toko
            tot_penitip += hak_penitip
        return jsonify({"periode": periode, "rincian": out,
                        "total_omzet": tot_omzet, "total_hak_toko": tot_toko,
                        "total_hak_penitip": tot_penitip})
    finally:
        conn.close()
