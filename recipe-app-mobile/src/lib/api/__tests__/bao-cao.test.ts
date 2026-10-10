import { guiBaoCao } from "../bao-cao";
import { ApiError } from "../client";

jest.mock("../../auth/tokenManager", () => ({
  layAccessToken: jest.fn(async () => "token-hien-tai"),
  lamMoiAccessToken: jest.fn(async () => "token-moi"),
  xoaTokens: jest.fn(async () => {}),
}));

function mockFetch(body: unknown, status = 200) {
  global.fetch = jest.fn(
    async () =>
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
  ) as unknown as typeof fetch;
}

describe("guiBaoCao", () => {
  // BR-SOC: Hồi quy — goiApi đã bóc envelope, không parse envelope lần nữa
  it("envelope thành công thì resolve, không ném lỗi zod", async () => {
    mockFetch({
      success: true,
      data: { id: "bc-1", thanhCong: true },
      error: null,
    });

    await expect(
      guiBaoCao({ recipeId: "mi-xao-gion", reason: "SPAM" }),
    ).resolves.toBeUndefined();

    const url = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(url.url).toContain("reports");
  });

  it("tố cáo bình luận gửi đúng commentId", async () => {
    mockFetch({
      success: true,
      data: { id: "bc-2", thanhCong: true },
      error: null,
    });

    await guiBaoCao({ commentId: "cmt-1", reason: "INAPPROPRIATE" });

    const yeuCau = (global.fetch as jest.Mock).mock.calls[0][0] as Request;
    expect(yeuCau.url).toContain("reports");
  });

  it("backend báo lỗi thì ném ApiError (không rò ZodError)", async () => {
    mockFetch(
      {
        success: false,
        data: null,
        error: { code: "REP-00", message: "[REP-00]X" },
      },
      400,
    );

    const loi = await guiBaoCao({ reason: "SPAM" }).catch((e) => e);
    expect(loi).toBeInstanceOf(ApiError);
    expect((loi as Error).message).toBeTruthy();
  });
});
