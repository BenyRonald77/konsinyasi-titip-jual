import { prisma } from "@/lib/prisma";

/** Stok tersedia per produk = titipan − terjual − retur. */
export async function stokProduk(produkId: number): Promise<number> {
  const [masuk, jual, ret] = await Promise.all([
    prisma.titipan.aggregate({
      where: { produkId },
      _sum: { qty: true },
    }),
    prisma.penjualanItem.aggregate({
      where: { produkId },
      _sum: { qty: true },
    }),
    prisma.retur.aggregate({
      where: { produkId },
      _sum: { qty: true },
    }),
  ]);
  return (masuk._sum.qty ?? 0) - (jual._sum.qty ?? 0) - (ret._sum.qty ?? 0);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function apiError(e: unknown) {
  if (e instanceof ApiError) {
    return Response.json({ error: e.message }, { status: e.status });
  }
  if (e instanceof Error && /unique/i.test(e.message)) {
    return Response.json({ error: "data duplikat (SKU sudah dipakai)" }, { status: 400 });
  }
  const msg = e instanceof Error ? e.message : "kesalahan server";
  return Response.json({ error: msg }, { status: 500 });
}

export async function body(req: Request): Promise<any> {
  return req.json().catch(() => null);
}

export function requireFields(data: any, fields: string[]) {
  const missing = fields.filter(
    (f) => !data || data[f] === undefined || data[f] === null || data[f] === ""
  );
  if (missing.length > 0) {
    throw new ApiError(400, `field wajib: ${missing.join(", ")}`);
  }
}
