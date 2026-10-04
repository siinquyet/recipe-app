import { useState } from 'react';
import { DON_VI_CHUAN, MOC_DINH_LUONG, mocChoGiaTri } from '@cook/shared';

interface DinhLuongProps {
  giaTri: number;
  khiDoi: (giaTri: number) => void;
  donVi: string;
  khiDoiDonVi: (donVi: string) => void;
}

// BR-03: Chọn mốc rồi kéo thanh, đơn vị chọn từ selectbox
export function DinhLuong({ giaTri, khiDoi, donVi, khiDoiDonVi }: DinhLuongProps) {
  // BR-03: Nhớ mốc đang kéo, khỏi suy ngược từ giá trị (giá trị biên 1/10/100 thuộc 2 mốc)
  const [mocIdx, setMocIdx] = useState(() => mocChoGiaTri(giaTri));
  const moc = MOC_DINH_LUONG[mocIdx] ?? MOC_DINH_LUONG[1];
  const chonMoc = (i: number) => {
    setMocIdx(i);
    khiDoi(MOC_DINH_LUONG[i].min);
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {MOC_DINH_LUONG.map((m, i) => {
          const chon = i === mocIdx;
          return (
            <button
              key={m.nhan}
              type="button"
              onClick={() => chonMoc(i)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${chon ? 'bg-ink text-white' : 'bg-mist text-ink'}`}
            >
              {m.nhan}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={moc.min}
          max={moc.max}
          step={moc.buoc}
          value={Math.min(Math.max(giaTri, moc.min), moc.max)}
          onChange={(e) => khiDoi(parseFloat(e.target.value))}
          className="flex-1"
          aria-label="Định lượng"
        />
        <span className="number-vn w-16 text-right text-sm font-semibold">{giaTri}</span>
        <select
          value={donVi}
          onChange={(e) => khiDoiDonVi(e.target.value)}
          className="rounded-xl border border-neutral-300 px-2 py-2 text-sm"
          aria-label="Đơn vị"
        >
          {DON_VI_CHUAN.map((dv) => (
            <option key={dv} value={dv}>
              {dv}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
