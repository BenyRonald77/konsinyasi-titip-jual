import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, stokProduk } from "@/lib/konsinyasi";

export async function GET() {
  try {
    const prods = await prisma.produk.findMany({
      include: { penitip: { select: { nama: true } } },
      orderBy: [{ penitip: { nama: "asc" } }, { nama: "asc" }],
    });
    const rows = await Promise.all(
      prods.map(async (p) => ({
        id: p.id,
        sku: p.sku,
        nama: p.nama,
        nama_penitip: p.penitip.nama,
        harga_jual: p.hargaJual,
        stok: await stokProduk(p.id),
      }))
    );
    return NextResponse.json(rows);
  } catch (e) {
    return apiError(e);
  }
}
