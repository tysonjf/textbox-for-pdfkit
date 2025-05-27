import { Buffer } from 'buffer';
import fontkit from 'fontkit';
import { PDFDocument } from './types';

// Make Buffer available globally if it's not already
if (typeof global !== 'undefined') {
	global.Buffer = Buffer;
}

// Here we just return the ascents for the used font.
// Its needed to correctly align the font inside of a textbox.
// As fontkit only works with extra added .otf .ttf fonts
// but doesn't know anything about the pdfKit standard fonts, the ascents
// for the default fonts are returned manually. All other
// fonts get measured by fontkit.
// Thanks fontkit for being awesome ♥!

export function getFontAscent(font: string, fontSize: number, doc: PDFDocument): number {
	let ascentPerPoint = 0;
	const safeFont = font.trim();
	switch (safeFont) {
		case 'Courier':
		case 'Courier-Bold':
		case 'Courier-Oblique':
		case 'Courier-BoldOblique':
			ascentPerPoint = 629 / 1000;
			break;
		case 'Helvetica':
		case 'Helvetica-Bold':
		case 'Helvetica-Oblique':
		case 'Helvetica-BoldOblique':
			ascentPerPoint = 718 / 1000;
			break;
		case 'Times-Roman':
		case 'Times-Bold':
		case 'Times-Italic':
		case 'Times-BoldItalic':
			ascentPerPoint = 683 / 1000;
			break;
		case 'Symbol':
		case 'ZapfDingbats':
			ascentPerPoint = 500 / 1000;
			break;
		default:
			try {
				const docWithCurrentFont = doc.font(safeFont) as any;
				// // @ts-expect-error fontkit types are not correct (maybe)
				const fontObj = docWithCurrentFont._font.font as {
					ascent: number;
					unitsPerEm: number;
				};
				ascentPerPoint = fontObj.ascent / fontObj.unitsPerEm;
			} catch (e) {
				console.warn(`Failed to load font ${font}, falling back to Times-Roman`);
				ascentPerPoint = 683 / 1000;
			}
	}

	return fontSize * ascentPerPoint;
}
