import PDFDocument from 'pdfkit';

export interface TextStyle {
	font?: string;
	fontSize?: number;
	lineHeight?: number;
	align?: 'left' | 'center' | 'right';
	color?: string;
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

export type PDFDocument = typeof PDFDocument;

// export interface PDFDocument {
// 	font: (font: string) => PDFDocument;
// 	fontSize: (size: number) => PDFDocument;
// 	fillColor: (color: string) => PDFDocument;
// 	text: (
// 		text: string,
// 		x: number,
// 		y: number,
// 		options?: {
// 			link?: string;
// 			align?: string;
// 			baseline?: string;
// 			oblique?: number;
// 			underline?: boolean;
// 			strike?: boolean;
// 		}
// 	) => PDFDocument;
// 	widthOfString: (text: string) => number;
// }
