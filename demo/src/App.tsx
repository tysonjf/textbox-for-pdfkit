import { pdfToImg } from 'pdftoimg-js/browser';
import { useState } from 'react';
import { addTextbox, type TextPart } from 'textbox-for-pdfkit';
import { generatePdfkit } from './utils/pdfkit';

const testTextArray: TextPart[] = [
	{
		text: 'Hello World... ',
		color: [0, 100, 0, 0],
	},
	{
		text: 'Hello World.',
	},
];

function App() {
	const [imgs, setImgs] = useState<string[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [isGenerating, setIsGenerating] = useState(false);
	const handleClick = async () => {
		setIsGenerating(true);
		try {
			const res = await generatePdfkit({
				options: {
					size: [500, 500],
					margin: 0,
				},
				contentCallback: async (doc) => {
					const fontBufferRes = await fetch(
						'https://kindly-axolotl-103.convex.cloud/api/storage/634abc70-ac03-4162-b4c0-db1e99a045ee'
					);
					const fontBuffer = await fontBufferRes.arrayBuffer();
					doc.registerFont('test-font', fontBuffer);
					doc.rect(0, 0, 500, 500).stroke();
					addTextbox(
						testTextArray,
						doc,
						50,
						50,
						500,
						{
							font: 'test-font',
						},
						500
					);
					console.log('done');
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
			<div className='grid grid-rows-[auto_auto_1fr] py-8 gap-2 h-screen px-4'>
				<div className='flex justify-between items-center'>
					<button
						onClick={handleClick}
						className='bg-blue-500 text-white p-2 rounded-md w-fit'
						disabled={isGenerating}
					>
						{isGenerating ? 'Generating...' : 'Generate PDF'}
					</button>
					{imgs.length > 0 && (
						<div className='flex justify-center items-center gap-2'>
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
				</div>
				<span className='w-full h-px bg-black/20 my-4' />
				<div className='w-full relative h-full flex justify-center items-center bg-black/80 p-2 overflow-y-auto'>
					{isGenerating && (
						<span className='absolute inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center'>
							<span className='text-white text-sm p-2 bg-black rounded-full'>
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

export default App;
