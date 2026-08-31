# Recipe Backend API

REST API backend cho ứng dụng Cookbook (NestJS + Prisma + MySQL)

## Tech Stack

- **Framework**: NestJS 10 + TypeScript
- **ORM**: Prisma Client
- **Database**: MySQL 8+
- **Auth**: JWT (Access + Refresh Token) + Passport
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI 3.1
- **Testing**: Jest + Supertest

## Cấu trúc Module

```
recipe-backend-api/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── modules/
│   │   ├── auth/           # Authentication (login, register, refresh)
│   │   ├── users/          # User management
│   │   ├── recipes/        # Recipe CRUD
│   │   ├── ingredients/    # Ingredient management
│   │   └── upload/         # File upload (local storage)
│   ├── common/
│   │   ├── decorators/     # Custom decorators
│   │   ├── filters/        # Exception filters
│   │   ├── guards/         # Auth guards
│   │   ├── interceptors/   # Response interceptors
│   │   └── pipes/          # Validation pipes
│   ├── config/             # Configuration
│   ├── main.ts             # Entry point
│   └── app.module.ts       # Root module
├── package.json
├── tsconfig.json
└── nest-cli.json
```

## Database Schema (Prisma)

Models chính:
- **User** - Người dùng (USER/ADMIN)
- **Recipe** - Công thức nấu ăn
- **RecipeIngredient** - Nguyên liệu (có sortOrder cho STT)
- **RecipeStep** - Các bước (có stepOrder cho STT)
- **NutritionInfo** - Thông tin dinh dưỡng

## Quy tắc API (Bắt buộc)

1. **List endpoints KHÔNG trả `id`** - FE tự tính STT
2. **Detail endpoint CÓ `id`** nhưng FE không hiển thị
3. **Số trả về đã format VN** (`"1.000"`, `"100.000"`) cho quantity, nutrition
4. **Pagination chuẩn**: `page`, `size`, `sort` → response có `totalElements`, `totalPages`

## Development

```bash
# From monorepo root
pnpm db:generate            # Generate Prisma client
pnpm db:push                # Push schema to DB
pnpm db:studio              # Open Prisma Studio
pnpm --filter=recipe-backend-api dev

# Or directly
cd recipe-backend-api
pnpm install
pnpm db:generate
pnpm dev
```

## Environment Variables

```env
DATABASE_URL="mysql://user:password@localhost:3306/cookbook"
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV=development
UPLOAD_DIR="./uploads"
```

## Image Storage

- Local filesystem: `./uploads/` (configured via `UPLOAD_DIR`)
- Database chỉ lưu đường dẫn relative: `/uploads/recipes/uuid.jpg`
- Serve static files via NestJS `StaticAssetsModule`