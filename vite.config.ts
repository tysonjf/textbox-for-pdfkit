import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/index.ts'),
			name: 'pdfTextbox',
			fileName: (format) => `pdfTextbox.${format}.js`,
			formats: ['es', 'cjs', 'umd'],
		},
		rollupOptions: {
			external: ['pdfkit'],
			output: {
				globals: {
					pdfkit: 'PDFKit',
				},
				minifyInternalExports: false,
			},
		},
	},
});
