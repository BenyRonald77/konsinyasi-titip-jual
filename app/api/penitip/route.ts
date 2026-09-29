import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, body, requireFields } from "@/lib/konsinyasi";

export async function GET() {
  try {
    const rows = await prisma.penitip.findMany({ orderBy: { nama: "asc" } });
    return NextResponse.json(
      rows.map((p) => ({
        id: p.id,
        nama: p.nama,
        kontak: p.kontak,
        persen_toko: p.persenToko,
      }))
    );
  } catch (e) {
    return apiError(e);
  }
}

export async function POST(req: Request) {
  try {
    const data = await body(req);
    requireFields(data, ["nama", "kontak", "persen_toko"]);
    const created = await prisma.penitip.create({
      data: {
        nama: String(data.nama),
        kontak: String(data.kontak),
        persenToko: Number(data.persen_toko),
      },
    });
    return NextResponse.json(
      {
        id: created.id,
        nama: created.nama,
        kontak: created.kontak,
        persen_toko: created.persenToko,
      },
      { status: 201 }
    );
  } catch (e) {
    return apiError(e);
  }
}
