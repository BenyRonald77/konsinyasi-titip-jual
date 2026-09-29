"""CRUD master + titipan + penjualan + retur."""
from datetime import date

from flask import Blueprint, jsonify, request

from konsinyasi.bagihasil import stok_produk
from konsinyasi.db import get_conn

api_bp = Blueprint("api", __name__, url_prefix="/api")


def _dicts(cur):
    return [dict(r) for r in cur.fetchall()]


def _crud(table: str, fields: list[str], order: str = "id"):
    base = "/" + table

    @api_bp.get(base, endpoint=f"list_{table}")
    def list_():
        conn = get_conn()
        try:
            if table == "produk":
                rows = _dicts(conn.execute(
                    """SELECT p.*, t.nama AS nama_penitip FROM produk p
                       JOIN penitip t ON t.id = p.penitip_id ORDER BY p.nama"""))
            else:
                rows = _dicts(conn.execute(f"SELECT * FROM {table} ORDER BY {order}"))
            return jsonify(rows)
        finally:
            conn.close()

    @api_bp.post(base, endpoint=f"create_{table}")
    def create():
        data = request.get_json(force=True)
        missing = [f for f in fields if f not in data or data[f] in (None, "")]
        if missing:
            return jsonify({"error": f"field wajib: {', '.join(missing)}"}), 400
        conn = get_conn()
        try:
            cur = conn.execute(
                f"INSERT INTO {table} ({', '.join(fields)})"
                f" VALUES ({', '.join('?' for _ in fields)})",
                [data[f] for f in fields])
            conn.commit()
            row = conn.execute(f"SELECT * FROM {table} WHERE id = ?",
                               (cur.lastrowid,)).fetchone()
            return jsonify(dict(row)), 201
        except Exception as e:  # noqa: BLE001
            return jsonify({"error": str(e)}), 400
        finally:
            conn.close()

    @api_bp.put(f"{base}/<int:row_id>", endpoint=f"update_{table}")
    def update(row_id: int):
        data = request.get_json(force=True)
        conn = get_conn()
        try:
            sets = [f"{f} = ?" for f in fields if f in data]
            if not sets:
                return jsonify({"error": "tidak ada field yang diubah"}), 400
            cur = conn.execute(
                f"UPDATE {table} SET {', '.join(sets)} WHERE id = ?",
                [data[f] for f in fields if f in data] + [row_id])
            conn.commit()
            if cur.rowcount == 0:
                return jsonify({"error": "tidak ditemukan"}), 404
            return jsonify(dict(conn.execute(
                f"SELECT * FROM {table} WHERE id = ?", (row_id,)).fetchone()))
        except Exception as e:  # noqa: BLE001
            return jsonify({"error": str(e)}), 400
        finally:
            conn.close()


_crud("penitip", ["nama", "kontak", "persen_toko"], order="nama")
_crud("produk", ["penitip_id", "nama", "sku", "harga_jual"])


# ---------- titipan ----------

@api_bp.get("/titipan")
def list_titipan():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT t.*, p.nama AS nama_produk FROM titipan t
               JOIN produk p ON p.id = t.produk_id
               ORDER BY t.tanggal DESC, t.id DESC""")))
    finally:
        conn.close()


@api_bp.post("/titipan")
def create_titipan():
    data = request.get_json(force=True)
    if not data.get("produk_id") or not data.get("qty"):
        return jsonify({"error": "produk_id dan qty wajib"}), 400
    conn = get_conn()
    try:
        if conn.execute("SELECT id FROM produk WHERE id = ?",
                        (data["produk_id"],)).fetchone() is None:
            return jsonify({"error": "produk tidak ditemukan"}), 404
        cur = conn.execute(
            "INSERT INTO titipan (produk_id, tanggal, qty) VALUES (?, ?, ?)",
            (data["produk_id"], data.get("tanggal", date.today().isoformat()),
             int(data["qty"])))
        conn.commit()
        return jsonify({"id": cur.lastrowid,
                        "stok": stok_produk(conn, data["produk_id"])}), 201
    finally:
        conn.close()


# ---------- penjualan ----------

@api_bp.get("/penjualan")
def list_penjualan():
    conn = get_conn()
    try:
        out = []
        for j in conn.execute("SELECT * FROM penjualan ORDER BY tanggal DESC, id DESC"):
            items = _dicts(conn.execute(
                """SELECT pi.*, p.nama AS nama_produk FROM penjualan_item pi
                   JOIN produk p ON p.id = pi.produk_id
                   WHERE pi.penjualan_id = ?""", (j["id"],)))
            out.append({**dict(j), "items": items,
                        "total": sum(i["qty"] * i["harga_satuan"] for i in items)})
        return jsonify(out)
    finally:
        conn.close()


@api_bp.post("/penjualan")
def create_penjualan():
    """Kasir: {"items": [{"produk_id":.., "qty":..}], "catatan": "..."}.
    Harga diambil dari harga_jual produk saat ini (snapshot)."""
    data = request.get_json(force=True)
    items = data.get("items") or []
    if not items:
        return jsonify({"error": "items tidak boleh kosong"}), 400
    conn = get_conn()
    try:
        # validasi semua dulu, lalu tulis (atomic)
        baris = []
        for it in items:
            p = conn.execute("SELECT * FROM produk WHERE id = ?",
                             (it.get("produk_id"),)).fetchone()
            if p is None:
                return jsonify({"error": f"produk {it.get('produk_id')} tidak ditemukan"}), 404
            qty = int(it.get("qty", 0))
            if qty <= 0:
                return jsonify({"error": "qty harus > 0"}), 400
            tersedia = stok_produk(conn, p["id"])
            if qty > tersedia:
                return jsonify({"error": f"stok {p['nama']} kurang (tersedia {tersedia})"}), 409
            baris.append((p, qty))
        cur = conn.execute(
            "INSERT INTO penjualan (tanggal, catatan) VALUES (?, ?)",
            (data.get("tanggal", date.today().isoformat()), data.get("catatan", "")))
        jid = cur.lastrowid
        total = 0
        for p, qty in baris:
            conn.execute(
                "INSERT INTO penjualan_item (penjualan_id, produk_id, qty, harga_satuan)"
                " VALUES (?, ?, ?, ?)", (jid, p["id"], qty, p["harga_jual"]))
            total += qty * p["harga_jual"]
        conn.commit()
        return jsonify({"id": jid, "total": total}), 201
    finally:
        conn.close()


# ---------- retur ----------

@api_bp.get("/retur")
def list_retur():
    conn = get_conn()
    try:
        return jsonify(_dicts(conn.execute(
            """SELECT r.*, p.nama AS nama_produk FROM retur r
               JOIN produk p ON p.id = r.produk_id
               ORDER BY r.tanggal DESC, r.id DESC""")))
    finally:
        conn.close()


@api_bp.post("/retur")
def create_retur():
    data = request.get_json(force=True)
    if not data.get("produk_id") or not data.get("qty"):
        return jsonify({"error": "produk_id dan qty wajib"}), 400
    conn = get_conn()
    try:
        if conn.execute("SELECT id FROM produk WHERE id = ?",
                        (data["produk_id"],)).fetchone() is None:
            return jsonify({"error": "produk tidak ditemukan"}), 404
        qty = int(data["qty"])
        tersedia = stok_produk(conn, data["produk_id"])
        if qty > tersedia:
            return jsonify({"error": f"stok tersedia {tersedia}, tidak bisa retur {qty}"}), 409
        cur = conn.execute(
            "INSERT INTO retur (produk_id, tanggal, qty, keterangan) VALUES (?, ?, ?, ?)",
            (data["produk_id"], data.get("tanggal", date.today().isoformat()),
             qty, data.get("keterangan", "")))
        conn.commit()
        return jsonify({"id": cur.lastrowid,
                        "stok": stok_produk(conn, data["produk_id"])}), 201
    finally:
        conn.close()
