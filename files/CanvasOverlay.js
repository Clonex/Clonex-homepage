import {createCanvas, getUrl, easeIn} from "./helpers.js?2";

export default class CanvasOverlay {
    
    constructor(target, videoUrl, bgVideo)
    {
        this.animating = true;
        this.metrics = null;
        this.mousePos = null;
        this.animateI = 0;
        this.boxesData = null;
        
        this.bg = createCanvas();
        this.temp = createCanvas();
        this.cursor = createCanvas();
        this.cursorImageData = null;
        this.target = {
            canvas: target,
            ctx: target.getContext("2d")
        };
        target.width = window.innerWidth;
        target.height = window.innerHeight;
        this.setup(videoUrl, bgVideo);
    }

    /*
     * Loads the given @param videoUrl and sets the video elements source.
     */
    async setup(videoUrl, bgVideo)
    {
        document.addEventListener("mousemove", (e) => this.mouseMoved(e));
        document.addEventListener("mouseleave", (e) => {
            this.cursorImageData = null;
        });

        document.addEventListener("resize", () => { // TODO: fix me
            this.target.width = window.innerWidth;
            this.target.height = window.innerHeight;

            this.bg.canvas.width = window.innerWidth;
            this.bg.canvas.height = window.innerHeight;

            this.temp.canvas.width = window.innerWidth;
            this.temp.canvas.height = window.innerHeight;
        });

        this.background = bgVideo;
        this.background.src = await getUrl(videoUrl);
        requestAnimationFrame(() => this.tick());
        document.querySelector(".loading").classList.add("fade-out");
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

        this.cursor.canvas.width = this.cursor.canvas.width;
        this.cursor.ctx.beginPath();
        this.cursor.ctx.arc(this.mousePos.x, this.mousePos.y, 125, 0, Math.PI * 2, true);
        this.cursor.ctx.fillStyle = "red";
        this.cursor.ctx.fill();
        this.cursorImageData = this.cursor.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height).data;
    }

    /*
     * Draws @param text in the center of the canvas.
     */
    drawCenterText(text)
    {
        this.temp.ctx.font = 'bold 4vw "Helvetica Neue",-apple-system,BlinkMacSystemFont,Arial,Roboto,Oxygen,Ubuntu,Cantarell,"Open Sans",sans-serif';
        this.temp.ctx.fillStyle = "red";
        this.metrics = this.temp.ctx.measureText(text);

        this.temp.ctx.fillText(text, (this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2));
    }

    
    /*
     * Animates the boxes.
     */
    animateBoxes()
    {
        const firstLineI = this.animateI > this.metrics.width / 45 ? this.metrics.width / 45 : this.animateI;
        this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2) + 12, 100 + easeIn(firstLineI), 5);//(firstLineI * 50), 5);
        if(this.animateI >= 10)
        {
            const tempI = this.animateI >= 60 ? 60 : this.animateI - 10;
            this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2) + 17, 100 + easeIn(tempI), 100);
            this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent) - 60, 100 + easeIn(tempI), 20);
            if(this.animateI > 60)
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
            this.drawCenterText("MICHAEL SAABYE SALLING");
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
        let vid = this.bg.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height).data;

        if(this.animating)
        {
            this.boxesData = this.temp.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height).data; // What to overlay the video to
        }

        let drawing = new Uint8ClampedArray(this.boxesData);
        for(let i = 0; i < drawing.byteLength; i += 4)
        {
            if(drawing[i] !== 0 || drawing[i + 1] !== 0 || drawing[i + 2] !== 0)
            {
                drawing[i] = 255 - vid[i];
                drawing[i + 1] = 200 - vid[i + 1];
                drawing[i + 2] = 100 - vid[i + 2];
                drawing[i + 3] = vid[i + 3];
            }

            if(this.cursorImageData && (this.cursorImageData[i] !== 0 || this.cursorImageData[i + 1] !== 0 || this.cursorImageData[i + 2] !== 0))
            {
                if(drawing[i] !== 0 || drawing[i + 1] !== 0 || drawing[i + 2] !== 0)
                {
                    drawing[i] = vid[i];
                    drawing[i + 1] = vid[i + 1];
                    drawing[i + 2] = vid[i + 2];
                    drawing[i + 3] = vid[i + 3];
                }else{
                    drawing[i] = 255 - vid[i];
                    drawing[i + 1] = 200 - vid[i + 1];
                    drawing[i + 2] = 100 - vid[i + 2];
                    drawing[i + 3] = vid[i + 3];
                }
            }
        }

        var image = new ImageData(drawing, this.target.canvas.width, this.target.canvas.height);
        this.target.ctx.putImageData(image, 0, 0);
    }
}