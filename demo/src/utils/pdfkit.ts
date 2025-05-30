import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import { StreamBuffer } from 'textbox-for-pdfkit';

interface GeneratePdfArgs {
	options?: PDFDocumentArgs;
	contentCallback: (doc: PDFDocument) => Promise<void> | void;
}

type PDFDocumentArgs = PDFKit.PDFDocumentOptions;

type GeneratePdfResult =
	| {
			success: false;
			error: Error;
	  }
	| {
			success: true;
			data: StreamBuffer;
	  };

export const generatePdfkit = async (
	args: GeneratePdfArgs
): Promise<GeneratePdfResult> => {
	const buffer = new StreamBuffer();
	const doc = new PDFDocument(args.options);
	try {
		return new Promise(async (resolve, reject) => {
			doc.on('data', (chunk: Uint8Array) => buffer.write(chunk));
			doc.on('end', () => {
				buffer.end();
				resolve({
					success: true,
					data: buffer,
				});
			});
			doc.on('error', (err) => {
				console.error('Error generating PDF:', err);
				reject(err);
			});

			await args.contentCallback(doc);

			doc.end();
		});
	} catch (e) {
		console.error('Error generating PDF:', e);
		return {
			success: false,
			error: e as Error,
		};
	}
};
