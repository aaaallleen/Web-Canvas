let colorInput = document.querySelector('#color-picker');
let hexInput = document.querySelector('#hex');
let barInput = document.querySelector('#pen-range');
let numInput = document.querySelector('#pensize');
document.getElementById('upload_butt').addEventListener('click', upload_button);
/*tmpcanvas = document.createElement('canvas');
tmpctx = tmpcanvas.getContext('2d');*/
let store_arr = [];
let recentWords =[];
let undoWordList = [];
let wordcount = 0;  //for backspace;
let arr_idx = -1;
var preEnterX = 0;
var preEnterY = 0;
var saved = true;
var shape = 0;
var painting = false;
var pencolor = 'red';
var penwidth = 20;
var font = 'Arial';
var writing = false;
var mouseX = 0 ;
var mouseY = 0 ;
var isdown = false;
var cursor = true;
var speed = 200;

var tri1X, tri1Y, tri2X, tri2Y,tri3X, tri3Y, tricounter = 0;
canvas.addEventListener('mousedown', startPosition);
canvas.addEventListener('mouseup', endPosition);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseout', mouseout);
colorInput.addEventListener('input',()=>{
    let col = colorInput.value;
    hexInput.value = col;
})
hexInput.addEventListener('input',()=>{
    let col = hexInput.value;
    colorInput.value = col;
})
barInput.addEventListener('input',()=>{
    let val = barInput.value;
    numInput.value = val;
})
numInput.addEventListener('input',()=>{
    let val = numInput.value;
    barInput.value = val;
})
window.addEventListener('load', ()=>{
    canvas = document.querySelector('#canvas');
    ctx = canvas.getContext('2d');
    canvas.height = window.innerHeight*3/4;
    canvas.width = window.innerWidth/2;  
    canvas.style.cursor = "url('./img/cur_pen.png'), auto";
})
window.addEventListener('resize', ()=>{
    //tmpctx.drawImage(canvas, 0, 0);
    canvas.height = window.innerHeight*3/4;
    canvas.width = window.innerWidth/2;
    //ctx.drawImage(tmpcanvas, 0, 0);
    tricounter = 0;
})
document.addEventListener('keydown', function(e){
    if( !writing || shape != 1) return;
    ctx.font = penwidth+'px ' + font;
    console.log(e.key);
    if(e.keyCode ===13){
        console.log("enter is pressed");
        recentWords.push(e.key);
        preEnterX = mouseX;
        preEnterY = mouseY;
        mouseX = startingX;
        mouseY += penwidth;
        console.log(mouseX, mouseY);
    } else if(e.keyCode === 8){
        if(recentWords.length > 0){
            backspace();
            var recentWord = recentWords[recentWords.length - 1];
            if(recentWord == 'Enter'){
                console.log('encounter Enter', preEnterX, preEnterY);
                mouseX = preEnterX - penwidth/2;
                mouseY = preEnterY;
            }else{
                mouseX -=ctx.measureText(recentWord).width;
            }
            recentWords.pop();
        }
    } else{
        ctx.fillStyle = pencolor;
        ctx.fontStyle ='Arial';
        if(e.key.length >1){
        }
        else{
            ctx.fillText(e.key, mouseX, mouseY);
            mouseX+=ctx.measureText(e.key).width;
            //console.log(e.key);
            saveState();
            recentWords.push(e.key);
            saved = false ;
        }
        if(e.type != 'mouseout'){
            console.log('try save', arr_idx);
            store_arr[++arr_idx] = (ctx.getImageData(0, 0, canvas.width, canvas.height));
            saved = true;
        }
    }
    
})





 // pen tool  
canvas.addEventListener('click', function(e){
    if(shape == 1 ){
        preEnterY = 0;
        preEnterX = 0;
        if(writing == false|| shape != 1 )return;
        mouseX = e.pageX - 20;
        mouseY = e.pageY - 28;
        startingX = mouseX;
        console.log('cursor set', mouseX, mouseY);
        getfont();
        recentWords = [];
        saveState();
        return false;
    }
    else if(shape == 4){
        if(tricounter == 0){
            ctx.beginPath();
            tri1X = e.offsetX;
            tri1Y = e.offsetY;
            tricounter++;
            
        }
        else if (tricounter == 1){
            tri2X = e.offsetX;
            tri2Y = e.offsetY;          
            ctx.lineWidth = penwidth;
            ctx.strokeStyle = pencolor;
            ctx.beginPath();
            ctx.moveTo(tri1X, tri1Y);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.stroke();
            tricounter++;

        }
        else if(tricounter == 2){
            tri3X = e.offsetX;
            tri3Y = e.offsetY;
            ctx.lineWidth = penwidth;
            ctx.strokeStyle = pencolor;
            ctx.beginPath();
            ctx.moveTo(tri1X, tri1Y); 
            ctx.lineTo(tri2X, tri2Y);
            ctx.lineTo(e.offsetX, e.offsetY);
            ctx.closePath();
            ctx.stroke();
            tricounter = 0;
            if(e.type != 'mouseout'){
                console.log('try save', arr_idx);
                store_arr[++arr_idx] = (ctx.getImageData(0, 0, canvas.width, canvas.height));
                saved = true;
            }
        }   
    }
})

function ensureSave(){
    console.log('ensure save, save = ', saved);
    if(saved == false){
        store_arr[++arr_idx] = (ctx.getImageData(0, 0, canvas.width, canvas.height));
        saved = true;
    }
    undo_canvas();
}
function saveState(){
    undoWordList.push(canvas.toDataURL());
}
function backspace(){
    undoWordList.pop();
    var imgWord = undoWordList[undoWordList.length -1];
    var image = new Image();
    image.src = imgWord;
    image.onload = function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height, 0, 0, canvas.width, canvas.height);
    }
}
function startPosition(e){
    mouseX = 0;
    mouseY = 0;
    painting = true; 
    if(shape == 0){
        isdown = true;
        draw(e); 
    }
    else if (shape == 2){
        isdown = true;
        painting = true;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if(shape == 3){
        isdown = true;
        painting = true;
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if ( shape == 5){
        isdown = true;
        painting = true;
    }
    if(arr_idx == -1){
        store_arr = [];
    }
}
function endPosition(e){
    if(shape == 4 || shape == 1) return;
    if(painting == false) return;
    if(shape == 0){
        ctx.beginPath();
        mouseX = 0;
        mouseY = 0;
        painting = false;
        writing = false;
        isdown = false;
    }
    else if(shape == 2){
        drawcircle(e);
        isdown = false;
        painting = false;
        mouseX = 0;
        mouseY = 0;
    }
    else if (shape == 3){
        drawrect(e);
        isdown = false;
        painting = false;
        mouseX = 0;
        mouseY = 0;
    }
    else if (shape == 5){
        ctx.beginPath();
        isdown = false;
        painting = false;
        mouseX = 0;
        mouseY = 0;
    }
    store_arr[++arr_idx] = (ctx.getImageData(0, 0, canvas.width, canvas.height));
    console.log('Increment array Index after draw');
    saved = true;
    
}
function mouseout(e){
    if(shape == 0)endPosition(e);
    isdown = false;
}

function draw(e){
    if(!painting||!isdown) return;
    ctx.globalCompositeOperation ='source-over'
    if(shape==0){
        ctx.lineWidth = penwidth;
        ctx.lineCap='round';
        ctx.strokeStyle = pencolor;
        ctx.beginPath();
        ctx.lineTo(e.clientX - 40 , e.clientY - 30 );
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - 40, e.clientY - 30);
        ctx.stroke();
    } 
    else if(shape == 1){
    } 
    else if(shape == 2){
        ctx.clearRect(0,0, canvas.width, canvas.height);
        if(arr_idx != -1)
            ctx.putImageData(store_arr[arr_idx], 0 , 0);
        drawcircle(e);
    }
    else if(shape == 3){
        ctx.clearRect(0,0, canvas.width, canvas.height);
        if(arr_idx != -1)
            ctx.putImageData(store_arr[arr_idx], 0 , 0);
        drawrect(e);
    }
    else if (shape == 5){
        ctx.beginPath();
        ctx.globalCompositeOperation='destination-out';
        ctx.lineWidth = penwidth;
        ctx.moveTo(e.clientX - 50, e.clientY - 30);
        ctx.lineTo(e.clientX - 50 , e.clientY - 30 );
        ctx.closePath();
        ctx.stroke();
    }
} 
function drawcircle(e){
    if(shape!=2) return;
    ctx.beginPath();
    ctx.lineWidth = penwidth;
    ctx.strokeStyle = pencolor;
    let r = Math.sqrt((e.offsetX - mouseX)*(e.offsetX - mouseX)+(e.offsetY -mouseY)*(e.offsetY -mouseY));
    console.log('WAP', r);
    ctx.arc(mouseX , mouseY , r, 0, 2 * Math.PI);
    ctx.stroke();
}
function drawrect(e){
    if(shape != 3) return
    ctx.beginPath();
    ctx.lineWidth = penwidth;
    ctx.strokeStyle = pencolor;
    ctx.rect(mouseX, mouseY, e.offsetX - mouseX, e.offsetY - mouseY);
    ctx.stroke();
}

function predraw(){
    canvas.style.cursor = "url('./img/cur_pen.png'), auto";
    shape = 0;
    painting = false;
}
function colorChange(tocolor){
    pencolor = tocolor;
    hexInput.value = pencolor;
    colorInput.value = pencolor;
}
function sizeChange(toSize){
    penwidth = tosize;
}
function clear_canvas(){
    ctx.fillStyle='white';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    store_arr = [];
    recentWords = [];
    undoWordList = [];
    arr_idx = -1;
    tricounter = tri1X = tri1Y = tri2X = tri2Y = tri3X = tri3Y = 0;
}
function undo_canvas(){
    console.log(arr_idx);
    if(arr_idx <= 0 ){
        ctx.fillStyle='white';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        arr_idx = -1;
    }else{
        arr_idx--;
        //store_arr.pop();
        ctx.putImageData(store_arr[arr_idx], 0 , 0);
    }
    tricounter = 0;
}
function redo_canvas(){
    console.log(arr_idx);
    if(store_arr[++arr_idx]){
        ctx.putImageData(store_arr[arr_idx], 0 , 0);
        console.log('pussy');
    }else{
        arr_idx = arr_idx-1;
    }
}
function upload_button(){
    document.getElementById('file-uploader').click();  
}
document.getElementById('file-uploader').onchange = function(e) {
    var img = new Image();
    img.onload = drawImg;
    img.onerror = failed;
    img.src = URL.createObjectURL(this.files[0]);
};
function drawImg() {
    if(this.height < window.height){
    let w = canvas.width;
    let nw = this.naturalWidth;
    let nh = this.naturalHeight;
    let aspect = nw / nh;
    let h = w/aspect; 
    canvas.height = h;
    ctx.drawImage(this, 0,0, w, h);
    }
    else{
        let h = canvas.height;
        let nw = this.naturalWidth;
        let nh = this.naturalHeight;
        let aspect = nh / nw;
        let w = h/aspect; 
        canvas.width = w;
        ctx.drawImage(this, 0,0, w, h);
    }
    store_arr.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    arr_idx++;
}
function failed() {
    console.error("The provided file couldn't be loaded as an Image media");
}
function grayscale (){
    imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
    let data_arr = imgData.data;
    for(let i = 0; i < data_arr.length; i+=4){//there are 4 values for every pixel
        let ttl = 0.299 * data_arr[i] + 0.587 * data_arr[i+1] + 0.114 * data_arr[i+2];
        let avg = parseInt(ttl);
        data_arr[i] = data_arr[i+1] = data_arr[i+2] = avg; //reg, green, blue
    }
    imgData.data = data_arr;
    ctx.putImageData(imgData, 0 , 0);
    store_arr.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    arr_idx++;
}
function invert(){
    imgData = ctx.getImageData(0,0,canvas.width, canvas.height);
    let data_arr = imgData.data;
    for(let i = 0; i < data_arr.length; i+=4){//there are 4 values for every pixel
        data_arr[i] = 255 - data_arr[i];
        data_arr[i+1] = 210 - data_arr[i+1]; 
        data_arr[i+2] = 200 - data_arr[i+2];  //reg, green, blue
    }
    imgData.data = data_arr;
    ctx.putImageData(imgData, 0 , 0);
    store_arr.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    arr_idx++;
}
function download(){
    if(window.navigator.msSaveBlob){
        window.navigator.msSaveBlob(canvas.msToBlob(), 'canvas_image.png');
    }else{
        const a = document.createElement('a');
        const dataURI = canvas.toDataURL('canvas_image/png');
        a.href = canvas.toDataURL();
        a.download = 'canvas_image.png';
        a.click();
    }
}
function getfont(){
    font = document.getElementById('Font').value;
    console.log(font);
}
function text(){
    canvas.style.cursor = "url('./img/cur_input.png'), auto";
    getfont();
    writing = true;
    shape = 1;
}

function circle(){
    canvas.style.cursor = "url('./img/cur_circle.png'), auto";
    shape = 2;
    painting = true;
}
function rectangle(){
    canvas.style.cursor = "url('./img/cur_square.png'), auto";
    shape = 3;
    painting = true;
}
function tri(){
    canvas.style.cursor = "url('./img/cur_triangle.png'), auto";
    tricounter = 0;
    shape = 4;
    painting = false;
}
function eraser(){
    canvas.style.cursor = "url('./img/cur_erase.png'), auto";
    shape = 5;
    painting = true;
}
