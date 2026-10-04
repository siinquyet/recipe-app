import {
  congNgayYyyyMmDd,
  cuoiTuanNayYyyyMmDd,
  dauTuanNayYyyyMmDd,
  homNayYyyyMmDd,
} from '@cook/shared';

interface ChonKhoangNgayProps {
  tuNgay: string;
  denNgay: string;
  khiDoi: (tuNgay: string, denNgay: string) => void;
}

// BR-MEAL: Chọn khoảng bằng preset + lịch native — khỏi gõ YYYY-MM-DD
export function ChonKhoangNgay({ tuNgay, denNgay, khiDoi }: ChonKhoangNgayProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => khiDoi(dauTuanNayYyyyMmDd(), cuoiTuanNayYyyyMmDd())}
          className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-ink"
        >
          Tuần này (T2–CN)
        </button>
        <button
          type="button"
          onClick={() => khiDoi(homNayYyyyMmDd(), congNgayYyyyMmDd(homNayYyyyMmDd(), 6))}
          className="rounded-full bg-mist px-2.5 py-1 text-xs font-semibold text-ink"
        >
          7 ngày tới
        </button>
      </div>
      <div className="mt-2 flex gap-2">
        <label className="flex-1 text-xs text-muted">
          Từ ngày
          <input
            type="date"
            value={tuNgay}
            onChange={(e) => khiDoi(e.target.value, denNgay < e.target.value ? e.target.value : denNgay)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none"
            aria-label="Từ ngày"
          />
        </label>
        <label className="flex-1 text-xs text-muted">
          Đến ngày
          <input
            type="date"
            value={denNgay}
            onChange={(e) => khiDoi(tuNgay > e.target.value ? e.target.value : tuNgay, e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none"
            aria-label="Đến ngày"
          />
        </label>
      </div>
    </div>
  );
}
