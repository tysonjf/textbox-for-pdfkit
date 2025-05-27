import { TextPart, TextStyle } from '../src/types';

export const textboxStyle: TextStyle = {
	font: 'Times-Roman',
	fontSize: 12,
	lineHeight: 1,
	align: 'left',
	color: '#000000',
	removeSubsequentSpaces: true,
};

export const longText =
	'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore. ';
export const longWords = 'Loremipsumdolorsitamet, consetetursadipscingelitr. ';
export const newLineFirst = 'dolore magna aliquyam erat, sed diam voluptua.';
export const newLineSecond = 'At vero eos et accusam et justo duo dolores et ea rebum. ';
export const multiStyleLine1 = 'Lorem ipsum ';
export const multiStyleLine2 = 'dolor ';
export const multiStyleLine3 = 'sit amet';
export const lastLineWithStyle = 'Diam voluptua';

export const testText: TextPart[] = [
	{
		text: longText,
	},
	{
		text: longWords,
	},
	{
		text: newLineFirst + '\n\n' + newLineSecond,
	},
	{ text: multiStyleLine1, newLine: true },
	{ text: multiStyleLine2, fontSize: 20 },
	{ text: multiStyleLine3 },
	{
		text: lastLineWithStyle,
		fontSize: 9,
		newLine: true,
		align: 'right',
		color: '#ff0000',
		lineHeight: 4,
		font: 'Helvetica',
	},
];

export const normalizedTestText: TextPart[] = [
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: longText,
		newLine: false,
	},
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: longWords,
		newLine: false,
	},
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: newLineFirst,
		newLine: false,
	},
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: '',
		newLine: true,
	},
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: newLineSecond,
		newLine: true,
	},
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: multiStyleLine1,
		newLine: true,
	},
	{
		font: 'Times-Roman',
		fontSize: 20,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: multiStyleLine2,
		newLine: false,
	},
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: multiStyleLine3,
		newLine: false,
	},
	{
		font: 'Helvetica',
		fontSize: 9,
		lineHeight: 36,
		align: 'right',
		color: '#ff0000',
		removeSubsequentSpaces: true,
		text: lastLineWithStyle,
		newLine: true,
	},
];

export const testLine = [
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: multiStyleLine1,
		width: 123,
		newLine: true,
	},
	{
		font: 'Times-Roman',
		fontSize: 20,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: multiStyleLine2,
		width: 45,
		newLine: false,
	},
	{
		font: 'Times-Roman',
		fontSize: 12,
		lineHeight: 12,
		align: 'left',
		color: '#000000',
		removeSubsequentSpaces: true,
		text: multiStyleLine3,
		width: 67,
		newLine: false,
	},
];

export const testTextsForLineWidthMeasurement = [
	{
		text: 'This is a test Text',
		expectedLength: 84.096,
		fontSize: 12,
		font: 'Times-Roman',
	},
	{
		text: 'This is another test Text with other length',
		expectedLength: 199.752,
		fontSize: 12,
		font: 'Times-Roman',
	},
	{
		text: 'This is a test Text',
		expectedLength: 98.11200000000001,
		fontSize: 14,
		font: 'Times-Roman',
	},
	{
		text: 'This is a test Text',
		expectedLength: 98.604,
		fontSize: 12,
		font: 'Helvetica-Bold',
	},
];
