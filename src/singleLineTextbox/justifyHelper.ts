/**
 * Calculate x positions for each text part to justify them across the given width.
 * @param {Array<{width: number}>} textsWithWidth - Array of text parts with measured widths.
 * @param {number} startX - The starting x position (usually posX).
 * @param {number} totalWidth - The total width to fill (the textbox width).
 * @returns {number[]} Array of x positions for each text part.
 */
export function getJustifiedXPositions(
	textsWithWidth: { width: number }[],
	startX: number,
	totalWidth: number
): number[] {
	const n = textsWithWidth.length;
	if (n === 0) return [];
	if (n === 1) return [startX];

	const totalTextWidth = textsWithWidth.reduce((sum, t) => sum + (t.width || 0), 0);
	const numGaps = n - 1;
	const extraSpace = (totalWidth - totalTextWidth) / numGaps;

	const positions: number[] = [];
	let x = startX;
	for (let i = 0; i < n; i++) {
		positions.push(x);
		x += textsWithWidth[i].width || 0;
		if (i < n - 1) {
			x += extraSpace;
		}
	}
	return positions;
}
