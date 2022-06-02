$(document).ready(function(){
    const drawSocket = new WebSocket(
        "ws://"
        + window.location.host
        + "/ws/draw/"
        + room_id
        + "/"
        + username
        + "/"
    );

    const canvas = $('#canvas');
    // canvas[0].height = $('#canvas-container')[0].height;
    // canvas[0].width = $('#canvas-container')[0].width;
    const ctx = canvas[0].getContext("2d");

    let painting = false;

    let lineWidth = 2;
    let lineColor = 'black';

    $('#draw-btn').click((event) => {
        event.preventDefault();
        lineWidth = 2;
        lineColor = "black";

    });

    $('#erase-btn').click((event) => {
        event.preventDefault();
        lineWidth = 16;
        lineColor = "white";
    });

    function startPosition(){
        painting = true;
    };

    function endPosition(){
        painting = false;
        data_to_send['painting'] = false;
        drawSocket.send(JSON.stringify(data_to_send));
        ctx.beginPath();
    };

    drawSocket.onmessage = function(e) {
        var data = JSON.parse(e.data);
        console.log(data);
        console.log(data);
        let currX = data.currX;
        let currY = data.currY;
        if(!data.painting){
            ctx.beginPath();
        }else{
            ctx.lineWidth = data.lineWidth;
            ctx.strokeStyle = data.lineColor;
            ctx.lineCap = 'round';

            
            ctx.lineTo(currX, currY);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(currX, currY);
        }
        
    };

    drawSocket.onclose = function(e) {
        console.error('Draw socket closed unexpectedly');
        console.log(e);
    };

    let data_to_send = {
        'lineWidth': 0,
        'lineColor': '',
        'currX': 0,
        'currY': 0,
        'painting': false
    }

    function draw(e){
        e.preventDefault();
        if(!painting) return;
        ctx.lineWidth = lineWidth;
        data_to_send['lineWidth'] = lineWidth;
        ctx.strokeStyle = lineColor;
        data_to_send['lineColor'] = lineColor
        ctx.lineCap = 'round';
        data_to_send['painting'] = true;

        let r = canvas[0].getBoundingClientRect();
        currX = e.clientX - r.left;
        data_to_send['currX'] = currX;
        currY = e.clientY - r.top;
        data_to_send['currY'] = currY;
        ctx.lineTo(currX, currY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(currX, currY);
        drawSocket.send(JSON.stringify(data_to_send));
    }

    canvas.mousedown(startPosition);
    canvas.mouseup(endPosition);
    canvas.mousemove(draw);
});