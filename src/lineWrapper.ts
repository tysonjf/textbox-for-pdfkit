import { createLine } from './dataRearanger';
import {
	checkParagraphFitsInLine,
	measureTextFragments,
	measureTextWidth,
} from './textMeasurement';
import { Line, PDFDocument, TextPart } from './types';

export function lineWrapParagraph(
	paragraph: TextPart[],
	textWidth: number,
	doc: PDFDocument
): Line[] {
	// this function turns paragraphs into printable, wrapped lines

	// First check, whether paragraph fits in one line --> If yes return paragraph as line
	if (checkParagraphFitsInLine(paragraph, textWidth)) {
		return [createLine(paragraph)];
	}
	// If it doesn't fit completely inside the line do the line wrapping stuff
	let spaceLeftInLine = textWidth;
	let line: TextPart[] = [];
	let lines: Line[] = [];
	paragraph.forEach((textpart) => {
		if (textpart.width! <= spaceLeftInLine) {
			line.push(textpart);
			spaceLeftInLine -= textpart.width!;
		} else {
			const wrappedLines = wrapTextInLines(textpart, spaceLeftInLine, textWidth, doc);

			// If there's something in the current line, try to fit the first wrapped fragment
			if (line.length > 0 && wrappedLines.length > 0) {
				// Try to fit the first wrapped fragment into the current line
				if (wrappedLines[0].width! <= spaceLeftInLine) {
					line.push(wrappedLines[0]);
					spaceLeftInLine -= wrappedLines[0].width!;
					// Remove the first fragment since it's now in the current line
					wrappedLines.shift();
				}
				// Push the current line
				lines.push(createLine(line));
				line = [];
			}

			// Add all remaining wrapped lines except the last one directly to lines
			for (let i = 0; i < wrappedLines.length - 1; i++) {
				lines.push(createLine([wrappedLines[i]]));
			}

			// The last wrapped fragment may be continued by the next textpart
			if (wrappedLines.length > 0) {
				const lastWrapped = wrappedLines[wrappedLines.length - 1];
				line = [lastWrapped];
				spaceLeftInLine = textWidth - lastWrapped.width!;
			} else {
				line = [];
				spaceLeftInLine = textWidth;
			}
		}
	});
	// If the complete paragraph has been line wrapped: add the last line
	// to the lines array, even if it's not full, yet --> but only if it's not empty
	if (line.length > 0) {
		lines.push(createLine(line));
	}

	// Generate from lines array normalized line objects.
	return lines;
}

function wrapTextInLines(
	textPart: TextPart,
	widthLeft: number,
	widthTextbox: number,
	doc: PDFDocument
): TextPart[] {
	// This function splits up text into smallest fragments (words & spaces)
	// and adds then word by word to lines until line is full. Then the line
	// is added to a "lines-array". The first line can have less space (spaceLeft)
	// for all other lines it is expected, that the complete Texbox width
	// is available (widthTextbox)

	const { text, fontSize, font } = textPart;
	let spaceLeft = widthLeft;
	// This is some crazy positive lookbehind regex, it finds all spaces and "-"
	// This is neccessary that no characters are removed when splitting the text.
	const fragmentArray = text.split(/(?<=[ -])|(?= )/);
	const spaceWidth = measureTextWidth(' ', font!, fontSize!, doc);
	const fragmentArrayWithWidth = measureTextFragments(
		fragmentArray,
		spaceWidth,
		font!,
		fontSize!,
		doc
	);
	const lines: TextPart[] = [];
	let lineText = '';
	let lineWidth = 0;
	fragmentArrayWithWidth.forEach((textFragment) => {
		// Here we fill fragment by Fragment in lines
		if (textFragment.width <= spaceLeft) {
			// If it fits in line --> Add to line
			lineWidth += textFragment.width;
			spaceLeft -= textFragment.width;
			lineText = lineText + textFragment.text;
		} else if (textFragment.text !== ' ') {
			// If it doesn't fit, add full line to lines, and add text to new line.
			// If there are many spaces at a line end --> ignore them.
			lines.push({ ...textPart, text: lineText, width: lineWidth });
			lineText = '';
			lineWidth = 0;
			spaceLeft = widthTextbox;
			lineWidth += textFragment.width;
			spaceLeft -= textFragment.width;
			lineText = lineText + textFragment.text;
		}
	});
	if (lineText !== '') {
		lines.push({ ...textPart, text: lineText, width: lineWidth });
	}
	return lines;
}

export function removeSubsequentSpaces(lines: Line[], doc: PDFDocument): Line[] {
	// Words in Textfragments do always keep the space at the end. This is
	// for left aligned texts no problem but can look quite ugly for right
	// aligned texts. So there is the option to remove them (removing is default active)
	// The function basically just goes through every line and checks whether last
	// Character is a space. If yes it's removed
	return lines.map((line) => {
		const lastText = line.texts[line.texts.length - 1]; // last text item in line
		if (!lastText.removeSubsequentSpaces) return line;
		if (lastText.text.substring(lastText.text.length - 1) !== ' ') return line;
		const newLastText = lastText.text.substring(0, lastText.text.length - 1);
		const newLastTextWidth = measureTextWidth(
			newLastText,
			lastText.font!,
			lastText.fontSize!,
			doc
		);
		lastText.text = newLastText;
		lastText.width = newLastTextWidth;
		let newLineWidth = 0;
		line.texts.forEach((text) => {
			newLineWidth += text.width!;
		});
		line.width = newLineWidth;
		return line;
	});
}
