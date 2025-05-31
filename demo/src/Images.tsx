// import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import { pdfToImg } from 'pdftoimg-js/browser';
import { useState } from 'react';
import { imageBox } from 'textbox-for-pdfkit';
import { generatePdfkit } from './utils/pdfkit';

const imgUrl =
	'https://kindly-axolotl-103.convex.cloud/api/storage/54793023-c8fb-4c62-9a45-221360e6b19b';

export function Images() {
	const [imgs, setImgs] = useState<string[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [currentPage] = useState(0);
	const handleClick = async () => {
		setIsGenerating(true);
		try {
			const image = await fetch(imgUrl);
			const imageBuffer = await image.arrayBuffer();
			const res = await generatePdfkit({
				options: {
					size: [1920, 2800],
					margin: 0,
				},
				contentCallback: async (doc) => {
					doc.fontSize(60).text('PDFKit Vector Demo', 0, 40, {
						width: 1920,
						align: 'center',
					});

					const originalImage = doc.openImage(imageBuffer);

					doc.image(originalImage, 1920 / 2 - 350 / 2, 1500, {
						width: 600,
						height: 300,
						objectFit: 'contain',
					});
					doc.fontSize(40).text('Original Image', 1920 / 2 - 350 / 2, 1500 + 350 + 40, {
						width: 350,
						align: 'center',
					});

					// 1. Simple circle clip, red stroke
					imageBox(doc, imageBuffer, {
						x: 100,
						y: 150,
						width: 300,
						height: 300,
						clip: { type: 'circle' },
						stroke: {
							color: 'red',
							width: 10,
						},
					});

					// 2. Rectangle with rounded corners, blue dashed stroke
					imageBox(doc, imageBuffer, {
						x: 500,
						y: 150,
						width: 300,
						height: 300,
						clip: { type: 'rect', radius: 40 },
						stroke: {
							color: 'blue',
							width: 8,
							dash: 20,
							dashSpace: 10,
							lineCap: 'round',
							align: 'inside',
						},
					});

					// 3. Ellipse, green fill, thick stroke cmyk color
					imageBox(doc, imageBuffer, {
						x: 900,
						y: 150,
						width: 350,
						height: 250,
						clip: { type: 'ellipse', rx: 175, ry: 125 },
						fill: {
							color: 'green',
							opacity: 0.5,
						},
						stroke: {
							color: [0, 100, 0, 50],
							width: 15,
							lineJoin: 'bevel',
							opacity: 0.5,
							align: 'inside',
						},
					});

					// 4. Polygon (triangle), purple fill, orange dashed stroke
					imageBox(doc, imageBuffer, {
						x: 1350,
						y: 150,
						width: 300,
						height: 300,
						clip: {
							type: 'polygon',
							points: [
								[150, 0],
								[0, 300],
								[300, 300],
							],
						},
						fill: {
							color: 'purple',
							opacity: 0.5,
						},
						stroke: {
							color: 'orange',
							width: 12,
							dash: 10,
							dashSpace: 10,
							lineJoin: 'miter',
						},
					});

					// 5. Rectangle, semi-transparent black fill, no stroke
					imageBox(doc, imageBuffer, {
						x: 1750,
						y: 150,
						width: 120,
						height: 300,
						clip: { type: 'rect' },
						fill: {
							color: 'black',
							opacity: 0.3,
						},
					});

					// Add some labels
					doc.fontSize(32).fillColor('black').opacity(1);
					doc.text('Circle', 100, 470, { width: 300, align: 'center' });
					doc.text('Rounded Rect', 500, 470, { width: 300, align: 'center' });
					doc.text('Ellipse', 900, 420, { width: 350, align: 'center' });
					doc.text('Polygon', 1350, 470, { width: 300, align: 'center' });
					doc.text('Rect Fill', 1750, 470, { width: 120, align: 'center' });

					// 6. ObjectFit: contain, centered
					imageBox(doc, imageBuffer, {
						x: 100,
						y: 600,
						width: 300,
						height: 300,
						clip: { type: 'rect', radius: 30 },
						image: { objectFit: 'contain', offsetXInPercentage: 25 },
						stroke: { color: 'teal', width: 6 },
					});
					doc.text('Contain', 100, 920, { width: 300, align: 'center' });

					// 7. ObjectFit: cover, offset right 50%
					imageBox(doc, imageBuffer, {
						x: 500,
						y: 600,
						width: 300,
						height: 300,
						clip: { type: 'rect', radius: 30 },
						image: { objectFit: 'cover', offsetXInPercentage: 25 },
						stroke: { color: 'magenta', width: 6, opacity: 0.5 },
					});
					doc.text('Cover +50% X', 500, 920, { width: 300, align: 'center' });

					// 8. ObjectFit: fill, scale 0.7, offsetYInPercentage: 25
					imageBox(doc, imageBuffer, {
						x: 900,
						y: 600,
						width: 300,
						height: 300,
						clip: { type: 'rect', radius: 30 },
						image: { objectFit: 'fill', scale: 0.7, offsetYInPercentage: 25 },
						stroke: { color: 'orange', width: 6 },
						fill: { color: 'orange', opacity: 0.5 },
					});
					doc.text('Fill, scale 0.7, offsetYInPercentage: 25', 900, 920, {
						width: 300,
						align: 'center',
					});

					// 9. ObjectFit: none (native size, offset -50% X, 50% Y)
					imageBox(doc, imageBuffer, {
						x: 1350,
						y: 600,
						width: 300,
						height: 300,
						clip: { type: 'rect', radius: 30 },
						image: {
							objectFit: 'none',
							offsetXInPercentage: -50,
							offsetYInPercentage: 50,
						},
						stroke: { color: 'green', width: 6 },
					});
					doc.text('None, -50% X, 50% Y', 1350, 920, { width: 300, align: 'center' });
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
		<div className='grid grid-rows-[auto_1fr] h-[calc(100vh-100px)] gap-2 mt-2'>
			<button
				className='bg-blue-500 text-white p-2 rounded-md w-fit'
				onClick={handleClick}
				disabled={isGenerating}
			>
				{isGenerating ? 'Generating...' : 'Generate PDF'}
			</button>
			<div className='w-full relative h-full flex justify-center items-center bg-black/80 p-2 overflow-y-auto'>
				{isGenerating && (
					<span className='absolute inset-0 bg-black/10 backdrop-blur-sm flex justify-center items-center'>
						<span className='text-white text-sm p-4 px-8 bg-black rounded-full'>
							Generating... don't worry, it takes a long time.
							<br />
							The site will freeze for a while, we are generating 10 images.
							<br />
							You can close the tab and come back later.
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
	);
}
