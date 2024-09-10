/*
 * Returns a video element, with the source of @param url.
 */
export const createVideo = async (url: string) => {
	const data = await getUrl(url);

	const video = document.createElement('video');

	video.autoplay = true;
	video.loop = true;
	video.muted = true;
	video.playsInline = true;
	video.src = window.URL.createObjectURL(new Blob([data]));
	video.play();
	return video;
};

/*
 * Easings.
 */
export const easeIn = (x: number) => (x * x * x) / (x / 2);

/*
 * Gets the content of @param url, and returns a local blob URL.
 */
export const getUrl = async (url: string) => {
	const data = await fetch(url).then(d => d.blob()); // TODO: catch error
	return window.URL.createObjectURL(data);
};

/*
 * Returns a fresh canvas and context.
 */
export const createCanvas = () => {
	const canvas = document.createElement('canvas');
	const ctx = canvas.getContext('2d', { willReadFrequently: true });

	if (!ctx) {
		throw new Error('Couldnt find ctx for created canvas');
	}

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	return {
		canvas,
		ctx,
	};
};
