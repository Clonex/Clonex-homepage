import CanvasOverlay from "./CanvasOverlay.js";

(function(){
    const targetVid = `images/back${Math.ceil(Math.random() * 2) + 1}.mp4`;
    const overlay = new CanvasOverlay(
                document.querySelector("canvas"), 
                targetVid, 
                document.querySelector("video"),
    );
    overlay.drawCenterText("MICHAEL SAABYE SALLING");

})();