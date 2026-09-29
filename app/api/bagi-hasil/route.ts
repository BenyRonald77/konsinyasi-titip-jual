import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/konsinyasi";
import { currentMonth } from "@/lib/format";

/** Bagi hasil per periode bulan (param: periode=YYYY-MM, default bulan ini). */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const periode = searchParams.get("periode") || currentMonth();
    const penitips = await prisma.penitip.findMany({
      orderBy: { nama: "asc" },
      include: {
        produks: {
          include: {
            items: {
              where: { penjualan: { tanggal: { startsWith: periode } } },
            },
          },
        },
      },
    });
    const rincian: {
      penitip_id: number;
      nama: string;
      persen_toko: number;
      omzet: number;
      hak_toko: number;
      hak_penitip: number;
    }[] = [];
    let total_omzet = 0,
      total_hak_toko = 0,
      total_hak_penitip = 0;
    for (const t of penitips) {
      let omzet = 0;
      for (const p of t.produks) {
        for (const i of p.items) {
          omzet += i.qty * i.hargaSatuan;
        }
      }
      const hak_toko = Math.round((omzet * t.persenToko) / 100);
      const hak_penitip = omzet - hak_toko;
      rincian.push({
        penitip_id: t.id,
        nama: t.nama,
        persen_toko: t.persenToko,
        omzet,
        hak_toko,
        hak_penitip,
      });
      total_omzet += omzet;
      total_hak_toko += hak_toko;
      total_hak_penitip += hak_penitip;
    }
    return NextResponse.json({
      periode,
      rincian,
      total_omzet,
      total_hak_toko,
      total_hak_penitip,
    });
  } catch (e) {
    return apiError(e);
  }
}
