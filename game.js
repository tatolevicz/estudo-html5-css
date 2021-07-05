import {Road} from "./scripts/road.js";
/*
1 - get the canvas context
2 - set the canvas size
3 - create a procedural hills terrain
4 - move the terrain looping the content
5 - create sky background as the terrain with different speed
6 - create player with png image
7 - draw the player at the top of the road
8 - fix the angle of player with the road angle
9 - create gravity
10 - create player's road collison
11 - move player with aceleration with arrows
12 - use state machine in the game loop
13 - make game over flow
14 - mobile controls with acelerometer
*/

// colors 
var backgroundColor = "#1199FF";
var skyColor = "#5AB8FF";
var hillsColor = "#000";

// step 1
var c = document.querySelector("canvas");
var ctx = c.getContext("2d");

//step 2
c.width = window.innerWidth * 0.8 < 1000 ? window.innerWidth * 0.8 : 1000;
c.height = 500;

// step 3
var road = new Road(10, 100);
road.populate();