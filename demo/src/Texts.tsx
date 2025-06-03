import { textBox } from 'pdfkit-utils';
import { pdfToImg } from 'pdftoimg-js/browser';
import { useRef, useState } from 'react';
import { generatePdfkit } from './utils/pdfkit';

type TextPart = {
	text: string;
	oblique?: number;
	newLine?: boolean;
	underline?: boolean;
	strike?: boolean;
	color?: [number, number, number, number];
};

export function Texts() {
	const [imgs, setImgs] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [isGenerating, setIsGenerating] = useState(false);
	const [textValue, setTextValue] = useState('');
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const handleBullet = () => {
		if (!textareaRef.current) return;
		const textarea = textareaRef.current;
		const value = textarea.value;
		const selectionStart = textarea.selectionStart;
		const selectionEnd = textarea.selectionEnd;

		// Find the start of the current line
		const before = value.lastIndexOf('\n', selectionStart - 1) + 1;
		const after = value.indexOf('\n', selectionEnd);
		const lineEnd = after === -1 ? value.length : after;
		const line = value.slice(before, lineEnd);

		let newLine = line;
		if (line.startsWith('[bullet]')) {
			// Remove bullet if present
			newLine = line.replace(/^\[bullet\]/, '');
		} else {
			// Add bullet if not present
			newLine = '[bullet]' + line;
		}

		const newValue = value.slice(0, before) + newLine + value.slice(lineEnd);
		setTextValue(newValue);

		// Move cursor to after the bullet or to the start if removed
		const cursorPos = line.startsWith('[bullet]')
			? selectionStart - '[bullet]'.length
			: selectionStart + '[bullet]'.length;
		setTimeout(() => {
			textarea.setSelectionRange(cursorPos, cursorPos);
		}, 0);
	};

	function toggleTag(tag: string, closeTag: string) {
		if (!textareaRef.current) return;
		const textarea = textareaRef.current;
		const value = textarea.value;
		const selectionStart = textarea.selectionStart;
		const selectionEnd = textarea.selectionEnd;
		const before = value.slice(0, selectionStart);
		const selected = value.slice(selectionStart, selectionEnd);
		const after = value.slice(selectionEnd);

		const openTag = tag;
		const close = closeTag;
		const tagLen = openTag.length;
		const closeLen = close.length;

		if (selectionStart === selectionEnd) {
			// No selection: find the word at the cursor
			const left = value.slice(0, selectionStart);
			const right = value.slice(selectionStart);
			const wordStart = left.search(/\S+$/); // last non-space before cursor
			const wordEndRel = right.search(/\s|$/); // first space after cursor
			const wordEnd = selectionStart + (wordEndRel === -1 ? 0 : wordEndRel);
			const word = value.slice(wordStart, wordEnd);

			if (word.startsWith(openTag) && word.endsWith(close)) {
				// Remove tags
				const unwrapped = word.slice(tagLen, word.length - closeLen);
				const newValue = value.slice(0, wordStart) + unwrapped + value.slice(wordEnd);
				const cursorPos = wordStart + unwrapped.length;
				setTextValue(newValue);
				setTimeout(() => {
					textarea.setSelectionRange(cursorPos, cursorPos);
				}, 0);
				return;
			} else {
				// Add tags
				const wrapped = openTag + word + close;
				const newValue = value.slice(0, wordStart) + wrapped + value.slice(wordEnd);
				const cursorPos = wordStart + wrapped.length;
				setTextValue(newValue);
				setTimeout(() => {
					textarea.setSelectionRange(cursorPos, cursorPos);
				}, 0);
				return;
			}
		}

		// Selection: operate on each word in the selection
		const words = selected.match(/\S+|\s+/g) || [];
		let newSelected = '';
		let accLen = 0;
		for (const w of words) {
			if (/^\s+$/.test(w)) {
				newSelected += w;
				accLen += w.length;
				continue;
			}
			if (w.startsWith(openTag) && w.endsWith(close)) {
				// Remove tags
				const unwrapped = w.slice(tagLen, w.length - closeLen);
				newSelected += unwrapped;
				accLen += unwrapped.length;
			} else {
				// Add tags
				const wrapped = openTag + w + close;
				newSelected += wrapped;
				accLen += wrapped.length;
			}
		}
		const newValue = before + newSelected + after;
		setTextValue(newValue);
		setTimeout(() => {
			textarea.setSelectionRange(selectionStart, selectionStart + newSelected.length);
		}, 0);
	}

	const handleItalic = () => toggleTag('<i>', '</i>');
	const handleUnderline = () => toggleTag('<u>', '</u>');
	const handleStrike = () => toggleTag('<s>', '</s>');

	const handleColor = () => {
		if (!textareaRef.current) return;
		const textarea = textareaRef.current;
		const value = textarea.value;
		const selectionStart = textarea.selectionStart;
		const selectionEnd = textarea.selectionEnd;
		const before = value.slice(0, selectionStart);
		const selected = value.slice(selectionStart, selectionEnd);
		const after = value.slice(selectionEnd);
		const cmyk = prompt('Enter CMYK values as c,m,y,k (e.g. 0,1,0,0):');
		if (!cmyk) return;
		const newValue = before + `<cmyk ${cmyk}>` + selected + '</cmyk>' + after;
		setTextValue(newValue);
		const cursorPos = selectionEnd + `<cmyk ${cmyk}></cmyk>`.length;
		setTimeout(() => {
			textarea.setSelectionRange(cursorPos, cursorPos);
		}, 0);
	};

	function parseLineToTextParts(line: string, isFirstLine: boolean): TextPart[] {
		// Support nested/overlapping tags by parsing in order: cmyk, u, s, i
		// We'll use a recursive approach for nested tags
		function parseRecursive(text: string, base: Partial<TextPart> = {}): TextPart[] {
			// cmyk
			const cmykRegex = /<cmyk ([0-9.]+,[0-9.]+,[0-9.]+,[0-9.]+)>([\s\S]*?)<\/cmyk>/i;
			const uRegex = /<u>([\s\S]*?)<\/u>/i;
			const sRegex = /<s>([\s\S]*?)<\/s>/i;
			const iRegex = /<i>([\s\S]*?)<\/i>/i;
			let match: RegExpExecArray | null;
			let idx: number;
			// cmyk
			match = cmykRegex.exec(text);
			if (match) {
				idx = match.index;
				const before = text.slice(0, idx);
				const color = match[1].split(',').map(Number) as [number, number, number, number];
				const inside = match[2];
				const after = text.slice(idx + match[0].length);
				return [
					...parseRecursive(before, base),
					...parseRecursive(inside, { ...base, color }),
					...parseRecursive(after, base),
				];
			}
			// underline
			match = uRegex.exec(text);
			if (match) {
				idx = match.index;
				const before = text.slice(0, idx);
				const inside = match[1];
				const after = text.slice(idx + match[0].length);
				return [
					...parseRecursive(before, base),
					...parseRecursive(inside, { ...base, underline: true }),
					...parseRecursive(after, base),
				];
			}
			// strike
			match = sRegex.exec(text);
			if (match) {
				idx = match.index;
				const before = text.slice(0, idx);
				const inside = match[1];
				const after = text.slice(idx + match[0].length);
				return [
					...parseRecursive(before, base),
					...parseRecursive(inside, { ...base, strike: true }),
					...parseRecursive(after, base),
				];
			}
			// italic
			match = iRegex.exec(text);
			if (match) {
				idx = match.index;
				const before = text.slice(0, idx);
				const inside = match[1];
				const after = text.slice(idx + match[0].length);
				return [
					...parseRecursive(before, base),
					...parseRecursive(inside, { ...base, oblique: 10 }),
					...parseRecursive(after, base),
				];
			}
			// No more tags, return as a single part
			if (text.length === 0) return [];
			return [{ ...base, text }];
		}
		const parts = parseRecursive(line);
		// Set newLine: true for the first part if not the first line
		if (parts.length > 0 && !isFirstLine) {
			parts[0].newLine = true;
		}
		return parts;
	}

	const handleClick = async () => {
		setIsGenerating(true);
		try {
			const lines = textValue.split('\n');
			let textboxData: TextPart[] = [];
			for (let i = 0; i < lines.length; i++) {
				const parts = parseLineToTextParts(lines[i], i === 0);
				textboxData = textboxData.concat(parts);
			}
			const res = await generatePdfkit({
				options: {
					size: [500, 500],
					margin: 0,
				},
				contentCallback: async (doc) => {
					const fontBuffer = await fetch(
						'https://kindly-axolotl-103.convex.cloud/api/storage/634abc70-ac03-4162-b4c0-db1e99a045ee'
					).then((res) => res.arrayBuffer());
					const guardianFontBuffer = await fetch(
						'https://fonts.cdnfonts.com/s/6406/guardianp.woff'
					).then((res) => res.arrayBuffer());

					doc.registerFont('test-font', fontBuffer);
					doc.registerFont('Guardian-Pro', guardianFontBuffer);
					doc.rect(10, 10, 330, 200).stroke();

					textboxData.forEach((text) => {
						text.text = text.text.replace(/\[bullet\]/g, '•  ');
					});
					textBox(
						textboxData,
						doc,
						10,
						10,
						330,
						{
							font: 'test-font',
							lineHeight: 1.2,
						},
						200
					);
				},
			});
			if (res.success) {
				const url = res.data.getUrl();
				if (url) {
					const imgs = await pdfToImg(url.url, {
						imgType: 'png',
						quality: 100,
						scale: 4,
					});
					setImgs(imgs);
				}
			}
		} catch (error) {
			console.error(error);
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<>
			<div className='grid grid-rows-[auto_auto_1fr] py-8 gap-2 h-[calc(100vh-100px)] px-4'>
				<div className='flex flex-col gap-2'>
					<div className='flex gap-2 items-center'>
						<button
							onClick={handleBullet}
							className='bg-gray-500 text-white p-2 rounded-md w-fit'
							disabled={isGenerating}
						>
							Bullet
						</button>
						<button
							onClick={handleItalic}
							className='bg-gray-500 text-white p-2 rounded-md w-fit'
							disabled={isGenerating}
						>
							Italic
						</button>
						<button
							onClick={handleUnderline}
							className='bg-gray-500 text-white p-2 rounded-md w-fit'
							disabled={isGenerating}
						>
							Underline
						</button>
						<button
							onClick={handleStrike}
							className='bg-gray-500 text-white p-2 rounded-md w-fit'
							disabled={isGenerating}
						>
							Strike
						</button>
						<button
							onClick={handleColor}
							className='bg-gray-500 text-white p-2 rounded-md w-fit'
							disabled={isGenerating}
						>
							Color
						</button>
						<button
							onClick={handleClick}
							className='bg-blue-500 text-white p-2 rounded-md w-fit'
							disabled={isGenerating}
						>
							{isGenerating ? 'Generating...' : 'Generate PDF'}
						</button>
					</div>
					<textarea
						ref={textareaRef}
						className='w-full h-32 p-2 border rounded-md font-mono'
						value={textValue}
						onChange={(e) => setTextValue(e.target.value)}
						placeholder='Type your text here. Use the Bullet or Italic button.'
						disabled={isGenerating}
					/>
				</div>
				{imgs.length > 0 && (
					<div className='flex justify-center items-center gap-2 mt-2'>
						<button
							onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
							className='bg-blue-500 text-white p-2 rounded-md'
						>
							Prev
						</button>
						<span className='text-sm text-gray-500 rounded-sm'>
							{currentPage + 1} / {imgs.length}
						</span>
						<button
							onClick={() =>
								setCurrentPage((prev) => Math.min(prev + 1, imgs.length - 1))
							}
							className='bg-blue-500 text-white p-2 rounded-md'
						>
							Next
						</button>
					</div>
				)}
				<span className='w-full h-px bg-black/20 my-4' />
				<div className='w-full relative h-full flex justify-center items-center bg-black/80 p-2 overflow-y-auto'>
					{isGenerating && (
						<span className='absolute inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center'>
							<span className='text-white text-sm p-4 px-8 bg-black rounded-full'>
								Generating...
							</span>
						</span>
					)}
					{imgs.map(
						(img, index) =>
							index === currentPage && (
								<img
									key={index}
									src={img}
									style={{
										width: '100%',
										height: '100%',
										objectFit: 'contain',
									}}
									alt='img'
								/>
							)
					)}
				</div>
			</div>
		</>
	);
}
