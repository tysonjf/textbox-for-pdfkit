import PDFDocument from 'pdfkit/js/pdfkit.standalone';
import { pdfToImg } from 'pdftoimg-js/browser';
import { useState } from 'react';
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
					placeImage(doc, imageBuffer, {
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
		<div className='grid grid-rows-[auto_1fr] h-[calc(100vh-100px)]'>
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
	);
}

type ClipShape =
	| { type: 'none' }
	| { type: 'rect'; radius?: number }
	| { type: 'circle' }
	| { type: 'ellipse'; rx: number; ry: number }
	| { type: 'polygon'; points: [number, number][] };

interface PlaceImageOptions {
	x: number;
	y: number;
	width: number;
	height: number;
	clip?: ClipShape;
	stroke?: {
		width?: number;
		color?: PDFKit.Mixins.ColorValue;
		opacity?: number;
		lineCap?: 'butt' | 'round' | 'square';
		lineJoin?: 'miter' | 'round' | 'bevel';
		dash?: number;
		dashSpace?: number;
		dashPhase?: number;
		align?: 'center' | 'inside' | 'outside';
	};
	fill?: {
		color?: PDFKit.Mixins.ColorValue;
		opacity?: number;
	};
	image?: {
		opacity?: number;
		objectFit?: 'contain' | 'cover' | 'fill' | 'none';
		offsetXInPercentage?: number;
		offsetYInPercentage?: number;
		scale?: number;
	};
}

function placeImage(
	doc: PDFDocument,
	imageBuffer: ArrayBuffer,
	options: PlaceImageOptions
) {
	const {
		x,
		y,
		width,
		height,
		clip = { type: 'none' },
		stroke,
		fill,
		image: imageOpts,
	} = options;
	const image = doc.openImage(imageBuffer);
	const imageWidth = image.width;
	const imageHeight = image.height;

	// Calculate objectFit placement
	let fit = { width, height, x: 0, y: 0 };
	if (imageOpts) {
		fit = imageObjectFit(
			width,
			height,
			imageWidth,
			imageHeight,
			imageOpts.offsetXInPercentage ?? 0,
			imageOpts.offsetYInPercentage ?? 0,
			imageOpts.scale ?? 1,
			imageOpts.objectFit ?? 'cover'
		);
	}

	function drawShapePath(doc: PDFDocument, offset = 0) {
		switch (clip.type) {
			case 'rect': {
				if (clip.radius) {
					doc.roundedRect(
						x + offset,
						y + offset,
						width - 2 * offset,
						height - 2 * offset,
						clip.radius - offset > 0 ? clip.radius - offset : 0
					);
				} else {
					doc.rect(x + offset, y + offset, width - 2 * offset, height - 2 * offset);
				}
				break;
			}
			case 'circle': {
				const baseRadius = Math.min(width, height) / 2;
				const radius = baseRadius + offset;
				doc.circle(x + width / 2, y + height / 2, radius);
				break;
			}
			case 'ellipse': {
				const baseRx = clip.rx;
				const baseRy = clip.ry;
				const rx = baseRx + offset;
				const ry = baseRy + offset;
				doc.ellipse(x + width / 2, y + height / 2, rx, ry);
				break;
			}
			case 'polygon': {
				const offsetPoints = clip.points.map(([px, py]) => [x + px, y + py]);
				doc.polygon(...offsetPoints);
				break;
			}
		}
	}

	// 1. Save state and apply clipping path
	doc.save();
	if (clip.type !== 'none') {
		drawShapePath(doc);
		doc.clip();
	}

	// 2. Draw the image (clipped)
	if (imageOpts && typeof imageOpts.opacity === 'number') doc.opacity(imageOpts.opacity);
	doc.image(image, x + fit.x, y + fit.y, {
		width: fit.width,
		height: fit.height,
	});
	if (imageOpts && typeof imageOpts.opacity === 'number') doc.opacity(1); // reset

	// 3. Restore state to remove clipping
	doc.restore();

	// 4. Draw fill shape on top (if any)
	if (fill && fill.color) {
		doc.save();
		drawShapePath(doc);
		doc.fillColor(fill.color, fill.opacity);
		if (typeof fill.opacity === 'number') doc.fillOpacity(fill.opacity);
		doc.fill();
		if (typeof fill.opacity === 'number') doc.fillOpacity(1); // reset
		doc.restore();
	}

	// 5. Draw stroke shape on top (if any)
	if (stroke) {
		doc.save();
		let offset = 0;
		const strokeWidth = stroke.width || 1;
		if (stroke.align === 'inside') offset = strokeWidth / 2;
		else if (stroke.align === 'outside') offset = -strokeWidth / 2;
		drawShapePath(doc, offset);
		if (stroke.lineCap) doc.lineCap(stroke.lineCap);
		if (stroke.lineJoin) doc.lineJoin(stroke.lineJoin);
		if (typeof stroke.dash === 'number') {
			doc.dash(stroke.dash, {
				space: stroke.dashSpace,
				phase: stroke.dashPhase,
			});
		}
		if (stroke.color) doc.strokeColor(stroke.color, stroke.opacity);
		if (stroke.width) doc.lineWidth(stroke.width);
		if (typeof stroke.opacity === 'number') doc.strokeOpacity(stroke.opacity);
		doc.stroke();
		if (typeof stroke.opacity === 'number') doc.strokeOpacity(1); // reset
		doc.restore();
	}
}

function imageObjectFit(
	containerWidth: number,
	containerHeight: number,
	imageWidth: number,
	imageHeight: number,
	offsetXInPercentage: number = 0,
	offsetYInPercentage: number = 0,
	scale: number = 1,
	objectFit: 'contain' | 'cover' | 'fill' | 'none' = 'cover'
) {
	let drawWidth = containerWidth;
	let drawHeight = containerHeight;
	let dx = 0;
	let dy = 0;

	if (objectFit === 'contain') {
		const ratio =
			Math.min(containerWidth / imageWidth, containerHeight / imageHeight) * scale;
		drawWidth = imageWidth * ratio;
		drawHeight = imageHeight * ratio;
		dx = (containerWidth - drawWidth) / 2;
		dy = (containerHeight - drawHeight) / 2;
	} else if (objectFit === 'cover') {
		const ratio =
			Math.max(containerWidth / imageWidth, containerHeight / imageHeight) * scale;
		drawWidth = imageWidth * ratio;
		drawHeight = imageHeight * ratio;
		const overflowX = drawWidth - containerWidth;
		const overflowY = drawHeight - containerHeight;
		dx = -overflowX / 2;
		dy = -overflowY / 2;
	} else if (objectFit === 'fill') {
		drawWidth = containerWidth * scale;
		drawHeight = containerHeight * scale;
		dx = (containerWidth - drawWidth) / 2;
		dy = (containerHeight - drawHeight) / 2;
	} else if (objectFit === 'none') {
		drawWidth = imageWidth * scale;
		drawHeight = imageHeight * scale;
		dx = (containerWidth - drawWidth) / 2;
		dy = (containerHeight - drawHeight) / 2;
	}

	// CSS-like transform: always move by percentage of drawn image size
	dx += (offsetXInPercentage / 100) * drawWidth;
	dy += (offsetYInPercentage / 100) * drawHeight;

	return {
		width: drawWidth,
		height: drawHeight,
		x: dx,
		y: dy,
	};
}
