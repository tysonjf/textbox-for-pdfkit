import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		lib: {
			entry: resolve(__dirname, 'src/pdfTextbox.ts'),
			name: 'TextboxForPdfkit',
			fileName: (format) => `pdfTextbox.${format}.js`,
			formats: ['es', 'cjs', 'umd'],
		},
		rollupOptions: {
			external: ['pdfkit'],
			output: {
				globals: {
					pdfkit: 'PDFKit',
				},
				// preserveModules: true,
				minifyInternalExports: false,
			},
		},
	},
	resolve: {
		alias: {
			buffer: 'buffer',
		},
	},
	define: {
		'global.Buffer': 'Buffer',
	},
	optimizeDeps: {
		include: ['buffer'],
	},
});
