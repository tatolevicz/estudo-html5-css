var c = document.querySelector("canvas");
var ctx = c.getContext('2d');

c.width = 600;
c.height = 300;

var x = 0;
var y = 0;

var dirX = 1;
var dirY = 1;

var speed = 1.0;

function gameloop(){

    ctx.clearRect(0,0,c.width,c.height);

    speed += 0.1;

    //update draw
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x +50 , y);
    ctx.lineTo(x + 50,y + 50);
    ctx.lineTo(x, y + 50);
    ctx.lineTo(x, y);

    ctx.closePath();

    ctx.fillStyle = "#000";
    ctx.lineWidth = 5;

    ctx.stroke();
    ctx.fillStyle = "#f00";
    ctx.fill();

    x += dirX;
    y += dirY*speed;

    if(y >= c.height - 50)
    {
        dirY = dirY*-1;
    }

    requestAnimationFrame(gameloop);
}

gameloop();


