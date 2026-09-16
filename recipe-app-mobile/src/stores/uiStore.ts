import { create } from 'zustand';

export type CheDoSangToi = 'sang' | 'toi' | 'he-thong';

export type DinhDangNgay = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';

interface UiState {
  cheDoSangToi: CheDoSangToi;
  datCheDoSangToi: (cheDo: CheDoSangToi) => void;
  dinhDangNgay: DinhDangNgay;
  datDinhDangNgay: (dinhDang: DinhDangNgay) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  cheDoSangToi: 'he-thong',
  datCheDoSangToi: (cheDoSangToi) => set({ cheDoSangToi }),
  dinhDangNgay: 'DD/MM/YYYY',
  datDinhDangNgay: (dinhDangNgay) => set({ dinhDangNgay }),
}));
