import PDFDocument from 'pdfkit';
// PDFKit.Mixins.PDFColor.fillColor(color: PDFKit.Mixins.ColorValue, opacity?: number): PDFKit.PDFDocument
export interface TextStyle {
	font?: string;
	fontSize?: number;
	lineHeight?: number;
	align?: 'left' | 'center' | 'right';
	color?: PDFKit.Mixins.ColorValue;
	opacity?: number;
	removeSubsequentSpaces?: boolean;
	link?: string | null;
	oblique?: number;
	underline?: boolean;
	strike?: boolean;
	newLine?: boolean;
	baseline?: 'alphabetic' | 'top' | 'middle' | 'bottom';
}

export interface TextPart extends TextStyle {
	text: string;
	width?: number;
}

export interface Line {
	align: 'left' | 'center' | 'right';
	width: number;
	lineHeight: number;
	texts: TextPart[];
}

export interface OpenedImage {
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

export type PDFDocument = typeof PDFDocument;
