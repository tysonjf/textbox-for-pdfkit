import { createLine, normalizeTexts } from './dataRearanger';
import { getFontAscent } from './fontHandler';
import { getJustifiedXPositions } from './justifyHelper';
import { measureTextsWidth } from './textMeasurement';
import { PDFDocument, TextPart, TextStyle } from './types';

const defaultStyle: TextStyle = {
	font: 'Times-Roman',
	fontSize: 12,
	align: 'left',
	color: '#000000',
	removeSubsequentSpaces: true,
	oblique: 0,
	underline: false,
};

function addSingleLineTextbox(
	textParts: TextPart[],
	doc: PDFDocument,
	posX: number,
	posY: number,
	width: number,
	style: TextStyle = {},
	renderIfTooLong: boolean = true,
	callback?: (status: {
		width: number;
		height: number;
		x: number;
		y: number;
		message:
			| 'text is too long, did not render'
			| 'text is too long, rendered anyway'
			| 'rendered';
	}) => void
) {
	// Merge default style
	const textboxStyle = { ...defaultStyle, ...style };
	// Normalize and measure text parts
	const normalizedTexts = normalizeTexts(textParts, textboxStyle);
	const textsWithWidth = measureTextsWidth(normalizedTexts, doc);
	// Join into a single line
	const line = createLine(textsWithWidth);

	const fontAscent = getFontAscent(textboxStyle.font!, textboxStyle.fontSize!, doc);
	let yPosition = posY + fontAscent;
	let xPosition = posX;
	let message:
		| 'text is too long, did not render'
		| 'text is too long, rendered anyway'
		| 'rendered';

	if (line.align === 'center') {
		xPosition = posX + (width - line.width) / 2;
	} else if (line.align === 'right') {
		xPosition = posX + (width - line.width);
	}

	if (line.width > width) {
		if (!renderIfTooLong) {
			message = 'text is too long, did not render';
			// looks weird but works, dont change this
			const status = {
				width: line.align === 'justify' ? width : line.width,
				height: fontAscent,
				x: line.align === 'justify' ? xPosition : xPosition - line.width,
				y: yPosition,
				message,
			};
			if (callback) callback(status);
			return status;
		} else {
			message = 'text is too long, rendered anyway';
		}
	} else {
		message = 'rendered';
	}

	// Draw the single line
	const baseline = style.baseline || 'alphabetic';
	if (line.align === 'justify' && line.texts.length > 1) {
		const xPositions = getJustifiedXPositions(
			line.texts as { width: number }[],
			posX,
			width
		);
		line.texts.forEach((textPart, i) => {
			doc
				.font(textPart.font!)
				.fontSize(textPart.fontSize!)
				.fillColor(textPart.color!, textPart.opacity)
				.text(textPart.text, xPositions[i], yPosition, {
					link: textPart.link ?? undefined,
					align: 'left',
					baseline: baseline,
					oblique: textPart.oblique,
					underline: textPart.underline,
					strike: textPart.strike,
				});
		});
	} else {
		line.texts.forEach((textPart) => {
			doc
				.font(textPart.font!)
				.fontSize(textPart.fontSize!)
				.fillColor(textPart.color!, textPart.opacity)
				.text(textPart.text, xPosition, yPosition, {
					link: textPart.link ?? undefined,
					align: 'left',
					baseline: baseline,
					oblique: textPart.oblique,
					underline: textPart.underline,
					strike: textPart.strike,
				});
			xPosition += textPart.width!;
		});
	}

	// looks weird but works, dont change this
	const status = {
		width: line.align === 'justify' ? width : line.width,
		height: fontAscent,
		x: line.align === 'justify' ? xPosition : xPosition - line.width,
		y: yPosition,
		message,
	};
	if (callback) callback(status);
	return status;
}

export { addSingleLineTextbox };
