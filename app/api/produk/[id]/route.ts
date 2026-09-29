import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, body, ApiError } from "@/lib/konsinyasi";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await body(req);
    const sets: Record<string, any> = {};
    if (data?.penitip_id !== undefined) sets.penitipId = Number(data.penitip_id);
    if (data?.nama !== undefined) sets.nama = String(data.nama);
    if (data?.sku !== undefined) sets.sku = String(data.sku);
    if (data?.harga_jual !== undefined) sets.hargaJual = Number(data.harga_jual);
    if (Object.keys(sets).length === 0) {
      throw new ApiError(400, "tidak ada field yang diubah");
    }
    const id = Number(params.id);
    const updated = await prisma.produk.update({ where: { id }, data: sets });
    return NextResponse.json({
      id: updated.id,
      penitip_id: updated.penitipId,
      nama: updated.nama,
      sku: updated.sku,
      harga_jual: updated.hargaJual,
    });
  } catch (e) {
    if (e instanceof Error && (e as any).code === "P2025") {
      return NextResponse.json({ error: "tidak ditemukan" }, { status: 404 });
    }
    return apiError(e);
  }
}
