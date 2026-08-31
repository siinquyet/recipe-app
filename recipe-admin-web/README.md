# Recipe Admin Web

Trang quản trị web cho ứng dụng Cookbook (React + Vite + TypeScript)

## Tech Stack

- **Framework**: React 18 + Vite + TypeScript
- **Routing**: React Router v6
- **State Management**: TanStack Query + Zustand
- **Forms**: React Hook Form + Zod
- **UI**: TailwindCSS + Headless UI + Heroicons
- **API Client**: Axios (generated from OpenAPI via Orval)
- **Testing**: Vitest + React Testing Library

## Cấu trúc Module

```
recipe-admin-web/
├── src/
│   ├── api/              # Generated API client (Orval)
│   ├── components/
│   │   ├── ui/           # Reusable UI components
│   │   └── layout/       # Layout components
│   ├── features/
│   │   ├── recipes/      # Recipe management
│   │   ├── ingredients/  # Ingredient management
│   │   └── users/        # User management
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilities (number formatting, etc.)
│   ├── styles/           # Global styles, Tailwind
│   └── main.tsx          # Entry point
├── package.json
├── vite.config.ts
├── tsconfig.json
└── index.html
```

## Quy tắc UI (Bắt buộc)

1. **Không hiển thị ID** - chỉ STT 1, 2, 3...
2. **Chữ căn trái** - `text-left`
3. **Số căn phải** - `text-right` + format VN (`1.000`, `100.000`)

## Development

```bash
# From monorepo root
pnpm dev                    # Runs all apps
pnpm --filter=recipe-admin-web dev

# Or directly
cd recipe-admin-web
pnpm install
pnpm dev
```

## API Connection

- Dev proxy: `/api` → `http://localhost:3000` (configured in vite.config.ts)
- Production: Set `VITE_API_URL` env variable