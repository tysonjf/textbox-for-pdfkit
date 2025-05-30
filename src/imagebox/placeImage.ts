import { PDFDocument as AliasedPDFDocument, OpenedImage } from '../types';

type PDFDocument = AliasedPDFDocument & {
	openImage?: (imageBuffer: ArrayBuffer) => OpenedImage;
};

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

export function placeImage(
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
	const image = doc.openImage?.(imageBuffer);
	if (!image) {
		throw new Error('Image not found');
	}
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
	doc.image(image as any, x + fit.x, y + fit.y, {
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
