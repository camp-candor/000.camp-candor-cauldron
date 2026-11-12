import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: [
            'src/**/*.{test,spec}.{ts,tsx,js,jsx}',
            'test/**/*.{test,spec}.{ts,tsx,js,jsx}',
            'apps/dashboard/src/**/*.{test,spec}.{ts,tsx,js,jsx}',
            'apps/dashboard/test/**/*.{test,spec}.{ts,tsx,js,jsx}',
        ],
        alias: {
            'astro:middleware': path.resolve(
                __dirname,
                'src/test/astro-middleware-mock.ts',
            ),
        },
    },
})
