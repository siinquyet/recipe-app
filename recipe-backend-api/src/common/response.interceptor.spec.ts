import { lastValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';

// BR-API: Envelope { success, data, error } bọc mọi response thành công
describe('ResponseInterceptor', () => {
  const interceptor = new ResponseInterceptor<string | null>();
  const goiVoi = (giaTri: string | null) =>
    lastValueFrom(interceptor.intercept({} as never, { handle: () => of(giaTri) }));

  it('bọc dữ liệu vào envelope thành công', async () => {
    await expect(goiVoi('Phở bò')).resolves.toEqual({ success: true, data: 'Phở bò', error: null });
  });

  it('dữ liệu null thành data null (không thành undefined)', async () => {
    await expect(goiVoi(null)).resolves.toEqual({ success: true, data: null, error: null });
  });
});
