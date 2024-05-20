import { CanvasOverlay } from './CanvasOverlay';

const canvasElement = document.querySelector('canvas');
const videoElement = document.querySelector('video');

if (!canvasElement || !videoElement) {
	throw new Error('DOM elements missing');
}

CanvasOverlay.initalize(canvasElement, 'images/back2.mp4', videoElement);
