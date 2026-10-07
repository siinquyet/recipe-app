import { Injectable, NotFoundException } from '@nestjs/common';
import { kiemTraComboDoc } from '@cook/shared';
import { PrismaService } from '../../common/prisma.service';

export type NhanGoiY = 'nen-duyet' | 'giu-lai' | 'nen-tu-choi';

export interface DauVaoChamDiem {
    tieuDe: string;
    moTa: string | null;
    nguyenLieu: string[];
    buoc: string[];
    tacGiaBiTuChoi: number;
    trungLap: boolean;
}

export interface KetQuaChamDiem {
    diem: number;
    nhan: NhanGoiY;
    lyDo: string[];
}

// BR-ADM-AUTO: Ngưỡng điểm tin cậy — đổi ở đây khi đo xong 1-2 tuần chạy gợi ý
export const NGUONG_DUYET = 70;
export const NGUONG_TU_CHOI = 30;

// BR-ADM-AUTO: false = chỉ gắn nhãn gợi ý, admin bấm tay. true = máy tự duyệt/từ chối + audit
export const CHE_DO_TU_DONG = false;

const TU_CAM = ['cá độ', 'vay tiền', 'lừa đảo', '18+', 'sex', 'cờ bạc'];

export function chamDiemBai(dauVao: DauVaoChamDiem): KetQuaChamDiem {
    let diem = 50;
    const lyDo: string[] = [];
    // BR-ADM-AUTO: Quét link/từ cấm trên toàn bộ chữ user nhập (tên, mô tả, nguyên liệu, bước)
    const vanBan = [dauVao.tieuDe, dauVao.moTa ?? '', ...dauVao.nguyenLieu, ...dauVao.buoc]
        .join(' ')
        .toLowerCase();

    if (dauVao.tieuDe.trim().length >= 4) {
        diem += 5;
    } else {
        diem -= 10;
        lyDo.push('Tên món quá ngắn');
    }
    if ((dauVao.moTa ?? '').trim().length >= 20) {
        diem += 10;
    } else {
        diem -= 10;
        lyDo.push('Thiếu mô tả món ăn');
    }
    if (dauVao.nguyenLieu.length >= 3) {
        diem += 10;
    } else if (dauVao.nguyenLieu.length >= 1) {
        diem += 5;
    } else {
        diem -= 10;
        lyDo.push('Chưa có nguyên liệu');
    }
    if (dauVao.buoc.length >= 2) {
        diem += 10;
    } else if (dauVao.buoc.length >= 1) {
        diem += 5;
    } else {
        diem -= 10;
        lyDo.push('Chưa có bước thực hiện');
    }
    if (dauVao.tacGiaBiTuChoi === 0) {
        diem += 5;
    } else if (dauVao.tacGiaBiTuChoi >= 3) {
        diem -= 15;
        lyDo.push('Tác giả từng bị từ chối nhiều lần');
    }

    if (/https?:\/\//.test(vanBan)) {
        diem -= 40;
        lyDo.push('Chứa liên kết lạ');
    }
    if (TU_CAM.some((tu) => vanBan.includes(tu))) {
        diem -= 40;
        lyDo.push('Chứa từ ngữ bị cấm');
    }
    if (dauVao.trungLap) {
        diem -= 30;
        lyDo.push('Trùng với bài đã có');
    }

    // BR-ANTOAN: Dính cặp độc mức cao thì chặn auto-duyệt bất kể điểm
    const docMucCao = kiemTraComboDoc(dauVao.nguyenLieu).some((cb) => cb.muc === 'cao');
    if (docMucCao) {
        lyDo.push('Có combo nguyên liệu nguy hiểm — cần admin xem tay');
        return { diem: Math.min(diem, NGUONG_DUYET - 1), nhan: 'giu-lai', lyDo };
    }

    if (diem >= NGUONG_DUYET) {
        return { diem, nhan: 'nen-duyet', lyDo };
    }
    if (diem <= NGUONG_TU_CHOI) {
        return { diem, nhan: 'nen-tu-choi', lyDo };
    }
    return { diem, nhan: 'giu-lai', lyDo };
}

@Injectable()
export class KiemDuyetService {
    constructor(private readonly prisma: PrismaService) {}

    // BR-ADM-AUTO: Gợi ý cho 1 bài PENDING — trùng lặp và lịch sử tác giả tra từ DB
    async goiYChoBai(baiId: string): Promise<KetQuaChamDiem> {
        const bai = await this.prisma.recipe.findFirst({
            where: { id: baiId, deletedAt: null },
            include: { ingredients: { select: { originalText: true } }, steps: { select: { content: true } } },
        });
        if (!bai) {
            throw new NotFoundException({ code: 'REC-04', message: '[REC-04] Không tìm thấy công thức' });
        }
        const [trung, biTuChoi] = await Promise.all([
            this.prisma.recipe.findFirst({
                where: {
                    id: { not: baiId },
                    deletedAt: null,
                    riengTu: false,
                    title: { equals: bai.title },
                },
                select: { id: true },
            }),
            this.prisma.recipe.count({
                where: { authorId: bai.authorId, status: 'REJECTED', deletedAt: null },
            }),
        ]);
        return chamDiemBai({
            tieuDe: bai.title,
            moTa: bai.description,
            nguyenLieu: bai.ingredients.map((nl) => nl.originalText),
            buoc: bai.steps.map((b) => b.content),
            tacGiaBiTuChoi: biTuChoi,
            trungLap: !!trung,
        });
    }
}
