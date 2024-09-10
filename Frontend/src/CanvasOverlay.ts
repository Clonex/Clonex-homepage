import { createCanvas, getUrl, easeIn } from './utils';

export class CanvasOverlay {
	animating = true;
	metrics: TextMetrics | null = null;
	animateIndex = 0;
	boxesData: Uint8ClampedArray = new Uint8ClampedArray();

	backgroundVideo: HTMLVideoElement;

	bg: ReturnType<typeof createCanvas>;
	temp: ReturnType<typeof createCanvas>;
	target: ReturnType<typeof createCanvas>;

	mousePos: { x: number; y: number } | null = null;
	cursorImageData: Uint8ClampedArray | null = null;
	cursor: ReturnType<typeof createCanvas>;

	constructor(target: HTMLCanvasElement, videoUrl: string, bgVideo: HTMLVideoElement) {
		this.bg = createCanvas();
		this.temp = createCanvas();
		this.cursor = createCanvas();

		const ctx = target.getContext('2d', { desynchronized: true });
		if (!ctx) {
			throw new Error('Couldnt find ctx for target');
		}

		this.target = {
			canvas: target,
			ctx,
		};
		target.width = window.innerWidth;
		target.height = window.innerHeight;

		document.addEventListener('mousemove', e => this.mouseMoved(e));
		document.addEventListener('mouseleave', () => {
			this.cursorImageData = null;
		});

		document.addEventListener('resize', () => {
			this.target.canvas.width = window.innerWidth;
			this.target.canvas.height = window.innerHeight;

			this.bg.canvas.width = window.innerWidth;
			this.bg.canvas.height = window.innerHeight;

			this.temp.canvas.width = window.innerWidth;
			this.temp.canvas.height = window.innerHeight;
		});

		this.backgroundVideo = bgVideo;
		getUrl(videoUrl).then(url => (this.backgroundVideo.src = url));
		requestAnimationFrame(() => this.tick());
		document.querySelector('.loading')?.classList.add('fade-out');
	}

	/*
	 * Updates the mouse position.
	 */
	mouseMoved(e: MouseEvent) {
		this.mousePos = {
			x: e.pageX,
			y: e.pageY,
		};

		this.cursor.canvas.width = this.cursor.canvas.width;
		if (!this.cursor) {
			return;
		}

		this.cursor.ctx.beginPath();
		this.cursor.ctx.arc(this.mousePos.x, this.mousePos.y, 125, 0, Math.PI * 2, true);
		this.cursor.ctx.fillStyle = 'red';
		this.cursor.ctx.fill();
		this.cursorImageData = this.cursor.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height).data;
	}

	/*
	 * Draws @param text in the center of the canvas.
	 */
	drawCenterText(text: string) {
		this.temp.ctx.font =
			'bold 4vw "Helvetica Neue",-apple-system,BlinkMacSystemFont,Arial,Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans",sans-serif';
		this.temp.ctx.fillStyle = 'red';
		this.metrics = this.temp.ctx.measureText(text);

		this.temp.ctx.fillText(
			text,
			this.temp.canvas.width / 2 - this.metrics.width / 2,
			this.temp.canvas.height / 2 - this.metrics.actualBoundingBoxAscent / 2
		);
	}

	/*
	 * Animates the boxes.
	 */
	animateBoxes() {
		if (!this.metrics) {
			throw new Error('No metrics found');
		}

		const firstLineI = this.animateIndex > this.metrics.width / 45 ? this.metrics.width / 45 : this.animateIndex;
		this.temp.ctx.fillRect(
			this.temp.canvas.width / 2 - this.metrics.width / 2,
			this.temp.canvas.height / 2 - this.metrics.actualBoundingBoxAscent / 2 + 12,
			100 + easeIn(firstLineI),
			5
		); //(firstLineI * 50), 5);
		if (this.animateIndex >= 10) {
			const tempI = this.animateIndex >= 60 ? 60 : this.animateIndex - 10;
			this.temp.ctx.fillRect(
				this.temp.canvas.width / 2 - this.metrics.width / 2,
				this.temp.canvas.height / 2 - this.metrics.actualBoundingBoxAscent / 2 + 17,
				100 + easeIn(tempI),
				100
			);
			this.temp.ctx.fillRect(
				this.temp.canvas.width / 2 - this.metrics.width / 2,
				this.temp.canvas.height / 2 - this.metrics.actualBoundingBoxAscent - 60,
				100 + easeIn(tempI),
				20
			);
			if (this.animateIndex > 60) {
				this.animating = false;
			}
		}
		this.animateIndex++;
	}

	/*
	 * Redraws the canvases and updates the animations every frame.
	 */
	tick() {
		if (this.animating) {
			this.drawCenterText('MICHAEL SAABYE SALLING');
			this.animateBoxes();
		}
		this.draw();
		requestAnimationFrame(() => this.tick());
	}

	/*
	 * Draws the canvases, and converts the data to the target canvas.
	 */
	draw() {
		this.bg.ctx.drawImage(this.backgroundVideo, 0, 0, this.target.canvas.width, this.target.canvas.height); // Draw video
		const vid = this.bg.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height).data;

		if (this.animating) {
			this.boxesData = this.temp.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height).data; // What to overlay the video to
		}

		const outputData = new ImageData(
			new Uint8ClampedArray(this.boxesData),
			this.target.canvas.width,
			this.target.canvas.height
		);
		for (let i = 0; i < outputData.data.byteLength; i += 4) {
			if (outputData.data[i] !== 0 || outputData.data[i + 1] !== 0 || outputData.data[i + 2] !== 0) {
				outputData.data.set([255 - vid[i], 200 - vid[i + 1], 100 - vid[i + 2], vid[i + 3]], i);
			}

			if (
				this.cursorImageData &&
				(this.cursorImageData[i] !== 0 || this.cursorImageData[i + 1] !== 0 || this.cursorImageData[i + 2] !== 0)
			) {
				if (outputData.data[i] !== 0 || outputData.data[i + 1] !== 0 || outputData.data[i + 2] !== 0) {
					outputData.data.set([vid[i], vid[i + 1], vid[i + 2], vid[i + 3]], i);
				} else {
					outputData.data.set([255 - vid[i], 200 - vid[i + 1], 100 - vid[i + 2], vid[i + 3]], i);
				}
			}
		}

		this.target.ctx.putImageData(outputData, 0, 0);
	}

	static initalize(target: HTMLCanvasElement, videoUrl: string, bgVideo: HTMLVideoElement) {
		return new CanvasOverlay(target, videoUrl, bgVideo);
	}
}
