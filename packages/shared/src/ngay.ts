// BR-MEAL/BR-SHOP: Ngày YYYY-MM-DD dùng chung web/mobile (pure, không phụ thuộc platform)
export function sangYyyyMmDd(ngay: Date): string {
  const mm = String(ngay.getMonth() + 1).padStart(2, '0');
  const dd = String(ngay.getDate()).padStart(2, '0');
  return `${ngay.getFullYear()}-${mm}-${dd}`;
}

export function homNayYyyyMmDd(): string {
  return sangYyyyMmDd(new Date());
}

export function congNgayYyyyMmDd(ngayYyyyMmDd: string, soNgay: number): string {
  const d = new Date(`${ngayYyyyMmDd}T00:00:00`);
  if (Number.isNaN(d.getTime())) return ngayYyyyMmDd;
  d.setDate(d.getDate() + soNgay);
  return sangYyyyMmDd(d);
}

// BR-MEAL: Thứ Hai và Chủ nhật tuần này để preset khoảng khỏi gõ ngày
export function dauTuanNayYyyyMmDd(): string {
  const d = new Date();
  const thu = d.getDay();
  d.setDate(d.getDate() - (thu === 0 ? 6 : thu - 1));
  return sangYyyyMmDd(d);
}

export function cuoiTuanNayYyyyMmDd(): string {
  return congNgayYyyyMmDd(dauTuanNayYyyyMmDd(), 6);
}
