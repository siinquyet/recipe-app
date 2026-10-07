import { chamDiemBai } from './kiem-duyet.service';

describe('chamDiemBai (BR-ADM-AUTO)', () => {
    it('spam rõ thì nên từ chối', () => {
        const kq = chamDiemBai({
            tieuDe: 'Xem link http://x',
            moTa: 'ok',
            nguyenLieu: [],
            buoc: [],
            tacGiaBiTuChoi: 0,
            trungLap: false,
        });
        expect(kq.nhan).toBe('nen-tu-choi');
    });

    it('món đủ đầy sạch thì nên duyệt', () => {
        const kq = chamDiemBai({
            tieuDe: 'Canh chua cá lóc',
            moTa: 'Món canh chua thơm ngon nấu từ cá lóc đồng và me chín cây nhà trồng',
            nguyenLieu: ['cá lóc', 'me', 'rau ngổ'],
            buoc: ['Làm sạch cá', 'Nấu canh với me'],
            tacGiaBiTuChoi: 0,
            trungLap: false,
        });
        expect(kq.nhan).toBe('nen-duyet');
    });

    it('dính cặp độc mức cao thì giữ lại', () => {
        const kq = chamDiemBai({
            tieuDe: 'Chè sắn mật ong',
            moTa: 'Món chè thơm ngon nấu từ bột sắn dây và mật ong nguyên chất rất bổ dưỡng',
            nguyenLieu: ['bột sắn sống', 'mật ong', 'đường'],
            buoc: ['Hòa bột', 'Nấu chè'],
            tacGiaBiTuChoi: 0,
            trungLap: false,
        });
        expect(kq.nhan).toBe('giu-lai');
    });
});
