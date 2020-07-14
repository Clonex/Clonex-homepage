import {createCanvas, createVideo} from "./helpers.js";

export default class CanvasOverlay {
    animating = true;
    metrics = null;
    mousePos = null;
    constructor(target, videoUrl, bgVideo)
    {
        this.bg = createCanvas();
        this.temp = createCanvas();
        this.target = {
            canvas: target,
            ctx: target.getContext("2d")
        };
        target.width = window.innerWidth;
        target.height = window.innerHeight;
        this.setup(videoUrl, bgVideo);
        document.addEventListener("mousemove", (e) => this.mouseMoved(e));
    }

    /*
     * Loads the given @param videoUrl and sets the video elements source.
     */
    async setup(videoUrl, bgVideo)
    {
        this.background = await createVideo(videoUrl);
        bgVideo.src = this.background.src;
        requestAnimationFrame(() => this.tick());
    }

    /*
     * Updates the mouse position.
     */
    mouseMoved(e)
    {  
        this.mousePos = {
            x: e.pageX,
            y: e.pageY,
        };
    }


    /*
     * Draws @param text in the center of the canvas.
     */
    drawCenterText(text)
    {
        this.temp.ctx.font = 'bold 54px "Helvetica Neue",-apple-system,BlinkMacSystemFont,Arial,Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans",sans-serif';
        this.temp.ctx.fillStyle = "red";
        this.metrics = this.temp.ctx.measureText(text);

        this.temp.ctx.fillText(text, (this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2));
    }

    animateI = 0;
    /*
     * Animates the boxes.
     */
    animateBoxes()
    {
        const firstLineI = this.animateI > this.metrics.width/50 ? this.metrics.width/50 : this.animateI;
        this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2) + 12, 100 + (firstLineI * 50), 5);
        if(this.animateI >= 50)
        {
            const tempI = this.animateI >= 100 ? 100 : this.animateI - 50;
            this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2) + 18, 100 + (tempI * 30), 100);
            this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent) - 60, 100 + (tempI * 30), 20);
            if(this.animateI > 100)
            {
                this.animating = false;
            }
        }
        this.animateI++;
    }
    

    /*
     * Runs every iteration.
     */
    async tick(){
        if(this.animating)
        {
            this.animateBoxes();
        }
        this.draw();
        requestAnimationFrame(() => this.tick());
    }

    /*
     * Draws the canvases, and converts the data to the target canvas.
     */
    draw(){
        this.bg.ctx.drawImage(this.background, 0, 0, this.target.canvas.width, this.target.canvas.height); // Draw video
        var vid = this.bg.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height).data;

        var drawing = this.temp.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height); // What to overlay the video to
        for(let i = 0; i < drawing.data.length; i += 4)
        {
            if(drawing.data[i] !== 0 || drawing.data[i + 1] !== 0 || drawing.data[i + 2] !== 0)
            {
                drawing.data[i] = 255 - vid[i];
                drawing.data[i + 1] = 200 - vid[i + 1];
                drawing.data[i + 2] = 100 - vid[i + 2];
                drawing.data[i + 3] = vid[i + 3];
            }
            
            if(this.mousePos)
            {
                var x = (i / 4) % this.target.canvas.width;
                var y = ((i / 4) / this.target.canvas.width);
                if(Math.abs(x - this.mousePos.x) <= 85 && Math.abs(y - this.mousePos.y) <= 85)
                {
                        const check = Math.sqrt(Math.pow(x - this.mousePos.x, 2) + Math.pow(y - this.mousePos.y, 2)) < 85;
                        if(check)
                        {
                            if(drawing.data[i] !== 0 || drawing.data[i + 1] !== 0 || drawing.data[i + 2] !== 0)
                            {
                            drawing.data[i] = vid[i];
                            drawing.data[i + 1] = vid[i + 1];
                            drawing.data[i + 2] = vid[i + 2];
                            drawing.data[i + 3] = vid[i + 3];
                        }else{
                            drawing.data[i] = 255 - vid[i];
                            drawing.data[i + 1] = 200 - vid[i + 1];
                            drawing.data[i + 2] = 100 - vid[i + 2];
                            drawing.data[i + 3] = vid[i + 3];
                            
                        }
                    }
                }
            }
        }
        this.target.ctx.putImageData(drawing, 0, 0);
    }
}