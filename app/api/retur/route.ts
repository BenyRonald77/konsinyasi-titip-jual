import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, body, stokProduk, ApiError } from "@/lib/konsinyasi";
import { today } from "@/lib/format";

export async function GET() {
  try {
    const rows = await prisma.retur.findMany({
      orderBy: [{ tanggal: "desc" }, { id: "desc" }],
      include: { produk: { select: { nama: true } } },
    });
    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        produk_id: r.produkId,
        tanggal: r.tanggal,
        qty: r.qty,
        keterangan: r.keterangan,
        nama_produk: r.produk.nama,
      }))
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const data = await body(req);
    if (!data?.produk_id || !data?.qty) {
      throw new ApiError(400, "produk_id dan qty wajib");
    }
    const produkId = Number(data.produk_id);
    const produk = await prisma.produk.findUnique({
      where: { id: produkId },
      select: { id: true },
    });
    if (!produk) throw new ApiError(404, "produk tidak ditemukan");
    const qty = Number(data.qty);
    const tersedia = await stokProduk(produkId);
    if (qty > tersedia) {
      throw new ApiError(409, `stok tersedia ${tersedia}, tidak bisa retur ${qty}`);
    }
    const created = await prisma.retur.create({
      data: {
        produkId,
        tanggal: data.tanggal ? String(data.tanggal) : today(),
        qty,
        keterangan: data.keterangan ? String(data.keterangan) : "",
      },
    });
    return NextResponse.json(
      { id: created.id, stok: await stokProduk(produkId) },
      { status: 201 }
    );
  } catch (e) {
    return apiError(e);
  }
}
