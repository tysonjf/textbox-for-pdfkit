// All these functions here measure some kind of text.
// What kind of text they measure can easily be taken from
// the respective function names.
// Basically all functions use the "measureTextWidth" function
// which uses the "widthOfString" function of pdfKit document.

import { PDFDocument, TextPart } from './types';

export function measureTextWidth(
	text: string,
	font: string,
	fontSize: number,
	doc: PDFDocument
): number {
	return doc.font(font).fontSize(fontSize).widthOfString(text);
}

export function measureTextsWidth(texts: TextPart[], doc: PDFDocument): TextPart[] {
	return texts.map((textPart) => {
		const { fontSize, font, text } = textPart;
		textPart.width = measureTextWidth(text, font!, fontSize!, doc);
		return textPart;
	});
}

export function checkParagraphFitsInLine(
	paragraph: TextPart[],
	textWidth: number
): boolean {
	let paragraphWidth = 0;
	paragraph.forEach((textpart) => (paragraphWidth += textpart.width!));
	return paragraphWidth <= textWidth;
}

export function measureTextFragments(
	textArray: string[],
	spaceWidth: number,
	font: string,
	fontSize: number,
	doc: PDFDocument
): { text: string; width: number }[] {
	return textArray.map((textFragment) => {
		if (textFragment === ' ') {
			return {
				text: textFragment,
				width: spaceWidth,
			};
		}
		return {
			text: textFragment,
			width: measureTextWidth(textFragment, font, fontSize, doc),
		};
	});
}
