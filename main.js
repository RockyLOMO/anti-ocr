function $(id) {
    return document.getElementById(id);
}
function textToImg() {
    var len = parseInt($('len').value) || 30;
    var i = 0;
    var fontSize = parseInt($('fontSize').value) || 15;
    var lineSize = parseFloat($('lineSize').value) || 1;
    var pointSize = parseFloat($('pointSize').value) || 1;
    var points = parseFloat($('points').value) || 1;
    var fontWeight = $('fontWeight').value || 'normal';
    var txt = $("txt").value;
    var canvas = $('canvas');
    if (txt == '') {
        alert('請輸入文字');
        $("txt").focus();
    }
    if (len > txt.length) {
        len = txt.length;
    }
    canvas.width = fontSize * len + 20;
    canvas.height = fontSize * (3 / 2) * (Math.ceil(txt.length / len)) + txt.split("\n").length * fontSize;
    var context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = $("backcolor").innerHTML;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = $("fontcolor").innerHTML;
    context.strokeStyle = $("fontcolor").innerHTML;

    var fgColor = $("fontcolor").innerHTML;
    var bgColor = $("backcolor").innerHTML;

    var n = txt.length / 4; // reduced from 1/2 to 1/4
    var n2 = txt.length * fontSize * points;
    
    function drawNoise(dots, lines, color, isSlice) {
        context.strokeStyle = color;
        context.fillStyle = color;
        for (var k = 0; k < dots; k++) {
            var x = random(0, canvas.width);
            var y = random(0, canvas.height);
            context.lineWidth = pointSize;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + 1, y + 1);
            context.closePath();
            context.stroke();
        }
        for (var k = 0; k < lines; k++) {
            var x = random(0, canvas.width);
            var y = random(0, canvas.height);
            context.lineWidth = lineSize; // keep standard line size, no thicker slicing
            context.beginPath();
            context.moveTo(x, y);
            var dx = random(-canvas.width/3, canvas.width/3);
            var dy = random(-canvas.height/6, canvas.height/6);
            if (isSlice) {
                context.quadraticCurveTo(x + random(-50, 50), y + random(-50, 50), x + dx, y + dy);
            } else {
                context.lineTo(x + dx, y + dy);
            }
            context.stroke();
        }
    }

    // Draw some noise below text
    drawNoise(n2 / 2, n / 2, fgColor, false);

    i = 0;
    context.font = fontWeight + ' ' + fontSize + 'px sans-serif';
    context.textBaseline = 'top';
    context.fillStyle = fgColor;
    canvas.style.display = 'none';

    var txtArray = txt.split("\n");
    for (var j = 0; j < txtArray.length; j++) {
        var text = txtArray[j];
        if (text === '') {
            i++;
            continue;
        }
        for (var k = 0; k < text.length; k += len) {
            var txtLine = text.substring(k, k + len);
            var currentX = 10;
            var baseY = 5 + fontSize * (3 / 2) * i++;
            for (var charIdx = 0; charIdx < txtLine.length; charIdx++) {
                var char = txtLine[charIdx];
                var r = random(-4, 4) * Math.PI / 180; // milder rotation
                var offsetY = random(-2, 2); // milder Y jitter
                var offsetX = random(0, 1); // milder X jitter
                
                context.save();
                context.translate(currentX + offsetX, baseY + offsetY);
                context.rotate(r);
                context.fillText(char, 0, 0);
                context.restore();
                
                currentX += context.measureText(char).width + random(1, 3); // added letter spacing to prevent clump
            }
        }
    }

    // Draw slicing noise (background color) - significantly reduced intensity
    drawNoise(0, n * 0.4, bgColor, true);

    // Draw remaining noise ON TOP of text to break OCR
    drawNoise(n2 / 2, n / 2, fgColor, false);
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var img = $("img");
    img.src = canvas.toDataURL("image/png");
}
function changeColor(name) {
    var c = $(name + "_c");
    var ctx = c.getContext("2d");
    var red = $(name + "_red");
    var green = $(name + "_green");
    var blue = $(name + "_blue");
    ctx.fillStyle = "rgb(" + red.value + "," + green.value + "," + blue.value + ")";
    $(name).innerHTML = ctx.fillStyle;
    ctx.fillRect(0, 0, 100, 100);
    //$('canvas').getContext('2d').fillStyle=$("fontcolor").innerHTML;
}
function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}