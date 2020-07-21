import CanvasOverlay from "./CanvasOverlay.js";

const targetVid = `images/back2.mp4`;
const overlay = new CanvasOverlay(
            document.querySelector("canvas"), 
            targetVid, 
            document.querySelector("video"),
);