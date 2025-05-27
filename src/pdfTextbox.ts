import { normalizeTexts, summarizeParagraphs } from './dataRearanger';
import { getFontAscent } from './fontHandler';
import { lineWrapParagraph, removeSubsequentSpaces } from './lineWrapper';
import { measureTextsWidth } from './textMeasurement';
import { Line, PDFDocument, TextPart, TextStyle } from './types';

// This is the main package of textbox-for-pdfkit. It is the main function
// which prepares the data by calling all the subfunctions.
// Also it handles the drawing of the text on the pdf, after it was prepared.

// Default Style. If one style attribute is not set when calling addTextbox, the
// respective default attribute is set.
const defaultStyle: TextStyle = {
	font: 'Times-Roman',
	fontSize: 12,
	lineHeight: 1,
	align: 'left',
	color: '#000000',
	removeSubsequentSpaces: true,
	link: null,
	oblique: 0,
	underline: false,
};

// This is the only function which is needed in the end. It calls
// every needed function step by step. Details what all functions
// are doing can be found in the respective packages (where the functions
// are defined)

function addTextbox(
	text: TextPart[],
	doc: PDFDocument,
	posX: number,
	posY: number,
	width: number,
	style: TextStyle = {},
	height: number | null = null
): void {
	const textboxStyle = { ...defaultStyle, ...style };
	const normalizedTexts = normalizeTexts(text, textboxStyle);
	const textsWithWidth = measureTextsWidth(normalizedTexts, doc);
	const paragraphedTexts = summarizeParagraphs(textsWithWidth);
	const lines = paragraphedTexts.flatMap((pTexts) => {
		return lineWrapParagraph(pTexts, width, doc);
	});
	const optimizedLines = removeSubsequentSpaces(lines, doc);

	const baseline = style.baseline || 'alphabetic';

	drawTextLinesOnPDF(
		optimizedLines,
		width,
		posX,
		posY,
		textboxStyle,
		doc,
		baseline,
		height
	);
}

// This function takes the prepared Data and draws everything on the right
// position of the PDF

function drawTextLinesOnPDF(
	lines: Line[],
	width: number,
	posX: number,
	posY: number,
	defaultStyle: TextStyle,
	doc: PDFDocument,
	baseline: string,
	height: number | null
): void {
	let currentHeight = 0;
	// let yPosition = posY + lines[0].lineHeight;
	let yPosition = posY + getFontAscent(defaultStyle.font!, defaultStyle.fontSize!, doc);

	lines.forEach((line, index) => {
		currentHeight += line.lineHeight;
		if (height && currentHeight > height) return;

		if (index !== 0) yPosition += line.lineHeight;
		let xPosition = getLineStartXPosition(line, width, posX);

		line.texts.forEach((textPart) => {
			doc
				.font(textPart.font!)
				.fontSize(textPart.fontSize!)
				.fillColor(textPart.color!, textPart.opacity)
				.text(textPart.text, xPosition, yPosition, {
					link: textPart.link ?? undefined,
					align: 'left',
					// @ts-expect-error baseline is not typed correctly
					baseline: baseline,
					oblique: textPart.oblique,
					underline: textPart.underline,
					strike: textPart.strike,
				});
			xPosition += textPart.width!;
		});
	});
}

// This function handles the setting of the line start X-position
// depending on its "align" attribute
function getLineStartXPosition(line: Line, width: number, posX: number): number {
	const spaceLeft = width - line.width;
	if (spaceLeft < 0) return posX;

	switch (line.align) {
		case 'left':
			return posX;
		case 'center':
			return posX + spaceLeft / 2;
		case 'right':
			return posX + spaceLeft;
		default:
			return posX;
	}
}

export { addTextbox };
