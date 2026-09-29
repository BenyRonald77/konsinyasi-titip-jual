import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, body, stokProduk, ApiError } from "@/lib/konsinyasi";
import { today } from "@/lib/format";

export async function GET() {
  try {
    const rows = await prisma.penjualan.findMany({
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      include: { items: { include: { produk: { select: { nama: true } } } } },
    });
    return NextResponse.json(
      rows.map((j) => ({
        id: j.id,
        tanggal: j.tanggal,
        catatan: j.catatan,
        items: j.items.map((i) => ({
          id: i.id,
          penjualan_id: i.penjualanId,
          produk_id: i.produkId,
          qty: i.qty,
          harga_satuan: i.hargaSatuan,
          nama_produk: i.produk.nama,
        })),
        total: j.items.reduce((a, i) => a + i.qty * i.hargaSatuan, 0),
      }))
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const data = await body(req);
    const items = (data?.items as any[]) ?? [];
    if (!items.length) {
      throw new ApiError(400, "items tidak boleh kosong");
    }
    // validasi semua dulu, lalu tulis (atomic)
    const baris: { produkId: number; nama: string; qty: number; harga: number }[] =
      [];
    for (const it of items) {
      const produk = await prisma.produk.findUnique({
        where: { id: Number(it?.produk_id) },
      });
      if (!produk) {
        throw new ApiError(404, `produk ${it?.produk_id} tidak ditemukan`);
      }
      const qty = Number(it?.qty ?? 0);
      if (qty <= 0) throw new ApiError(400, "qty harus > 0");
      const tersedia = await stokProduk(produk.id);
      if (qty > tersedia) {
        throw new ApiError(
          409,
          `stok ${produk.nama} kurang (tersedia ${tersedia})`
        );
      }
      baris.push({
        produkId: produk.id,
        nama: produk.nama,
        qty,
        harga: produk.hargaJual,
      });
    }
    const total = baris.reduce((a, b) => a + b.qty * b.harga, 0);
    const jual = await prisma.penjualan.create({
      data: {
        tanggal: data.tanggal ? String(data.tanggal) : today(),
        catatan: data.catatan ? String(data.catatan) : "",
        items: {
          create: baris.map((b) => ({
            produkId: b.produkId,
            qty: b.qty,
            hargaSatuan: b.harga, // snapshot harga saat transaksi
          })),
        },
      },
    });
    return NextResponse.json({ id: jual.id, total }, { status: 201 });
  } catch (e) {
    return apiError(e);
  }
}
