import path from 'path';
import eslint from 'vite-plugin-eslint';
import {
    defineConfig,
    loadEnv,
} from 'vite';
import vue from '@vitejs/plugin-vue';
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, path.join(process.cwd(), '..', '..'), '');

    const port = parseInt(env.CLIENT_PORT ?? 8080, 10);
    const APIPort = parseInt(env.API_PORT ?? 3000, 10);

    return {
        envDir: '../../',
        plugins: [
            vue({
                template: { transformAssetUrls },
            }),
            vuetify({
                autoImport: true,
            }),
            eslint(),
            ...(process.argv.includes('--host') ? [basicSsl()] : []), // Provide a self-signed certificate
        ],
        resolve: {
            extensions: [
                '.ts',
                '.vue',
            ],
        },
        server: {
            port,
            proxy: {
                '/api': {
                    target: `http://localhost:${APIPort}`,
                    changeOrigin: true,
                    rewrite: (pathname) => pathname.replace(/^\/api/, ''),
                },
            },
        },
    };
});
