declare module 'pdfkit/js/pdfkit.standalone' {
	import PDFKit from 'pdfkit';
	const PDFDocument: typeof PDFKit;
	export = PDFDocument;
}
