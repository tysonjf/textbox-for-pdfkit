declare module 'pdfkit/js/pdfkit.standalone' {
	import PDFKit from 'pdfkit';

	// Extend the PDFKit.PDFDocument interface
	interface PDFDocument extends PDFKit.PDFDocument {
		openImage(imageBuffer: Uint8Array | string | Buffer | ArrayBuffer): OpenedImage;
		image(
			src: ImageSrc | OpenedImage,
			x?: number,
			y?: number,
			options?: ImageOption
		): this;
		image(src: ImageSrc | OpenedImage, options?: ImageOption): this;
	}

	// Export the PDFDocument constructor
	const PDFDocument: {
		new (options?: PDFKit.PDFDocumentOptions): PDFDocument;
	};

	export = PDFDocument;
}

interface OpenedImage {
	label: string;
	height: number;
	width: number;
	image: {
		bits: number;
		colorSpace: string;
		colorType: number;
		colors: number;
		compressionMethod: number;
		data: Uint8Array;
		filterMethod: number;
		height: number;
		width: number;
		imgData: Uint8Array;
		interlaceMethod: number;
		palette: [];
		pixelBitLength: number;
		pos: number;
		text: object;
		transparency: object;
	};
	imageData: Uint8Array;
	obj: null;
}
