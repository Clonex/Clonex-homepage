import {createCanvas, getUrl} from "./helpers.js?2";

export default class CanvasOverlay {
    constructor(target, videoUrl, bgVideo)
    {
        this.animating = true;
        this.metrics = null;
        this.mousePos = null;
        this.animateI = 0;

        this.bg = createCanvas();
        this.temp = createCanvas();
        this.cursor = createCanvas();
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
            this.cursor.canvas.width = this.cursor.canvas.width;
            this.mousePos = null;
        });
        document.addEventListener("resize", () => { // TODO: fix me
            target.width = window.innerWidth;
            target.height = window.innerHeight;

            this.bg.canvas.width = window.innerWidth;
            this.bg.canvas.height = window.innerHeight;

            this.temp.canvas.width = window.innerWidth;
            this.temp.canvas.height = window.innerHeight;
        });

        this.background = bgVideo;//await createVideo(videoUrl);
        this.background.src = await getUrl(videoUrl);//this.background.src;
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
        const firstLineI = this.animateI > this.metrics.width/50 ? this.metrics.width/50 : this.animateI;
        this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2) + 12, 100 + (firstLineI * 50), 5);
        if(this.animateI >= 10)
        {
            const tempI = this.animateI >= 60 ? 60 : this.animateI - 10;
            this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent / 2) + 17, 100 + (tempI * 30), 100);
            this.temp.ctx.fillRect((this.temp.canvas.width / 2) - (this.metrics.width / 2), (this.temp.canvas.height / 2) - (this.metrics.actualBoundingBoxAscent) - 60, 100 + (tempI * 30), 20);
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
        this.drawCenterText("MICHAEL SAABYE SALLING");
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
        var cursor = this.cursor.ctx.getImageData(0, 0, this.target.canvas.width, this.target.canvas.height); 
        for(let i = 0; i < drawing.data.length; i += 4)
        {
            if(drawing.data[i] !== 0 || drawing.data[i + 1] !== 0 || drawing.data[i + 2] !== 0)
            {
                drawing.data[i] = 255 - vid[i];
                drawing.data[i + 1] = 200 - vid[i + 1];
                drawing.data[i + 2] = 100 - vid[i + 2];
                drawing.data[i + 3] = vid[i + 3];
            }
            if(cursor.data[i] !== 0 || cursor.data[i + 1] !== 0 || cursor.data[i + 2] !== 0)
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
        this.target.ctx.putImageData(drawing, 0, 0);
    }
}