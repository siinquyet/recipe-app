import { resolveStatus, type StatusTone } from './statusMeta';
import clsx from 'clsx';

const TONE_CLASS: Record<StatusTone, string> = {
  gray: 'bg-gray-100 text-gray-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  green: 'bg-green-100 text-green-700',
  red: 'bg-red-100 text-red-700',
  blue: 'bg-blue-100 text-blue-700',
};

/**
 * Badge trang thai dung chung cho toan bo trang quan tri.
 *
 * Thay the 3 ban StatusBadge trung nhau (RecipesPage, UsersPage,
 * RecipeReferencesPage) - moi ban tu dinh nghia mau rieng va hien thi ma enum
 * tieng Anh. Ban nay hien thi nhan tieng Viet lay tu `statusMeta.ts`.
 */
export function StatusBadge({
  status,
  label,
  tone,
  className,
}: {
  status: string | null | undefined;
  /** Ghi de nhan mac dinh */
  label?: string;
  /** Ghi de mau mac dinh */
  tone?: StatusTone;
  className?: string;
}) {
  const meta = resolveStatus(status);

  return (
    <span
      className={clsx(
        'inline-block px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap',
        TONE_CLASS[tone ?? meta.tone],
        className,
      )}
    >
      {label ?? meta.label}
    </span>
  );
}
