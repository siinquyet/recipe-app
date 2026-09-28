/**
 * Trang thai dung chung cho 3 thao tac duyet bai (Task 30).
 *
 * `PendingRecipesPage` va `AllRecipesPage` deu can: hop thoai xac nhan cho
 * Duyet/An, form nhap ly do cho Tu choi, hop thoai xem chi tiet, va mot noi
 * hien loi. Viet chung o hook de khong phai copy 4 lan - va de mot sua doi
 * (vi du them truong moi) khong chi co o mot noi.
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { extractApiMessage } from '../../api/errorMessage';
import {
  approveRecipe,
  hideRecipe,
  recipeKeys,
  rejectRecipe,
  validateRejectReason,
  type ModerationAction,
} from './recipeQuery';

/** Thong tin toi thieu de mo hop thoai xac nhan / hien thi ten. */
export interface ModerationTarget {
  id: string;
  title: string;
  status: string;
}

interface ActionVars {
  kind: ModerationAction;
  id: string;
  reason?: string;
}

const FALLBACK: Record<ModerationAction, string> = {
  approve: 'Duyệt thất bại',
  reject: 'Từ chối thất bại',
  hide: 'Ẩn thất bại',
};

const ACTION_LABEL: Record<'approve' | 'hide', string> = {
  approve: 'Duyệt',
  hide: 'Ẩn',
};

export function useRecipeModeration() {
  const queryClient = useQueryClient();

  const [actionError, setActionError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  /** Thao tac can xac nhan (khong the undo) */
  const [confirm, setConfirm] = useState<{ kind: 'approve' | 'hide'; recipe: ModerationTarget } | null>(
    null,
  );
  const [rejectTarget, setRejectTarget] = useState<ModerationTarget | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);

  function closeReject() {
    setRejectTarget(null);
    setRejectReason('');
    setRejectError(null);
  }

  const mutation = useMutation({
    mutationFn: (v: ActionVars) => {
      if (v.kind === 'approve') return approveRecipe(v.id);
      if (v.kind === 'reject') return rejectRecipe(v.id, v.reason ?? '');
      return hideRecipe(v.id);
    },
    onSuccess: async () => {
      setActionError(null);
      closeReject();
      setConfirm(null);
      // Invalidate ca list va detail: thao tac doi trang thai nen hop thoai
      // chi tiet dang mo cung phai hien trang thai moi, khong giu ban cu.
      await queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
    onError: (err, v) => {
      const message = extractApiMessage(err, FALLBACK[v.kind]);
      if (v.kind === 'reject') {
        // Giu nguyen ly do da go de quan tri vien sua roi gui lai, thay vi
        // phai nhap lai tu dau sau mot loi.
        setRejectError(message);
        return;
      }
      setConfirm(null);
      setActionError(message);
    },
  });

  function askConfirm(kind: 'approve' | 'hide', recipe: ModerationTarget) {
    setActionError(null);
    // Dong hop thoai chi tiet truoc khi mo hop xac nhan.
    //
    // `Modal` khoa cuon trang bang cach luu `body.style.overflow` hien tai roi
    // gan lai khi dong. Hai modal mo cung luc se pha quy tac do: ca hai deu
    // chup `''` (chua khoa) lam `prev`, dong thi chung se tra ve `''` - lan
    // nay may chay duoc, nhung neu hai modal dong cung mot luc (Escape) thi
    // thu tu khoi phuc co the ket thuc o `hidden` va trang bi khoa cuon vinh
    // vien. Mot hop thoai tai mot luc la cach suy ra duy nhat khong loi.
    setDetailId(null);
    setConfirm({ kind, recipe });
  }

  function askReject(recipe: ModerationTarget) {
    setActionError(null);
    setDetailId(null);
    setRejectTarget(recipe);
    setRejectReason('');
    setRejectError(null);
  }

  function openDetail(recipe: ModerationTarget) {
    setActionError(null);
    setDetailId(recipe.id);
  }

  function closeDetail() {
    setDetailId(null);
  }

  function confirmPending() {
    if (!confirm) return;
    mutation.mutate({ kind: confirm.kind, id: confirm.recipe.id });
  }

  function submitReject() {
    if (!rejectTarget) return;
    const invalid = validateRejectReason(rejectReason);
    if (invalid) {
      setRejectError(invalid);
      return;
    }
    setRejectError(null);
    mutation.mutate({ kind: 'reject', id: rejectTarget.id, reason: rejectReason });
  }

  return {
    // Loi chung (Duyet/An that bai) - hien bang thong bao do trang.
    actionError,
    dismissError: () => setActionError(null),

    detailId,
    openDetail,
    closeDetail,

    confirm,
    askConfirm,
    closeConfirm: () => setConfirm(null),
    confirmPending,

    rejectTarget,
    rejectReason,
    setRejectReason,
    rejectError,
    askReject,
    closeReject,
    submitReject,

    /** Thao tac dang chay, de vo hieu hoa nut cho tranh gui trung. */
    busyKind: mutation.isPending ? (mutation.variables?.kind ?? null) : null,
    confirmLabel: confirm ? ACTION_LABEL[confirm.kind] : '',
  };
}

export type RecipeModeration = ReturnType<typeof useRecipeModeration>;
