const { createCanvas, registerFont } = require('canvas');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const txt = process.argv[2] || "未提供文本";

let len = 30; // Fewer characters per line to account for bigger font
const fontSize = 32; // Larger font makes text more robust against noise
const lineSize = 2;
const pointSize = 1;
const points = 5;
const fontWeight = 'bold';

function random(min, max) {
    return Math.round(Math.random() * (max - min)) + min;
}

if (len > txt.length) {
    len = txt.length;
}

const canvasWidth = fontSize * len + 20;
const linesCount = txt.split("\n").length;
const wrappedLinesCount = Math.ceil(txt.length / len);
const totalLines = Math.max(linesCount, wrappedLinesCount);
const canvasHeight = fontSize * (3 / 2) * totalLines + 10;
const canvas = createCanvas(canvasWidth, canvasHeight);
const context = canvas.getContext('2d');

context.clearRect(0, 0, canvas.width, canvas.height);
context.fillStyle = "rgb(255,255,255)"; 
context.fillRect(0, 0, canvas.width, canvas.height);

const fgColor = "rgb(0,0,0)";
const bgColor = "rgb(255,255,255)";

var n = txt.length * 1.5; 
var n2 = txt.length * fontSize * points * 1.2;

function drawNoise(dots, lines, color, isSlice) {
    context.strokeStyle = color;
    context.fillStyle = color;
    
    context.lineWidth = pointSize;
    context.beginPath();
    for (var k = 0; k < dots; k++) {
        var x = random(0, canvas.width);
        var y = random(0, canvas.height);
        context.moveTo(x, y);
        context.lineTo(x + 1, y + 1);
    }
    context.stroke();

    context.beginPath();
    for (var k = 0; k < lines; k++) {
        // Less destructive slice lines: 1-2px relative to 32px font is very readable
        context.lineWidth = isSlice ? random(1, 3) : random(1, 2); 
        var x = random(0, canvas.width);
        var y = random(0, canvas.height);
        context.moveTo(x, y);
        var dx = random(-canvas.width/4, canvas.width/4);
        var dy = random(-canvas.height/4, canvas.height/4);
        if (isSlice) {
            context.quadraticCurveTo(x + random(-40, 40), y + random(-40, 40), x + dx, y + dy);
        } else {
            context.lineTo(x + dx, y + dy);
        }
        context.stroke();
        context.beginPath(); 
    }
}

drawNoise(n2 / 2, n, fgColor, false);

let i = 0;
context.font = fontWeight + ' ' + fontSize + 'px sans-serif';
context.textBaseline = 'top';
context.fillStyle = fgColor;

// Draw thick horizontal connective lines to break OCR segmentation (merges characters)
context.beginPath();
for (var k = 0; k < txt.length * 0.8; k++) {
    context.lineWidth = random(2, 4);
    context.strokeStyle = fgColor;
    var x = random(0, canvas.width);
    var y = random(0, canvas.height);
    context.moveTo(x, y);
    context.lineTo(x + random(30, 80), y + random(-5, 5)); 
}
context.stroke();

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
            var r = random(-12, 12) * Math.PI / 180; 
            var offsetY = random(-5, 5); 
            var offsetX = random(-3, 2); 
            var scaleX = random(85, 115) / 100;
            var scaleY = random(85, 115) / 100;
            
            context.save();
            context.translate(currentX + offsetX, baseY + offsetY);
            context.rotate(r);
            context.scale(scaleX, scaleY);
            
            // Ghosting effect (double vision) to destroy stroke width features for CNNs
            context.globalAlpha = 0.5;
            context.fillText(char, random(-2, 2), random(-2, 2));
            
            // Main character
            context.globalAlpha = 1.0;
            context.fillText(char, 0, 0);
            context.restore();
            
            currentX += context.measureText(char).width + random(-3, 1); 
        }
    }
}

// Draw slicing noise
drawNoise(0, txt.length * 1.5, bgColor, true);
drawNoise(n2 / 2, n, fgColor, false);

const buffer = canvas.toBuffer('image/png');
const outPath = path.join(__dirname, 'temp_clipboard.png');
fs.writeFileSync(outPath, buffer);

const psScript = `Add-Type -AssemblyName System.Windows.Forms; $img = [System.Drawing.Image]::FromFile('${outPath.replace(/\\/g, '\\\\')}'); [System.Windows.Forms.Clipboard]::SetImage($img); $img.Dispose()`;

try {
    execSync(`powershell -STA -NoProfile -Command "${psScript}"`, { stdio: 'ignore' });
} catch (e) {
    console.error("Failed to set clipboard:", e);
}
