import clsx from 'clsx';
import { allowedActions, type ModerationAction } from './recipeQuery';
import type { ModerationTarget } from './useRecipeModeration';

const BTN = 'px-2.5 py-1 text-xs font-medium rounded-lg border disabled:opacity-40 disabled:cursor-not-allowed';

/**
 * Cuc nut thao tac cua mot dong cong thuc.
 *
 * Chi render nut ma backend cho phep o trang thai hien tai (`allowedActions`).
 * Truoc day trang duyet bai hien luon ca "Duyet" + "Tu choi"; o trang "Tat ca"
 * ma cung hien them "An" cho ca mon DRAFT/DA AN - bam vao se nhan 409. Nay la
 * quy tac cua `admin.service.ts`, dua ve mot cho de UI khong the hien nut chap.
 *
 * Component nay khong giup gi - chi la hang nut. Hop thoai xac nhan nam o
 * `useRecipeModeration` de ca hai trang dung chung mot bo trang thai.
 */
export function RecipeActionButtons({
  recipe,
  onView,
  onApprove,
  onReject,
  onHide,
  busyKind,
  showView = true,
}: {
  recipe: ModerationTarget;
  onView: (recipe: ModerationTarget) => void;
  onApprove: (recipe: ModerationTarget) => void;
  onReject: (recipe: ModerationTarget) => void;
  onHide: (recipe: ModerationTarget) => void;
  /** Thao tac dang chay o dau do, de vo hieu hoa dung nut do. */
  busyKind?: ModerationAction | null;
  /** An nut "Xem" khi dang o trong hop thoai chi tiet (nut vo nghia). */
  showView?: boolean;
}) {
  const actions = allowedActions(recipe.status);

  function run(kind: ModerationAction) {
    if (kind === 'approve') onApprove(recipe);
    else if (kind === 'reject') onReject(recipe);
    else onHide(recipe);
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {showView && (
        <button
          type="button"
          onClick={() => onView(recipe)}
          className={clsx(BTN, 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50')}
        >
          Xem
        </button>
      )}
      {actions.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => run(kind)}
          disabled={busyKind != null}
          className={clsx(
            BTN,
            kind === 'approve' && 'bg-green-600 text-white border-green-600 hover:bg-green-700',
            kind === 'reject' && 'bg-red-600 text-white border-red-600 hover:bg-red-700',
            kind === 'hide' && 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100',
          )}
        >
          {kind === 'approve' ? 'Duyệt' : kind === 'reject' ? 'Từ chối' : 'Ẩn'}
        </button>
      ))}

      {actions.length === 0 && (
        // Giu cot rong khi khong co thao tac nao, thay vi o trang thai "DRAFT"/
        // "DA AN" con mot khong gian trong trong co the toi am.
        <span className="text-xs text-gray-400">—</span>
      )}
    </div>
  );
}
