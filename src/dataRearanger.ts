import { Line, TextPart, TextStyle } from './types';

export function normalizeTexts(
	textArray: TextPart[],
	textboxStyle: TextStyle
): TextPart[] {
	/* 
      This function adds default values to every text object. This is necessary
      that all lines can be added with correct styling later.
      Also it checks whether linebreaks with '\n' are inside the text.
      If there are any it handles this using normalizedLinebreak function.
  */

	const normalizedTexts = textArray.flatMap((textInput) => {
		const textWithLineHeight = normalizeLineHeight(textInput, textboxStyle);
		const normalizedTextWithLinebreaks = {
			...textboxStyle,
			// Not sure if this is needed as it would just be overwritten
			// @ts-expect-error text is not used
			text: '',
			newLine: false,
			...textWithLineHeight,
		};
		return normalizeLinebreaks(normalizedTextWithLinebreaks);
	});
	return normalizedTexts;
}

function normalizeLineHeight(text: TextPart, textboxStyle: TextStyle): TextPart {
	if (text.hasOwnProperty('lineHeight')) {
		if (text.hasOwnProperty('fontSize')) {
			return { ...text, lineHeight: text.lineHeight! * text.fontSize! };
		} else {
			return { ...text, lineHeight: text.lineHeight! * textboxStyle.fontSize! };
		}
	} else {
		// If there is no line height specified, it just gets the standard textbox Line Height
		return {
			...text,
			lineHeight: textboxStyle.lineHeight! * textboxStyle.fontSize!,
		};
	}
}

function normalizeLinebreaks(text: TextPart): TextPart[] {
	/* 
      This function checks whether linebreaks with '\n' are inside the text. 
      If there are any it creates a new object with "newline=true"
    */
	if (!text.text.includes('\n')) {
		return [text];
	}

	const textParts = text.text.split('\n');
	return textParts.map((part, index) => {
		if (index === 0) {
			return { ...text, text: part };
		}
		return { ...text, text: part, newLine: true };
	});
}

export function summarizeParagraphs(texts: TextPart[]): TextPart[][] {
	/*
    After linebreaks are normalized, it is quite easy to summarize
    the paragraphs. Paragraphs are neccessary, because they need to be
    line wrapped as a whole. Every "newline" is a sign for a paragraph
    end.
   */
	const paragraphs: TextPart[][] = [];
	let currentParagraph: TextPart[] = [];

	texts.forEach((text) => {
		if (text.newLine) {
			if (currentParagraph.length > 0) {
				paragraphs.push(currentParagraph);
				currentParagraph = [];
			}
		}
		currentParagraph.push(text);
	});

	if (currentParagraph.length > 0) {
		paragraphs.push(currentParagraph);
	}

	return paragraphs;
}

export function createLine(texts: TextPart[]): Line {
	/* 
    This function turns arrays of lines into an object.
    It checks every text part of the line and summarizes
    the styling inside the object --> This is needed to
    position the line on the PDF correctly.
   */
	let lineHeight = 0;
	let width = 0;
	let align = texts[0].align || 'left';
	const lineTexts = texts.map((text) => {
		const newText = { ...text };
		if (newText.lineHeight! > lineHeight) lineHeight = newText.lineHeight!;
		width += newText.width!;
		delete newText.lineHeight;
		delete newText.align;
		return newText;
	});

	return {
		align,
		width,
		lineHeight,
		texts: lineTexts,
	};
}
