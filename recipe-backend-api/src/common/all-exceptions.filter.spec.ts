import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';

function dungCuHost() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = { switchToHttp: () => ({ getResponse: () => ({ status }) }) } as never;
  return { host, status, json };
}

// BR-API: Mọi lỗi trả về { success: false, data: null, error: { code, message } } tiếng Việt
describe('AllExceptionsFilter', () => {
  it('HttpException object giữ mã code backend gửi', () => {
    const { host, status, json } = dungCuHost();
    new AllExceptionsFilter().catch(
      new HttpException({ code: '[REC-04]', message: '[REC-04] Không tìm thấy công thức' }, 404),
      host,
    );
    expect(status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith({
      success: false,
      data: null,
      error: { code: '[REC-04]', message: '[REC-04] Không tìm thấy công thức', details: undefined },
    });
  });

  it('HttpException chuỗi sinh mã theo status', () => {
    const { host, status, json } = dungCuHost();
    new AllExceptionsFilter().catch(new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED), host);
    expect(status).toHaveBeenCalledWith(401);
    expect(json.mock.calls[0][0].error).toEqual({ code: 'AUTH-02', message: 'Unauthorized' });
  });

  it('lỗi lạ thành SYS-00 giữ message gốc', () => {
    const { host, status, json } = dungCuHost();
    new AllExceptionsFilter().catch(new Error('boom'), host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].error).toEqual({ code: 'SYS-00', message: 'boom' });
  });

  it('giá trị không phải Error thành lỗi hệ thống', () => {
    const { host, status, json } = dungCuHost();
    new AllExceptionsFilter().catch('chuỗi lạ', host);
    expect(status).toHaveBeenCalledWith(500);
    expect(json.mock.calls[0][0].error).toEqual({ code: 'SYS-00', message: 'Lỗi hệ thống' });
  });
});
