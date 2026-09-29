import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, body, requireFields } from "@/lib/konsinyasi";

export async function GET() {
  try {
    const rows = await prisma.produk.findMany({
      orderBy: { nama: "asc" },
      include: { penitip: { select: { nama: true } } },
    });
    return NextResponse.json(
      rows.map((p) => ({
        id: p.id,
        penitip_id: p.penitipId,
        nama: p.nama,
        sku: p.sku,
        harga_jual: p.hargaJual,
        nama_penitip: p.penitip.nama,
      }))
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const data = await body(req);
    requireFields(data, ["penitip_id", "nama", "sku", "harga_jual"]);
    const created = await prisma.produk.create({
      data: {
        penitipId: Number(data.penitip_id),
        nama: String(data.nama),
        sku: String(data.sku),
        hargaJual: Number(data.harga_jual),
      },
    });
    return NextResponse.json(
      {
        id: created.id,
        penitip_id: created.penitipId,
        nama: created.nama,
        sku: created.sku,
        harga_jual: created.hargaJual,
      },
      { status: 201 }
    );
  } catch (e) {
    return apiError(e);
  }
}
