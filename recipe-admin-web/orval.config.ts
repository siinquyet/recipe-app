import { defineConfig } from 'orval';

// BR-API: Sinh hooks TanStack Query + types từ docs/api/openapi.yaml, chạy bằng `pnpm gen:api`
export default defineConfig({
  cookbook: {
    input: '../docs/api/openapi.yaml',
    output: {
      target: './src/api/generated/endpoints.ts',
      schemas: './src/api/generated/schemas',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: {
          path: './src/api/generated/axios-instance.ts',
          name: 'goiAxiosChung',
        },
      },
    },
  },
});
