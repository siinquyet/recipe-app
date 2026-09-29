import Axios, { type AxiosRequestConfig } from 'axios';

// BR-API: Instance axios dùng chung cho code Orval sinh ra, cùng gốc /api/v1 với client viết tay
const gocChung = Axios.create({ baseURL: '/api/v1' });

export function goiAxiosChung<T>(cauHinh: AxiosRequestConfig, tuyChon?: AxiosRequestConfig): Promise<T> {
  return gocChung({ ...cauHinh, ...tuyChon }).then(({ data }) => data);
}
