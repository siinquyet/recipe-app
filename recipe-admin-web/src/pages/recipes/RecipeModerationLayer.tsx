import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { FormField } from '../../components/ui/FormField';
import { Modal } from '../../components/ui/Modal';
import { RecipeDetailModal } from './RecipeDetailModal';
import { REJECT_REASON_MAX, REJECT_REASON_MIN } from './recipeQuery';
import type { RecipeModeration } from './useRecipeModeration';

/**
 * Lop hien thi 3 hop thoai cua thao tac duyet bai.
 *
 * Tach rieng de ca `PendingRecipesPage` va `AllRecipesPage` chi render mot
 * dong `<RecipeModerationLayer m={m} />` thay vi lap lai 4 khoi JSX - truoc do
 * moi trang tu viet rieng mot ban, nen sua mot lan phai sua hai cho.
 *
 * Chi mot hop thoai tai mot luc: xem ghi chu trong `useRecipeModeration`.
 */
export function RecipeModerationLayer({ m }: { m: RecipeModeration }) {
  return (
    <>
      <RecipeDetailModal
        recipeId={m.detailId}
        onClose={m.closeDetail}
        onApprove={(r) => m.askConfirm('approve', r)}
        onReject={m.askReject}
        onHide={(r) => m.askConfirm('hide', r)}
        busyKind={m.busyKind}
      />

      <ConfirmDialog
        open={m.confirm != null}
        title={m.confirm?.kind === 'approve' ? 'Duyệt công thức' : 'Ẩn công thức'}
        message={
          m.confirm?.kind === 'approve' ? (
            <>
              Duyệt <strong>{m.confirm.recipe.title}</strong> sang trạng thái{' '}
              <strong>Đã duyệt</strong>? Công thức sẽ hiện công khai với mọi
              người dùng.
            </>
          ) : (
            <>
              Ẩn <strong>{m.confirm?.recipe.title}</strong>? Người dùng sẽ không
              còn thấy công thức này.
            </>
          )
        }
        confirmLabel={m.confirmLabel}
        variant={m.confirm?.kind === 'hide' ? 'danger' : 'primary'}
        loading={m.busyKind === m.confirm?.kind}
        onCancel={m.closeConfirm}
        onConfirm={m.confirmPending}
      />

      <Modal
        open={m.rejectTarget != null}
        onClose={m.closeReject}
        title="Từ chối công thức"
        size="sm"
        footer={
          <>
            <button
              type="button"
              onClick={m.closeReject}
              disabled={m.busyKind === 'reject'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={m.submitReject}
              disabled={m.busyKind === 'reject'}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {m.busyKind === 'reject' ? 'Đang gửi...' : 'Xác nhận từ chối'}
            </button>
          </>
        }
      >
        <p className="text-sm text-gray-600 mb-3">
          Từ chối <strong>{m.rejectTarget?.title}</strong>
        </p>
        <FormField
          label="Lý do từ chối"
          name="rejectReason"
          value={m.rejectReason}
          onChange={m.setRejectReason}
          error={m.rejectError ?? undefined}
          required
          rows={4}
          placeholder="VD: Thiếu hình ảnh, thiếu thông tin dinh dưỡng..."
          hint={`Lý do sẽ hiện với tác giả. Tối thiểu ${REJECT_REASON_MIN}, tối đa ${REJECT_REASON_MAX} ký tự.`}
        />
      </Modal>
    </>
  );
}
