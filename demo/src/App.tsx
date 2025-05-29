import { pdfToImg } from 'pdftoimg-js/browser';
import { useState } from 'react';
import { addSingleLineTextbox, addTextbox, type TextPart } from 'textbox-for-pdfkit';
import { generatePdfkit } from './utils/pdfkit';

const testTextArray: TextPart[] = [
	// {
	// 	text: 'With sensational 180-degree coastline views, this tri-living residence flows to a choice of expansive alfresco decks creating an incredible setting to live and entertain. Secure custom engineered caravan parking with power post one of many key features.',
	// 	font: 'test-font',
	// 	fontSize: 12,
	// 	lineHeight: 1.2,
	// 	color: [0, 0, 0, 100],
	// 	align: 'left',
	// },
	{
		text: '[bullet] Some basic text here\n',
	},
	{
		text: '[bullet] Some basic text here\n',
		oblique: 10,
	},
	{
		text: '[bullet] Some basic text here that goes way to long for the line that it is set one\n',
	},
	{
		text: '[bullet] Some basic text here that goes way to long for the line that it is set one\n',
	},
	{
		text: '[bullet] Some basic text here that goes way to long for the line that it is set one\n',
	},
];

const testSingleLineTextbox: TextPart[] = [
	{
		text: 'This is some text. ',
		fontSize: 12,
		color: 'blue',
	},
	{
		text: 'This is some text. ',
		fontSize: 12,
		color: 'red',
	},
	{
		text: 'This is some text. ',
		fontSize: 12,
		color: 'red',
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
					const fontBuffer = await fetch(
						'https://kindly-axolotl-103.convex.cloud/api/storage/634abc70-ac03-4162-b4c0-db1e99a045ee'
					).then((res) => res.arrayBuffer());
					const guardianFontBuffer = await fetch(
						'https://fonts.cdnfonts.com/s/6406/guardianp.woff'
					).then((res) => res.arrayBuffer());

					doc.registerFont('test-font', fontBuffer);
					doc.registerFont('Guardian-Pro', guardianFontBuffer);
					doc.rect(10, 10, 330, 200).stroke();

					testTextArray.forEach((text) => {
						text.text = text.text.replace('[bullet]', '•  ');
					});
					addTextbox(
						testTextArray,
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

					addSingleLineTextbox(
						testSingleLineTextbox,
						doc,
						10,
						10 + 200,
						330,
						{
							font: 'test-font',
							lineHeight: 1.2,
							align: 'center',
						},
						false,
						(status) => {
							if (status.message === 'text is too long, did not render') {
								doc.rect(10, 10 + 200, 330, status.height).stroke('purple');
								doc.text('Text is too long, did not render', 10, 10 + 200);
							} else if (status.message === 'text is too long, rendered anyway') {
								doc.rect(10, 10 + 200, status.width, status.height).stroke('green');
							} else if (status.message === 'rendered') {
								doc
									// we have to subtract the width of the text from the x position to get the correct position when aligned right
									.rect(status.x, 10 + 200, status.width, status.height)
									.stroke('blue');
							}
						}
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

export default App;
