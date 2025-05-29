import PDFDocument from 'pdfkit';
export interface TextStyle {
	font?: string;
	fontSize?: number;
	lineHeight?: number;
	align?: 'left' | 'center' | 'right' | 'justify';
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
	align: 'left' | 'center' | 'right' | 'justify';
	width: number;
	lineHeight: number;
	texts: TextPart[];
}

export type PDFDocument = typeof PDFDocument;
