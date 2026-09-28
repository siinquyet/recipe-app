import clsx from 'clsx';

export interface FormOption {
  value: string;
  label: string;
}

/**
 * Truong nhap co nhan + thong bao loi, dung chung cho tat ca form.
 *
 * Luon gan `id` cho input tu `name` va noi bang `htmlFor` de nhan click
 * duoc vao dung o input (accessibility + test duoc bang getByLabelText).
 */
export function FormField({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = 'text',
  options,
  rows,
  placeholder,
  disabled,
  className,
  hint,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  /** Thong bao loi. Co gia tri thi input duoc danh dau aria-invalid. */
  error?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'datetime-local';
  /** Neu co, render <select> thay vi <input> */
  options?: FormOption[];
  rows?: number;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Ghi chu duoi truong, khong phai loi */
  hint?: string;
}) {
  const base = clsx(
    'w-full px-3 py-2 border rounded-lg text-sm outline-none transition',
    'focus:ring-2 disabled:bg-gray-100 disabled:text-gray-500',
    error ? 'border-red-500 focus:ring-red-500/30' : 'border-gray-300 focus:ring-blue-500/30',
    className,
  );

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      {options ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          className={base}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          id={name}
          name={name}
          value={value}
          rows={rows}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          className={base}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          className={base}
        />
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      ) : null}
    </div>
  );
}
