import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import tailwindcss from '@tailwindcss/vite'
import clerk from '@clerk/astro'
import react from '@astrojs/react'

export default defineConfig({
    output: 'server',
    server: {
        host: '0.0.0.0',
        port: 3000,
    },
    adapter: node({
        mode: 'standalone',
    }),
    integrations: [clerk(), react()],
    vite: {
        plugins: [tailwindcss()],
        ssr: {
            noExternal: [/@clerk/],
        },
    },
})
