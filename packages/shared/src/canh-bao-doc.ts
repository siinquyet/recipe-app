// BR-ANTOAN: Cặp nguyên liệu kỵ nhau đã biết — chạy offline, dùng chung mobile/web/backend
// Mức "cao" = nguy cơ ngộ độc, tuyệt đối tránh. Mức "trung bình" = kinh nghiệm dân gian,
// có thể gây khó tiêu ở người nhạy cảm — tham khảo thêm ý kiến chuyên gia khi cần.

export type MucCanhBao = 'cao' | 'trung binh';

export interface CanhBao {
    muc: MucCanhBao;
    cap: [string, string];
    lyDo: string;
}

interface CapCam {
    cap: [string, string];
    muc: MucCanhBao;
    lyDo: string;
}

const CAP_CAM: CapCam[] = [
    {
        cap: ['mat ong', 'bot san'],
        muc: 'cao',
        lyDo: 'Mật ong kỵ bột sắn/củ sắn chưa nấu chín kỹ — nguy cơ ngộ độc, tuyệt đối không dùng chung',
    },
    {
        cap: ['tom', 'hong'],
        muc: 'trung binh',
        lyDo: 'Tôm/cua giàu đạm gặp chất chát trong quả hồng dễ gây đầy bụng, khó tiêu',
    },
    {
        cap: ['cua', 'tra'],
        muc: 'trung binh',
        lyDo: 'Cua tính lạnh, uống trà đặc ngay sau khi ăn cua dễ gây lạnh bụng, khó tiêu',
    },
    {
        cap: ['thit ga', 'kinh gioi'],
        muc: 'trung binh',
        lyDo: 'Theo kinh nghiệm dân gian, thịt gà kỵ rau kinh giới — dễ gây đầy bụng ở người nhạy cảm',
    },
    {
        cap: ['dau phu', 'mat ong'],
        muc: 'trung binh',
        lyDo: 'Đậu phụ và mật ong ăn cùng dễ gây đầy bụng, tiêu chảy ở người bụng yếu',
    },
    {
        cap: ['sua dau nanh', 'trung ga'],
        muc: 'trung binh',
        lyDo: 'Sữa đậu nành chưa nấu chín kỹ và trứng gà ăn cùng khó tiêu — nấu chín kỹ cả hai trước khi dùng',
    },
    {
        cap: ['thit bo', 'luon'],
        muc: 'trung binh',
        lyDo: 'Theo kinh nghiệm dân gian, thịt bò kỵ lươn — dễ gây khó tiêu, đầy bụng',
    },
    {
        cap: ['ca chep', 'thit cho'],
        muc: 'trung binh',
        lyDo: 'Theo kinh nghiệm dân gian, cá chép kỵ thịt chó — dễ gây khó chịu tiêu hóa',
    },
];

export function chuanHoaTen(ten: string): string {
    return ten
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .trim();
}

export function kiemTraComboDoc(tenNguyenLieu: string[]): CanhBao[] {
    const chuan = tenNguyenLieu.map(chuanHoaTen);
    return CAP_CAM.filter((r) => r.cap.every((c) => chuan.some((t) => t.includes(c)))).map((r) => ({
        muc: r.muc,
        cap: r.cap,
        lyDo: r.lyDo,
    }));
}
