import { z } from "zod";
import { apiClient, goiApi } from "./client";
import type { ApiResponse } from "../../types/api";

// BR-SOC: goiApi đã bóc envelope {success,data,error} — chỉ validate payload data
const ketQuaBaoCaoSchema = z.object({ id: z.string(), thanhCong: z.boolean() });

export type LyDoBaoCao =
  "SPAM" | "INAPPROPRIATE" | "COPYRIGHT" | "FAKE" | "OTHER";

// BR-SOC: Nhãn tiếng Việt cho lý do tố cáo, khớp enum backend TaoBaoCaoDto
export const LY_DO_BAO_CAO: Array<{ ma: LyDoBaoCao; nhan: string }> = [
  { ma: "SPAM", nhan: "Spam / quảng cáo" },
  { ma: "INAPPROPRIATE", nhan: "Nội dung không phù hợp" },
  { ma: "COPYRIGHT", nhan: "Vi phạm bản quyền" },
  { ma: "FAKE", nhan: "Thông tin sai lệch" },
  { ma: "OTHER", nhan: "Lý do khác" },
];

export interface GuiBaoCaoPayload {
  recipeId?: string;
  commentId?: string;
  reason: LyDoBaoCao;
}

// BR-SOC: Tố cáo món ăn hoặc bình luận — đúng 1 mục tiêu/lần, admin xử lý ở web
export async function guiBaoCao(payload: GuiBaoCaoPayload): Promise<void> {
  const ketQua = await goiApi(
    apiClient
      .post("reports", { json: payload })
      .json<ApiResponse<{ id: string; thanhCong: boolean }>>(),
  );
  ketQuaBaoCaoSchema.parse(ketQua);
}
