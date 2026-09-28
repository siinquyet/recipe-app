import { useQuery } from '@tanstack/react-query';
import { extractApiMessage } from '../../api/errorMessage';
import { BodyText } from '../../components/ui/BodyText';
import { Modal } from '../../components/ui/Modal';
import { NumberDisplay } from '../../components/ui/NumberDisplay';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { RecipeActionButtons } from './RecipeActionButtons';
import {
  allowedActions,
  fetchRecipeDetail,
  formatDateTimeVi,
  recipeKeys,
  type ModerationAction,
  type RecipeDetail,
  type RecipeNutrition,
} from './recipeQuery';
import type { ModerationTarget } from './useRecipeModeration';

/**
 * Hop thoai xem chi tiet cong thuc, dung truoc khi duyet hoac tu choi.
 *
 * Tu tai du lieu rieng (`GET /recipes/:id`) chu khong nhan san ban ghi tu bang
 * danh sach: bang chi co tieu de va trang thai, khong co nguyen lieu va cac
 * buoc - ma dua ra quyet dinh duyet. Bai viet cung co the da bi tac gia sua
 * sau khi duyet len, nen xem lai cung tu viet la mot ban moi hon dung du lieu
 * cu.
 *
 * Cac con so dung `NumberDisplay` de dinh dang Viet + can phai theo BR.
 */
export function RecipeDetailModal({
  recipeId,
  onClose,
  onApprove,
  onReject,
  onHide,
  busyKind,
}: {
  recipeId: string | null;
  onClose: () => void;
  onApprove: (recipe: ModerationTarget) => void;
  onReject: (recipe: ModerationTarget) => void;
  onHide: (recipe: ModerationTarget) => void;
  busyKind?: ModerationAction | null;
}) {
  const { data, isLoading, error } = useQuery({
    queryKey: recipeKeys.detail(recipeId ?? ''),
    queryFn: () => fetchRecipeDetail(recipeId as string),
    enabled: Boolean(recipeId),
  });

  const actions = data ? allowedActions(data.status) : [];
  const canAct = actions.length > 0 && data != null;

  return (
    <Modal
      open={recipeId != null}
      onClose={onClose}
      title={data ? data.title : 'Chi tiết công thức'}
      size="xl"
      footer={
        canAct ? (
          <RecipeActionButtons
            recipe={{ id: data.id, title: data.title, status: data.status }}
            onView={() => {}}
            onApprove={onApprove}
            onReject={onReject}
            onHide={onHide}
            busyKind={busyKind}
            showView={false}
          />
        ) : (
          <span className="text-xs text-gray-500">
            {data && actions.length === 0
              ? 'Trạng thái hiện tại không có thao tác duyệt nào'
              : ''}
          </span>
        )
      }
    >
      {isLoading && <BodyText muted>Đang tải chi tiết…</BodyText>}

      {error != null && (
        <BodyText className="text-red-600 text-sm" bold>
          {extractApiMessage(error, 'Không tải được chi tiết công thức')}
        </BodyText>
      )}

      {data && <DetailBody recipe={data} />}
    </Modal>
  );
}

function DetailBody({ recipe }: { recipe: RecipeDetail }) {
  const totalMinutes =
    (recipe.prepTimeMinutes ?? 0) + (recipe.cookTimeMinutes ?? 0);

  return (
    <div className="space-y-5 text-sm">
      <header className="flex flex-wrap items-center gap-2">
        <StatusBadge status={recipe.status} />
        <span className="text-xs text-gray-500">Nguồn: {recipe.source}</span>
        {recipe.tags?.map((t) => (
          <span
            key={t.name}
            className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
          >
            #{t.name}
          </span>
        ))}
      </header>

      <BodyText>{recipe.description || '—'}</BodyText>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
        <Field label="Tác giả">{recipe.author?.displayName || '—'}</Field>
        <Field label="Email">{recipe.author?.email || '—'}</Field>
        <Field label="Danh mục">{recipe.category?.name || '—'}</Field>
        <Field label="Chuẩn bị">
          {recipe.prepTimeMinutes == null ? (
            '—'
          ) : (
            <NumberDisplay value={recipe.prepTimeMinutes} suffix="phút" />
          )}
        </Field>
        <Field label="Nấu">
          {recipe.cookTimeMinutes == null ? (
            '—'
          ) : (
            <NumberDisplay value={recipe.cookTimeMinutes} suffix="phút" />
          )}
        </Field>
        <Field label="Tổng thời gian">
          {totalMinutes > 0 ? (
            <NumberDisplay value={totalMinutes} suffix="phút" />
          ) : (
            '—'
          )}
        </Field>
        <Field label="Khẩu phần">
          {recipe.servings == null ? (
            '—'
          ) : (
            <NumberDisplay value={recipe.servings} suffix="người" />
          )}
        </Field>
        <Field label="Ngày tạo">{formatDateTimeVi(recipe.createdAt) || '—'}</Field>
        <Field label="Cập nhật">{formatDateTimeVi(recipe.updatedAt) || '—'}</Field>
      </dl>

      {recipe.rejectionReason && (
        <section className="p-3 rounded-lg bg-red-50 text-red-800">
          <BodyText bold>Lý do từ chối</BodyText>
          <BodyText>{recipe.rejectionReason}</BodyText>
        </section>
      )}

      {recipe.nutrition && <NutritionBlock nutrition={recipe.nutrition} />}

      <section>
        <BodyText bold className="mb-2">
          Nguyên liệu ({recipe.ingredients.length})
        </BodyText>
        {recipe.ingredients.length === 0 ? (
          <BodyText muted>Chưa có nguyên liệu</BodyText>
        ) : (
          <ol className="list-decimal list-inside space-y-1">
            {[...recipe.ingredients]
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((ing) => (
                <li key={ing.id}>
                  {ing.originalText}
                  {ing.internalIngredient?.canonicalName && (
                    <span className="text-gray-500">
                      {' '}
                      (chuẩn: {ing.internalIngredient.canonicalName})
                    </span>
                  )}
                </li>
              ))}
          </ol>
        )}
      </section>

      <section>
        <BodyText bold className="mb-2">
          Các bước ({recipe.steps.length})
        </BodyText>
        {recipe.steps.length === 0 ? (
          <BodyText muted>Chưa có bước thực hiện</BodyText>
        ) : (
          <ol className="list-decimal list-inside space-y-1">
            {[...recipe.steps]
              .sort((a, b) => a.stepOrder - b.stepOrder)
              .map((step) => (
                <li key={step.id}>{step.content}</li>
              ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function NutritionBlock({ nutrition }: { nutrition: RecipeNutrition }) {
  const items: { label: string; value: number | null; unit: string }[] = [
    { label: 'Calo', value: nutrition.calories, unit: 'kcal' },
    { label: 'Protein', value: nutrition.protein, unit: 'g' },
    { label: 'Carb', value: nutrition.carbs, unit: 'g' },
    { label: 'Fat', value: nutrition.fat, unit: 'g' },
  ];
  // Chi hien dong nao co so thuc te: 0 kcal o nguyen lieu chua nhap dinh duong
  // la "chua co", khong phai "khong co calo".
  const filled = items.filter((i) => typeof i.value === 'number' && i.value > 0);
  if (filled.length === 0) return null;

  return (
    <section>
      <BodyText bold className="mb-2">
        Dinh dưỡng
      </BodyText>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {filled.map((i) => (
          <Field key={i.label} label={i.label}>
            <NumberDisplay value={i.value} suffix={i.unit} />
          </Field>
        ))}
      </dl>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="text-gray-900">{children}</dd>
    </div>
  );
}
