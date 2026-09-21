import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';
import { CheckCircleIcon, PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { NutBam } from '../../components/ui/NutBam';
import { ONhapLieu } from '../../components/ui/ONhapLieu';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { CaptionText } from '../../components/ui/VanBan';
import { layUrlAnhWeb } from '../../components/recipe/TheCongThuc';
import { taiAnhLen } from '../../api/taiAnh';

const CAC_BUOC = ['Thông tin & Ảnh bìa', 'Nguyên liệu & Định lượng', 'Các bước & Mẹo', 'Dinh dưỡng & Kiểm tra'] as const;

interface DongNguyenLieu {
  ten: string;
  dinhLuong: string;
  donVi: string;
}

const TIEU_CHUAN = [
  'Thuần vị Việt: nguyên liệu phải theo đúng cách phân loại vùng miền.',
  'Ảnh chụp thật: không dùng ảnh sưu tầm, ghi rõ nguồn nếu mượn.',
  'Định lượng chuẩn: ghi rõ gram (g), mililit (ml) thay vì ước lượng chung chung.',
];

// BR-UREC: Form 4 bước + xem trước + upload ảnh thật; gửi duyệt báo rõ backend chưa hỗ trợ
export function TaoCongThuc() {
  const [buoc, setBuoc] = useState(0);
  const [ten, setTen] = useState('');
  const [moTa, setMoTa] = useState('');
  const [anh, setAnh] = useState('');
  const [dangTaiAnh, setDangTaiAnh] = useState(false);
  const [thoiGianNau, setThoiGianNau] = useState('30');
  const [khauPhan, setKhauPhan] = useState('2');
  const [nguyenLieu, setNguyenLieu] = useState<DongNguyenLieu[]>([{ ten: '', dinhLuong: '', donVi: 'g' }]);
  const [cacBuoc, setCacBuoc] = useState<string[]>(['']);
  const [calo, setCalo] = useState('');
  const [moModal, setMoModal] = useState(false);

  const chonAnh = async (file: File | undefined) => {
    if (!file) return;
    setDangTaiAnh(true);
    try {
      setAnh(await taiAnhLen(file));
    } catch {
      alert('[UP-01] Không tải ảnh được — cần đăng nhập');
    } finally {
      setDangTaiAnh(false);
    }
  };

  const doiNguyenLieu = (i: number, khoa: keyof DongNguyenLieu, giaTri: string) => {
    setNguyenLieu((cu) => cu.map((d, j) => (j === i ? { ...d, [khoa]: giaTri } : d)));
  };

  const anhHien = layUrlAnhWeb(anh) || anh;

  return (
    <div className="mx-auto max-w-6xl px-4 pb-10">
      <p className="pt-4 text-left text-xs text-slate-500">
        <Link to="/" className="hover:underline">Trang chủ</Link>
        {' / '}
        <span className="font-semibold text-ink">Chia sẻ công thức mới</span>
      </p>
      <h1 className="mt-2 font-serif text-4xl font-black tracking-tight text-ink md:text-5xl">
        Chia sẻ công thức món ngon gia đình
      </h1>

      <ol className="mt-6 flex flex-wrap gap-2">
        {CAC_BUOC.map((b, i) => (
          <li key={b}>
            <button
              type="button"
              onClick={() => setBuoc(i)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                i === buoc ? 'bg-ink text-white' : i < buoc ? 'bg-accent-light text-ink' : 'bg-white text-slate-500 shadow-sm'
              }`}
            >
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${i === buoc ? 'bg-white/20' : 'bg-ink/10'}`}>
                {i < buoc ? '✓' : i + 1}
              </span>
              {b}
            </button>
          </li>
        ))}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-40px bg-white p-5 shadow-magazine md:p-8">
          {buoc === 0 ? (
            <div>
              <h2 className="font-serif text-2xl font-black text-ink">1. Thông tin chung & Ảnh bìa</h2>
              <label className="mt-4 block overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 bg-mist text-center">
                {anhHien ? (
                  <img src={anhHien} alt="Ảnh bìa" className="max-h-64 w-full object-cover" />
                ) : (
                  <span className="block px-6 py-10 text-sm text-slate-500">
                    {dangTaiAnh ? 'Đang tải ảnh...' : 'Bấm để chọn ảnh bìa món ăn (JPG/PNG/WebP)'}
                  </span>
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => chonAnh(e.target.files?.[0])}
                />
              </label>
              <ONhapLieu nhan="Tên công thức" giaTri={ten} khiDoi={setTen} goiY="VD: Canh Chua Cá Bớp Bạc Hà" className="mt-4" />
              <label className="mt-4 block text-left text-sm font-medium text-primary">
                Câu chuyện / Nét đặc trưng của món
                <textarea
                  value={moTa}
                  onChange={(e) => setMoTa(e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-base text-neutral-900 outline-none focus:border-accent"
                />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <ONhapLieu nhan="Thời gian nấu (phút)" giaTri={thoiGianNau} khiDoi={setThoiGianNau} loai="number" />
                <ONhapLieu nhan="Khẩu phần (người)" giaTri={khauPhan} khiDoi={setKhauPhan} loai="number" />
              </div>
            </div>
          ) : null}

          {buoc === 1 ? (
            <div>
              <h2 className="font-serif text-2xl font-black text-ink">2. Nguyên liệu & Định lượng</h2>
              {nguyenLieu.map((d, i) => (
                <div key={i} className="mt-3 flex gap-2">
                  <input
                    value={d.ten}
                    onChange={(e) => doiNguyenLieu(i, 'ten', e.target.value)}
                    placeholder="Tên nguyên liệu"
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
                    aria-label={`Nguyên liệu ${i + 1}`}
                  />
                  <input
                    value={d.dinhLuong}
                    onChange={(e) => doiNguyenLieu(i, 'dinhLuong', e.target.value)}
                    placeholder="500"
                    className="w-20 rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
                    aria-label="Định lượng"
                  />
                  <input
                    value={d.donVi}
                    onChange={(e) => doiNguyenLieu(i, 'donVi', e.target.value)}
                    placeholder="g"
                    className="w-16 rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
                    aria-label="Đơn vị"
                  />
                  <button
                    type="button"
                    aria-label="Xóa dòng"
                    onClick={() => setNguyenLieu((cu) => cu.filter((_, j) => j !== i))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-muted"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setNguyenLieu((cu) => [...cu, { ten: '', dinhLuong: '', donVi: 'g' }])}
                className="mt-3 flex items-center gap-1 text-sm font-semibold text-deepteal"
              >
                <PlusIcon className="h-4 w-4" /> Thêm nguyên liệu mới
              </button>
            </div>
          ) : null}

          {buoc === 2 ? (
            <div>
              <h2 className="font-serif text-2xl font-black text-ink">3. Các bước nấu</h2>
              {cacBuoc.map((b, i) => (
                <div key={i} className="mt-3 flex gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light font-serif font-black text-ink">
                    {i + 1}
                  </span>
                  <textarea
                    value={b}
                    onChange={(e) => setCacBuoc((cu) => cu.map((c, j) => (j === i ? e.target.value : c)))}
                    rows={2}
                    placeholder={`Mô tả bước ${i + 1}...`}
                    className="w-full rounded-xl border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-accent"
                    aria-label={`Bước ${i + 1}`}
                  />
                  <button
                    type="button"
                    aria-label="Xóa bước"
                    onClick={() => setCacBuoc((cu) => cu.filter((_, j) => j !== i))}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-300 text-muted"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setCacBuoc((cu) => [...cu, ''])}
                className="mt-3 flex items-center gap-1 text-sm font-semibold text-deepteal"
              >
                <PlusIcon className="h-4 w-4" /> Thêm bước tiếp theo
              </button>
            </div>
          ) : null}

          {buoc === 3 ? (
            <div>
              <h2 className="font-serif text-2xl font-black text-ink">4. Dinh dưỡng & Kiểm tra</h2>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <ONhapLieu nhan="Calo" giaTri={calo} khiDoi={setCalo} loai="number" />
                <p className="rounded-xl bg-mist px-4 py-3 text-left text-sm">
                  <span className="block text-xs text-muted">Nguyên liệu</span>
                  <strong><NumberDisplay value={nguyenLieu.filter((d) => d.ten).length} unit="món" /></strong>
                </p>
                <p className="rounded-xl bg-mist px-4 py-3 text-left text-sm">
                  <span className="block text-xs text-muted">Số bước</span>
                  <strong><NumberDisplay value={cacBuoc.filter((b) => b.trim()).length} unit="bước" /></strong>
                </p>
              </div>
              {!ten.trim() ? (
                <p className="mt-3 text-left text-sm text-danger">Vui lòng nhập tên món ở bước 1 trước khi gửi duyệt.</p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex justify-between">
            <NutBam
              tieuDe="Quay lại"
              bienThe="vien"
              voHieuHoa={buoc === 0}
              khiBam={() => setBuoc((b) => Math.max(0, b - 1))}
            />
            {buoc < CAC_BUOC.length - 1 ? (
              <NutBam tieuDe="Tiếp tục" khiBam={() => setBuoc((b) => Math.min(CAC_BUOC.length - 1, b + 1))} />
            ) : (
              <NutBam tieuDe="Gửi duyệt công thức" khiBam={() => setMoModal(true)} voHieuHoa={!ten.trim()} />
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <div className="rounded-40px bg-white p-5 shadow-magazine">
            <CaptionText dam>Xem trước thể hiển thị</CaptionText>
            <div className="mt-2 overflow-hidden rounded-3xl bg-mist">
              {anhHien ? (
                <img src={anhHien} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-cream">
                  <span className="font-serif text-4xl font-black text-accent-dark">
                    {(ten.trim().charAt(0) || '?').toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <p className="mt-2 text-left font-serif text-lg font-bold text-ink">{ten || 'Tên món ăn...'}</p>
          </div>
          <div className="rounded-40px bg-white p-5 shadow-magazine">
            <p className="font-serif text-lg font-bold text-ink">Tiêu chuẩn kiểm duyệt Bếp Nhà</p>
            <ul className="mt-2">
              {TIEU_CHUAN.map((t) => (
                <li key={t} className="mt-2 flex gap-2 text-left text-xs leading-5 text-slate-500">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-deepteal" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <Dialog open={moModal} onClose={() => setMoModal(false)} className="relative z-50">
        <div className="fixed inset-0 bg-ink/50" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-md rounded-40px bg-white p-6 shadow-magazine">
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-light font-serif font-black text-ink">✓</span>
              <button type="button" aria-label="Đóng" onClick={() => setMoModal(false)}>
                <XMarkIcon className="h-5 w-5 text-muted" />
              </button>
            </div>
            <Dialog.Title className="mt-3 text-center font-serif text-2xl font-black text-ink">
              Xác nhận gửi duyệt công thức
            </Dialog.Title>
            <p className="mt-1 text-center text-sm text-slate-500">
              Món “{ten}” sẽ được đội ngũ Bếp Nhà kiểm duyệt trước khi xuất bản.
            </p>
            <ul className="mt-4 rounded-2xl bg-mist p-4">
              {TIEU_CHUAN.map((t) => (
                <li key={t} className="mt-1.5 flex gap-2 text-left text-xs text-slate-500">
                  <CheckCircleIcon className="h-4 w-4 shrink-0 text-deepteal" /> {t}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <NutBam tieuDe="Quay lại chỉnh sửa thêm" bienThe="vien" className="flex-1" khiBam={() => setMoModal(false)} />
              <NutBam
                tieuDe="Xác nhận gửi duyệt ngay"
                className="flex-1"
                khiBam={() => {
                  setMoModal(false);
                  alert('[UREC-01] Backend chưa hỗ trợ tạo công thức — bản nháp của bạn vẫn giữ trên form');
                }}
              />
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
