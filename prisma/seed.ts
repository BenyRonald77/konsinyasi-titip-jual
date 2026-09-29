import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const n = await prisma.penitip.count();
  if (n > 0) {
    console.log("seed dilewati (sudah ada data)");
    return;
  }

  const [sari, kriya, batik] = await Promise.all([
    prisma.penitip.create({
      data: { nama: "UMKM Sari Rasa", kontak: "081111111111", persenToko: 20 },
    }),
    prisma.penitip.create({
      data: { nama: "Kriya Kayu Jati", kontak: "082222222222", persenToko: 25 },
    }),
    prisma.penitip.create({
      data: { nama: "Batik Larasati", kontak: "083333333333", persenToko: 15 },
    }),
  ]);

  await prisma.produk.createMany({
    data: [
      { penitipId: sari.id, nama: "Keripik Singkong Balado", sku: "SR-001", hargaJual: 15000 },
      { penitipId: sari.id, nama: "Kopi Robusta Sangrai 200g", sku: "SR-002", hargaJual: 45000 },
      { penitipId: kriya.id, nama: "Talenan Kayu Jati", sku: "KJ-001", hargaJual: 75000 },
      { penitipId: batik.id, nama: "Kain Batik Cap 2m", sku: "BL-001", hargaJual: 180000 },
    ],
  });

  console.log("seed selesai");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
