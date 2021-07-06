// // import {Noise} from "./scripts/noise";
// /*
// 1 - get the canvas context
// 2 - set the canvas size
// 3 - create a procedural hills terrain
// 4 - move the terrain looping the content
// 5 - create sky background as the terrain with different speed
// 6 - create player with png image
// 7 - draw the player at the top of the road
// 8 - fix the angle of player with the road angle
// 9 - create gravity
// 10 - create player's road collison
// 11 - move player with aceleration with arrows
// 12 - use state machine in the game loop
// 13 - make game over flow
// 14 - mobile controls with acelerometer
// */

// class BikeHills{
//     // colors 
//     private backgroundColor:string;
//     private skyColor:string;
//     private hillsColor:string;

//     private canvas: HTMLCanvasElement;
//     private context: CanvasRenderingContext2D;

//     constructor() {

//         //colors
//         this.backgroundColor = "#1199FF";
//         this.skyColor = "#5AB8FF";
//         this.hillsColor = "#000";

//         // step 1
//         let canvas = document.querySelector("canvas");
//         let context = canvas.getContext("2d");

//         //step 2
//         canvas.width = window.innerWidth * 0.8 < 1000 ? window.innerWidth * 0.8 : 1000;
//         canvas.height = 500;

//         // step 3
//         // var noise = new Noise(255, 100);
//         // noise.populate();

//         this.canvas = canvas;
//         this.context = context;

//         this.loop(this);
//     }

//     private loop(game){
//         console.log("TS rodando loop!");
//         requestAnimationFrame(game.loop);
//     }
// }

// new BikeHills();
