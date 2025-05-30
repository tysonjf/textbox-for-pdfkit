import { pdfToImg } from 'pdftoimg-js/browser';
import { useState } from 'react';
import { addSingleLineTextbox } from 'textbox-for-pdfkit';
import { generatePdfkit } from './utils/pdfkit';

const DEFAULT_PART = {
	text: '',
	color: '#1976d2',
	fontSize: 20,
	underline: false,
	strike: false,
};

const ALIGNMENTS = ['left', 'center', 'right', 'justify'] as const;

type Alignment = (typeof ALIGNMENTS)[number];

type TextPartInput = {
	text: string;
	color: string;
	fontSize: number;
	underline: boolean;
	strike: boolean;
};

export function Oneline() {
	const [img, setImg] = useState<string | null>(null);
	const [statusMsg, setStatusMsg] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [useCustomFont, setUseCustomFont] = useState(true);
	const [parts, setParts] = useState<TextPartInput[]>([
		{ ...DEFAULT_PART, text: 'Single line textbox!' },
	]);
	const [alignment, setAlignment] = useState<Alignment>('center');

	const handlePartChange = (
		idx: number,
		field: keyof TextPartInput,
		value: string | number | boolean
	) => {
		setParts((prev) =>
			prev.map((part, i) => (i === idx ? { ...part, [field]: value } : part))
		);
	};

	const handleAddPart = () => {
		setParts((prev) => [...prev, { ...DEFAULT_PART }]);
	};

	const handleRemovePart = (idx: number) => {
		setParts((prev) => prev.filter((_, i) => i !== idx));
	};

	const handleGenerate = async () => {
		setIsGenerating(true);
		setStatusMsg(null);
		setImg(null);
		try {
			const res = await generatePdfkit({
				options: {
					size: [400, 120],
					margin: 0,
				},
				contentCallback: async (doc) => {
					if (useCustomFont) {
						// Register a custom font (optional)
						const guardianFontBuffer = await fetch(
							'https://fonts.cdnfonts.com/s/6406/guardianp.woff'
						).then((res) => res.arrayBuffer());
						doc.registerFont('Guardian-Pro', guardianFontBuffer);
					}

					// Draw a border for visual clarity
					doc.rect(20, 40, 360, 40).stroke('#888');

					addSingleLineTextbox(
						parts,
						doc,
						30, // x
						50, // y
						340, // width
						{
							align: alignment,
							font: useCustomFont ? 'Guardian-Pro' : 'Helvetica',
							fontSize: 20,
						},
						false,
						(status) => setStatusMsg(status.message)
					);
				},
			});
			if (res.success) {
				const url = res.data.getUrl();
				if (url) {
					const imgs = await pdfToImg(url.url, {
						imgType: 'png',
						quality: 100,
						scale: 2,
					});
					setImg(imgs[0]);
				}
			}
		} catch (e) {
			setStatusMsg('Error generating PDF');
		} finally {
			setIsGenerating(false);
		}
	};

	return (
		<div className='flex flex-col items-center gap-6 py-8'>
			<div className='w-full max-w-2xl flex flex-col gap-4'>
				<div className='flex flex-col gap-2'>
					<div className='font-semibold mb-1'>Text Parts:</div>
					{parts.map((part, idx) => (
						<div
							key={idx}
							className='flex items-center gap-2 border p-2 rounded bg-white'
						>
							<input
								type='text'
								value={part.text}
								onChange={(e) => handlePartChange(idx, 'text', e.target.value)}
								placeholder={`Text part #${idx + 1}`}
								className='border rounded p-1 w-48'
							/>
							<label className='flex items-center gap-1'>
								Color:
								<input
									type='color'
									value={part.color}
									onChange={(e) => handlePartChange(idx, 'color', e.target.value)}
									className='w-6 h-6 p-0 border-none bg-transparent'
								/>
							</label>
							<label className='flex items-center gap-1'>
								Size:
								<input
									type='number'
									min={6}
									max={72}
									value={part.fontSize}
									onChange={(e) =>
										handlePartChange(idx, 'fontSize', Number(e.target.value))
									}
									className='border rounded p-1 w-16'
								/>
							</label>
							<label className='flex items-center gap-1'>
								<input
									type='checkbox'
									checked={part.underline}
									onChange={(e) => handlePartChange(idx, 'underline', e.target.checked)}
								/>
								Underline
							</label>
							<label className='flex items-center gap-1'>
								<input
									type='checkbox'
									checked={part.strike}
									onChange={(e) => handlePartChange(idx, 'strike', e.target.checked)}
								/>
								Strike
							</label>
							<button
								onClick={() => handleRemovePart(idx)}
								className='ml-2 text-red-500 hover:underline'
								disabled={parts.length === 1}
								title='Remove part'
							>
								✕
							</button>
						</div>
					))}
					<button
						onClick={handleAddPart}
						className='bg-green-500 text-white px-3 py-1 rounded w-fit mt-1'
						type='button'
					>
						+ Add Part
					</button>
				</div>
				<div className='flex items-center gap-4 mt-2'>
					<span className='font-semibold'>Alignment:</span>
					{ALIGNMENTS.map((al) => (
						<label key={al} className='flex items-center gap-1'>
							<input
								type='radio'
								name='alignment'
								value={al}
								checked={alignment === al}
								onChange={() => setAlignment(al)}
							/>
							{al.charAt(0).toUpperCase() + al.slice(1)}
						</label>
					))}
				</div>
				<div className='flex items-center gap-2 mt-2'>
					<span className='font-semibold'>Font:</span>
					<label className='flex items-center gap-1'>
						<input
							type='checkbox'
							checked={useCustomFont}
							onChange={(e) => setUseCustomFont(e.target.checked)}
						/>
						Use Custom Font (Guardian Pro)
					</label>
				</div>
				<button
					onClick={handleGenerate}
					className='bg-blue-600 text-white px-4 py-2 rounded shadow mt-2'
					disabled={isGenerating}
				>
					{isGenerating ? 'Generating...' : 'Generate Single Line PDF'}
				</button>
				{statusMsg && <div className='text-sm text-gray-700'>Status: {statusMsg}</div>}
				<div className='w-full flex justify-center items-center min-h-[120px] bg-gray-50 border rounded'>
					{img ? (
						<img src={img} alt='PDF preview' style={{ maxWidth: 380, maxHeight: 100 }} />
					) : (
						<span className='text-gray-400'>No PDF generated yet.</span>
					)}
				</div>
			</div>
		</div>
	);
}
