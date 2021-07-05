var c = document.querySelector('canvas');
var ctx = c.getContext('2d');

c.width = window.innerWidth*0.8 < 1000 ? window.innerWidth*0.8 : 1000;
c.height = 500;

var startBtn = document.querySelector("#startGameBtn");
var uiContainer = document.querySelector("#container-ui");

var backgroundColor = "#19f";
var skyColor = "#5AB8FF";
var hillsColor = "black";

var hillsHeightFactor = 0.25;
const numerOfHillsRoad = 350;

var playing = true;

var time = 0;
var speed = 0;
var t = 0;
var k = {ArrowUp:0, ArrowDown:0, ArrowLeft:0, ArrowRight:0};

//fazer maquina de estado aqui


var roadFactor = 0.01;
var skyFactor = 0.05;

//populates perm array randomly from 0 - 254 with no repetition
var perm = [];
while (perm.length < numerOfHillsRoad) {
    while (perm.includes(val = Math.floor(Math.random()*numerOfHillsRoad)));
    perm.push(val);
}

var lerp = (a,b,t) => a + (b-a) * (1-Math.cos(t*Math.PI))/2;

function noise (x,factor) {
    //loop to the array indexes
    x = factor*x % numerOfHillsRoad;
    return lerp (perm[Math.floor(x)],perm[Math.ceil(x)], x - Math.floor(x)); 
}

var sky = new function()
{
    this.draw = function()
    {
        ctx.fillStyle = skyColor;
        ctx.beginPath();
        ctx.moveTo(0,0)
        for (let i = 0; i < c.width; i++) {
            ctx.lineTo(i,noise(time*0.15 + i,skyFactor)*hillsHeightFactor*3);  
        }
        ctx.lineTo(c.width,0);
        ctx.fill();
    }
}

var player = new function()
{
    this.x = c.width/4;
    this.y = 0;
    this.ySpeed = 0;
    this.rot = 0;
    this.rotSpeed = 0;
    this.scale = 0.30;

    this.img = new Image();
    this.img.src = './assets/images/player.png';

    this.draw = function()
    {
        var pos1 = c.height - noise(time + this.x,roadFactor)*hillsHeightFactor;

        //get 5 frames foward to calc the angle of the road
        var pos2 = c.height - noise(time + 15 + this.x,roadFactor)*hillsHeightFactor;

        var grounded = 0;

        if(pos1 - 15> this.y){
            this.ySpeed += 0.15;
        }
        else{
            this.ySpeed -= this.y - (pos1 - 15);
            this.y = pos1 - 15;
            grounded = 1;
        }


        if(!playing || grounded && Math.abs(this.rot) > Math.PI * 0.7){
            playing = false;
            this.rotSpeed = 5;
            k.ArrowUp = 1;
            this.x -= speed * 5;
        }

        var angle = Math.atan2((pos2-15) - this.y,15);
        this.y += this.ySpeed;

        if(grounded && playing)
        {
            this.rot -= (this.rot - angle) * 0.5;
            this.rotSpeed = this.rotSpeed - (angle - this.rot);
        }
        
        this.rotSpeed -= (k.ArrowRight - k.ArrowLeft) * 0.1;

        if(playing)
        {
            var lasRotSpeed = this.rotSpeed ;
            if(Math.abs(this.rotSpeed) > 1)
                this.rotSpeed = 1*((Math.abs(this.rotSpeed)/lasRotSpeed));
        }

        this.rot -= this.rotSpeed * 0.1;

        if(this.rot > Math.PI) this.rot = -Math.PI;
        if(this.rot < -Math.PI) this.rot = Math.PI;

        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rot);
        ctx.drawImage(this.img,-15, -15,36, 30);
        ctx.restore();
    }
}



function loop()
{    
    speed -= (speed - (k.ArrowUp - k.ArrowDown)) * 0.01;
    time += 10 * speed;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0,0,c.width,c.height);

    sky.draw();

    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.moveTo(0,c.height)
    for (let i = 0; i < c.width; i++) {
        ctx.lineTo(i,c.height - noise(time + i,roadFactor)*hillsHeightFactor);  
    }
    ctx.lineTo(c.width,c.height);
    ctx.fill();

    player.draw();
    requestAnimationFrame(loop);
}

onkeydown = d => k[d.key] = 1;
onkeyup = d => k[d.key] = 0;


startBtn.addEventListener("click",() => {
    console.log("click button");
    loop();
    uiContainer.setAttribute("style","display: none !important");
});
