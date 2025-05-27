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
				// preserveModules: true,
				minifyInternalExports: false,
			},
		},
	},
	// resolve: {
	// 	alias: {
	// 		buffer: 'buffer',
	// 	},
	// },
	// define: {
	// 	global: 'window',
	// 	Buffer: 'Buffer',
	// },
	// optimizeDeps: {
	// 	include: ['buffer'],
	// },
});
