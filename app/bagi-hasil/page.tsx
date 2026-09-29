"use client";

import { useEffect, useState } from "react";
import { rupiah, currentMonth } from "@/lib/format";

type Rincian = {
  penitip_id: number;
  nama: string;
  persen_toko: number;
  omzet: number;
  hak_toko: number;
  hak_penitip: number;
};
type BH = {
  periode: string;
  rincian: Rincian[];
  total_omzet: number;
  total_hak_toko: number;
  total_hak_penitip: number;
};

export default function BagiHasilPage() {
  const [periode, setPeriode] = useState(currentMonth());
  const [data, setData] = useState<BH | null>(null);

  useEffect(() => {
    fetch(`/api/bagi-hasil?periode=${periode}`)
      .then((r) => r.json())
      .then(setData);
  }, [periode]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Bagi Hasil per Periode</h2>
      <p>
        <input
          className="inp"
          type="month"
          value={periode}
          onChange={(e) => setPeriode(e.target.value)}
        />
      </p>
      <table className="tbl">
        <thead>
          <tr>
            <th>Penitip</th>
            <th>% Toko</th>
            <th>Omzet</th>
            <th>Hak Toko</th>
            <th>Hak Penitip</th>
          </tr>
        </thead>
        <tbody>
          {(data?.rincian ?? []).map((x) => (
            <tr key={x.penitip_id}>
              <td>{x.nama}</td>
              <td>{x.persen_toko}%</td>
              <td>{rupiah(x.omzet)}</td>
              <td>{rupiah(x.hak_toko)}</td>
              <td>
                <b>{rupiah(x.hak_penitip)}</b>
              </td>
            </tr>
          ))}
        </tbody>
        {data && (
          <tfoot>
            <tr>
              <td colSpan={2}>
                <b>Total</b>
              </td>
              <td>
                <b>{rupiah(data.total_omzet)}</b>
              </td>
              <td>
                <b>{rupiah(data.total_hak_toko)}</b>
              </td>
              <td>
                <b>{rupiah(data.total_hak_penitip)}</b>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
