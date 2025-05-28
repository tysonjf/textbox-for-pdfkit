/**
 * A class that buffers chunks of data and provides methods to work with the resulting PDF blob.
 * Useful for handling PDF document streams and converting them to various formats.
 */
export class StreamBuffer {
	/** Array of blob parts that make up the PDF data */
	private chunks: BlobPart[] = [];
	/** The final PDF blob after all chunks are written */
	blob: Blob | null = null;

	/** Creates a new StreamBuffer instance */
	constructor() {
		this.chunks = [];
		this.blob = null;
	}

	/**
	 * Writes a chunk of data to the buffer
	 * @param chunk - The blob part to append to the buffer
	 */
	write(chunk: BlobPart): void {
		this.chunks.push(chunk);
	}

	/**
	 * Finalizes the buffer by creating a PDF blob from all written chunks
	 */
	end(): void {
		this.blob = new Blob(this.chunks, { type: 'application/pdf' });
	}

	/**
	 * Gets the PDF data as an ArrayBuffer
	 * @returns Promise resolving to ArrayBuffer of PDF data, or null if not finalized
	 */
	async getArrayBuffer(): Promise<ArrayBuffer | null> {
		if (!this.blob) {
			console.warn('StreamBuffer: Call end() before getArrayBuffer().');
			return null;
		}
		return await this.blob.arrayBuffer();
	}

	/**
	 * Gets the PDF data as a Blob
	 * @returns The PDF blob, or null if not finalized
	 */
	getBlob(): Blob | null {
		if (!this.blob) {
			console.warn('StreamBuffer: Call end() before getBlob().');
			return null;
		}
		return this.blob;
	}

	/**
	 * Creates an object URL for the PDF blob
	 * @returns Object containing the URL and a function to revoke it, or null if not finalized
	 */
	getUrl(): { url: string; revokeUrl: () => void } | null {
		if (!this.blob) {
			console.warn('StreamBuffer: Call end() before getUrl().');
			return null;
		}
		const url = URL.createObjectURL(this.blob);
		return {
			url,
			revokeUrl: () => URL.revokeObjectURL(url),
		};
	}

	/**
	 * Triggers a download of the PDF file
	 * @param fileName - Name of the downloaded file (default: 'output.pdf')
	 * @returns null if URL creation fails, void otherwise
	 */
	download(fileName = 'output.pdf'): null | void {
		const urlResult = this.getUrl();
		if (!urlResult) {
			console.warn('StreamBuffer: Call getUrl() before download().');
			return null;
		}
		const a = document.createElement('a');
		a.href = urlResult.url;
		a.download = fileName;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		urlResult.revokeUrl();
	}

	/**
	 * Clears all data from the buffer
	 */
	clear(): void {
		this.chunks = [];
		this.blob = null;
	}
}
