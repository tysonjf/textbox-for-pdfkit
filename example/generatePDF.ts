import fs from 'fs';
import { dirname } from 'path';
import PDFDocument from 'pdfkit';
import { fileURLToPath } from 'url';
import { addTextbox } from '../src/pdfTextbox';
import { TextPart } from '../src/types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testTextArray: TextPart[] = [
	{
		text: 'This is some text. ',
		fontSize: 12,
		color: 'red',
	},
	{
		text: 'This is more text in the same line, but with larger font. ',
		fontSize: 20,
	},
	{
		text: 'This is text with some\nnewlines\nin it. ',
	},
	{ text: 'blue text ', newLine: true, color: 'blue' },
	{ text: 'red text ', color: 'red' },
	{ text: 'green small text ', fontSize: 5, color: 'green' },
	{ text: 'Different ', font: 'Helvetica-Bold', newLine: true },
	{ text: 'fonts ', font: 'Helvetica-Oblique' },
	{ text: 'in ', font: 'Helvetica' },
	{ text: 'one ', font: 'Courier' },
	{ text: 'Line ', font: 'Times-BoldItalic' },
	{
		text: '- Oh its right aligned',
		fontSize: 9,
		newLine: true,
		align: 'right',
	},
	{
		text: 'FINALLY SOME SICK CUSTOM FONT. ',
		font: 'Guardian-Pro',
		fontSize: 24,
		align: 'center',
		newLine: true,
	},
];

async function generate() {
	const doc = new PDFDocument({
		size: [1000, 1000],
		margin: 0,
	});
	doc.pipe(fs.createWriteStream(__dirname + '/example.pdf'));

	const fontBuffer = await fetch('https://fonts.cdnfonts.com/s/6406/guardianp.woff').then(
		(res) => res.arrayBuffer()
	);

	doc.registerFont('Guardian-Pro', fontBuffer);

	try {
		addTextbox(
			testTextArray,
			doc,
			50,
			50,
			500,
			{
				fontSize: 12,
				lineHeight: 1.2,
			},
			500
		);
	} catch (error) {
		console.error(error);
	}
	doc.end();
}

generate();
