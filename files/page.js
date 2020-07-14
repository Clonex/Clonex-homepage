import CanvasOverlay from "./CanvasOverlay.js";

(function(){
    const targetVid = `images/back${Math.ceil(Math.random() * 3)}.mp4`;
    new CanvasOverlay(
                document.querySelector("canvas"), 
                targetVid, 
                document.querySelector("video"),
    );

})();