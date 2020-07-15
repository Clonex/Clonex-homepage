onmessage = function(e) {
    const drawing = e.data.drawing;
    const vid = e.data.vid;
    const cursor = e.data.cursor;
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
    
    postMessage({
        frame: drawing,
    });
};