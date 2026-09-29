import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, body, ApiError } from "@/lib/konsinyasi";

const FIELDS = ["nama", "kontak", "persen_toko"] as const;

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await body(req);
    const sets: Record<string, any> = {};
    if (data?.nama !== undefined) sets.nama = String(data.nama);
    if (data?.kontak !== undefined) sets.kontak = String(data.kontak);
    if (data?.persen_toko !== undefined)
      sets.persenToko = Number(data.persen_toko);
    if (Object.keys(sets).length === 0) {
      throw new ApiError(400, "tidak ada field yang diubah");
    }
    const id = Number(params.id);
    const updated = await prisma.penitip.update({ where: { id }, data: sets });
    return NextResponse.json({
      id: updated.id,
      nama: updated.nama,
      kontak: updated.kontak,
      persen_toko: updated.persenToko,
    });
  } catch (e) {
    if (e instanceof Error && (e as any).code === "P2025") {
      return NextResponse.json({ error: "tidak ditemukan" }, { status: 404 });
    }
    return apiError(e);
  }
}
