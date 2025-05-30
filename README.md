# textbox-for-pdfkit-ts

A TypeScript package to easily create beautiful Textboxes with [PDFKit](https://www.npmjs.com/package/pdfkit)

## Description

PDFKit is a wonderful package to easily create PDFs in Node and in browser applications. But there is one issue which was reported several times but was never fixed: When using the "continued: true"-keyword in texts, combined with a text-alignment which is not "left", things start to get messy (see [1](https://github.com/foliojs/pdfkit/issues/774), [2](https://github.com/foliojs/pdfkit/issues/240)). So for example if you want to use multiple font sizes, fonts or colors in the same line, while having a text which is not left aligned, this won't work. This issue can be solved with this package.

This is a TypeScript fork of the original [textbox-for-pdfkit](https://github.com/NikolaiMe/textbox-for-pdfkit) package, providing full TypeScript support and improved type safety.

### Key Features

- Full TypeScript support with proper type definitions
- Works in both Node.js and browser environments
- Supports custom fonts in both Node.js and browser contexts
- Enhanced color support with all PDFKit color types
- Maintains all original functionality with improved type safety

The idea behind textbox-for-pdfkit-ts is to define an area where some text shall be written and just pass an array of text-objects to that text-area. Each of those text-objects can have a individual styling. textbox-for-pdfkit-ts handles the rest for you: It does line wrapping, alignment of texts and the styling.

textbox-for-pdfkit-ts is made for smaller texts which need much styling and need to be positioned anywhere freely on the page. It's similar to the text box you know e.g. from MS Word or Excel. This does also mean that it is not designed for large multipage texts. Please rely in those cases on the standard-PDFKit-way to add texts.

## Installation

Install by using [pnpm](https://pnpm.io/):

```bash
pnpm add textbox-for-pdfkit-ts
```

Or using [npm](http://npmjs.org/):

```bash
npm install textbox-for-pdfkit-ts
```

## Example

### Basic Usage

```typescript
import { addTextbox } from 'textbox-for-pdfkit-ts';
import PDFDocument from 'pdfkit';
import fs from 'fs';

// Define the text array with proper TypeScript types
const testTextArray = [
	{
		text: 'This is some text. ',
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
];

function createPDF() {
	const doc = new PDFDocument({
		size: [500, 500],
		margin: 0,
	});

	doc.pipe(fs.createWriteStream('test.pdf'));

	addTextbox(testTextArray, doc, 100, 100, 200, {
		color: 'black',
		fontSize: 13,
		lineHeight: 1.5,
		align: 'center',
	});

	doc.end();
}
```

### Using Custom Fonts (Browser & Node.js)

```typescript
import { addTextbox } from 'textbox-for-pdfkit-ts';
import PDFDocument from 'pdfkit';

// In browser, you can load fonts using fetch
const fontResponse = await fetch('path/to/your/font.ttf');
const fontArrayBuffer = await fontResponse.arrayBuffer();

// In Node.js, you can load fonts using fs
// const fontArrayBuffer = fs.readFileSync('path/to/your/font.ttf');

const doc = new PDFDocument();
doc.registerFont('my-font', fontArrayBuffer);

// Use the custom font in your textbox
addTextbox(
	[{ text: 'This text uses my custom font', font: 'my-font' }],
	doc,
	100,
	100,
	200,
	{ font: 'my-font' }
);
```

### Color Support

The package supports all PDFKit color types through `PDFKit.Mixins.ColorValue`:

```typescript
import PDFDocument from 'pdfkit';

const textArray = [
	{ text: 'RGB Color', color: [255, 0, 0] }, // RGB array
	{ text: 'CMYK Color', color: [0, 0, 0, 1] }, // CMYK array
	{ text: 'Named Color', color: 'blue' }, // Named color
	{ text: 'Hex Color', color: '#FF0000' }, // Hex color
	{ text: 'Gray Color', color: 0.5 }, // Gray value
	{ text: 'Color with Opacity', color: 'red', opacity: 0.5 }, // Color with opacity
];
```

### Type Definitions

The package provides full TypeScript support with the following main interfaces:

```typescript
interface TextStyle {
	font?: string;
	fontSize?: number;
	lineHeight?: number;
	align?: 'left' | 'center' | 'right';
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

interface TextPart extends TextStyle {
	text: string;
	width?: number;
}
```

## Usage

The Package can only be used together with [PDFKit](https://www.npmjs.com/package/pdfkit). The package has basically just one function which needs to be called: `addTextbox()`. This is also the only function which is exported by the package.

Import the function as follows:

```typescript
import { addTextbox } from 'textbox-for-pdfkit-ts';
```

### The `addTextbox()` function

Syntax:

```typescript
addTextbox(textArray: TextObject[], doc: PDFKit.PDFDocument, posX: number, posY: number, width: number, defaultStyle?: StyleOptions, height?: number): void;
```

Function parameter description:

- **textArray:** An array of [Text Objects](#text-objects)
- **doc:** The doc object you get from PDFKit
- **posX:** The X-Position of the upper left corner of your Textbox (in PDF-points)
- **posY:** The Y-Position of the upper left corner of your Textbox (in PDF-points)
- **width:** The width of your Textbox (in PDF-points)
- **defaultStyle:** (optional) An object which defines the default styling of the whole textbox
- **height:** (optional) The maximum height of your Textbox (in PDF-points)

### Text Objects

A Text Object can have the following attributes:

```typescript
interface TextObject {
	text: string;
	font?: string;
	fontSize?: number;
	lineHeight?: number;
	align?: 'left' | 'right' | 'center';
	color?: string;
	oblique?: number;
	newline?: boolean;
	link?: string;
	underline?: boolean;
	strike?: boolean;
}
```

The Object attributes in detail:

**text** _(mandatory)_

- It contains the text which shall be written
- You can use '\n' for creating a new line

**font** _(optional)_

- Name of the font in which the text shall be written

**fontsize** _(optional)_

- The fontsize (in PDF-points) in which the text shall be written

**line height** _(optional)_

- The distance between two lines

**align** _(optional)_

- Horizontal text alignment
- Possible values: "left", "right", "center"

**color** _(optional)_

- The color in which the text shall be written
- Format: Either use standard css colors (like "red", "blue"...) or use html-notation ("#rrggbb")

**oblique** _(optional)_

- If you use another number then 0 your text will be italic by the degrees of the given number.
- Number space: 0 - 90

**newline** _(optional)_

- If set to `true` the text will start in a new line
- If set to `false` the text will be written in the same line as the text before

**link** _(optional)_

- **Known issue:** The clickable link is not directly on the text, but a little bit below. More info in chapter [Workaround for underline/strike/link issues](#workaround).
- Give a link in that string and the text will be a clickable link

**underline** _(optional)_

- **Known issue:** The line is not directly under the text, but too low. More info in chapter [Workaround for underline/strike/link issues](#workaround).
- If set to `true` the given text will be underlined

**strike** _(optional)_

- **Known issue:** The line is not directly under the text, but too low. More info in chapter [Workaround for underline/strike/link issues](#workaround).
- If set to `true` the given text will be underlined

## <a name="workaround"></a>Workaround for underline/strike/link issues

_This workaround is available starting from version 0.2.0_

There is a [bug](https://github.com/foliojs/pdfkit/issues/994) in PDFKit library, which causes underlines, strike-through-lines and links to appear below its expected position. This bug only appears when using a different [text-baseline](https://www.w3schools.com/tags/canvas_textbaseline.asp) than "top". Unfortunately this library needs for most use cases the text-baseline "alphabetic".

But there are some use-cases where the "alphabetic" baseline is not needed. For example, when using only one type of font, with only one font-size. In this use case, text baseline "top" does the job perfectly, too.

So if you just want some centered, or right aligned text, which has some links, underlines or strikes inside, but never changes text size or font, then you will be glad to have this new feature.

If you add to the "default Style" of your textbox the line `baseline: "top"` (as shown in the example below) the features "link", "underline" and "strike" work as expected.

**!BUT!** If you add this, and use different fonts or different font-sizes you will see that your text is not correctly aligned.

Example [you can the find the result of the example here](https://github.com/NikolaiMe/textbox-for-pdfkit/raw/main/examples/testPartTwo.pdf):

```
   const testTextArrayTwo = [
    {
      text: "text 2 ",
    },
    { text: "striked", strike: true },
    {
      text: " ",
    },
    { text: "underlined", underline: true },
    {
      text: " ",
    },
    { text: "link", link: "www.google.com", color:"blue" },
  ];

  addTextbox(testTextArrayTwo, doc, 100, 100, 200, {
    color: "black",
    fontSize: 13,
    lineHeight: 1.5,
    align: "center",
    // this "baseline"-line below is very important to make strike, underline and link work
    baseline: "top",
  });
```

## Changelog

| Version | Changes                    |
| ------- | -------------------------- |
| 0.1.0   | Initial TypeScript release |

## Projects which use textbox-for-pdfkit

[jungeTrauer](https://jungetrauer.de/designer/TRAUERKARTE_HAND_001)

## Thank You

[PDFKit](https://www.npmjs.com/package/pdfkit) - For creating such a powerful PDF Creator.

[fontkit](https://www.npmjs.com/package/fontkit) - For providing the tools to measure fonts and texts.

[Original textbox-for-pdfkit](https://github.com/NikolaiMe/textbox-for-pdfkit) - For the original implementation that this package is based on.
