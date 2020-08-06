import * as THREE from './three.js-master/build/three.module.js';
import{ EffectComposer } from './three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import{ OutlinePass } from './three.js-master/examples/jsm/postprocessing/OutlinePass.js';
import{ RenderPass } from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import{ Raycaster } from './three.js-master/src/core/Raycaster.js';



//////////////////////////////////////////
//                                      //
//    Scene 1 : Carousel of Color       //
//                                      //
//////////////////////////////////////////

// New Scene
var scene = new THREE.Scene();
scene.background = new THREE.Color(0xaaaacc);


// New Camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 2; // distance


// Add the WebGLRenderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight - 100);
renderer.domElement.addEventListener("click", MouseClick, true);
document.body.appendChild(renderer.domElement);


// Image Effects / Post Processing
var composer = new EffectComposer(renderer);


// Outline pass of highlighted segment
var outline_pass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outline_pass.edgeGlow = 1;
outline_pass.edgeStrength = 3;
outline_pass.edgeThickness = 1;
outline_pass.pulsePeriod = 2;
outline_pass.visibleEdgeColor.set('#ffffff');
outline_pass.hiddenEdgeColor.set('#0000ff');


// Add multi-pass renderings to the effects composer
var renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);
composer.addPass(outline_pass);


// Mouse Movement
var raycaster = new THREE.Raycaster(); 
var mouse = new THREE.Vector2(); 
window.addEventListener('mousemove', MouseMove, false);


// Handle window resizing
window.addEventListener('resize', function(){
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight - 100);
	composer.setSize(window.innerWidth, window.innerHeight - 100);
});
		

// Color cone segments & parameters
var radius = 0.5;
var height = 1.0;
var radial_segments = 6;
var height_segments = 15;
var open_ended = false;
var theta_start = 0.00;
var theta_length = Math.PI / 24;
var cone_segments = [];
var highlighted_cone_segments = [];
var colors ={  
            // The world is a carousel of color,
            // Wonderful, wonderful color.
			yellow: [255, 255, 0],
			gold: [255, 223, 0],
			amber: [255, 191, 0],
			tangerine: [255, 159, 0],
			orange: [255, 128, 0],
			persimmon: [255, 96, 0],
			vermilion: [255, 64, 0],
			scarlet: [255, 32, 0],
			red: [255, 0, 0],
			amaranth: [255, 0, 32],
			crimson: [255, 0, 64],
			raspberry: [255, 0, 96],
			rose: [255, 0, 128],
			deep_pink: [255, 0, 159],
			cerise: [255, 0, 191],
			fuchsia: [255, 0, 223],
			magenta: [255, 0, 255],
			phlox: [223, 0, 255],
			purple: [191, 0,255],
			amethyst: [159, 0, 255],
			violet: [128, 0, 255],
			indigo: [96, 0, 255],
			ultramarine: [64, 0, 255],
			iris: [32, 0, 255],
			blue: [0, 0, 255],
			sapphire: [0, 32, 255],
			cerulean: [0, 64, 255],
			cobalt: [0, 96, 255],
			azure: [0, 128, 255],
			cornflower: [0, 159, 255],
			capri: [0, 191, 255],
			sky: [0, 223, 255],
			cyan: [0, 255, 255],
			turquoise: [0, 255,223],
			aquamarine: [0, 255, 191],
			mint: [0, 255, 159],
			spring: [0, 255, 128],
			emerald: [0, 255, 96],
			erin: [0, 255, 64],
			jade: [0, 255, 32],
			green: [0, 255, 0],
			neon_green: [32, 255, 0],
			harlequin: [64, 255, 0],
			slime_green: [96, 255, 0],
			chartreuse: [128, 255, 0],
			spring_bud: [159, 255, 0],
			lime: [191, 255, 0],
			lemon: [223, 255,0]
};


// Create color cone segments and add them to the scene
var color_index = 1;
for (var color in colors){
	var segment = NewConeSegment(radius, height, radial_segments, height_segments, open_ended, theta_start, color_index, theta_length, [0,0,0], colors[color]);
	segment.color = color;
	segment.rotation.x = Math.PI * 1.2;
	cone_segments.push(segment);
	scene.add(segment);
	color_index++;
}


///////////////////////////////////
// Functions                     //
///////////////////////////////////

// The Animation Loop
export function Animate_Scene_One(){
	
	if(window.scene_one === true){
		// For all the RGB cone segments
		cone_segments.forEach(function(segment){
		   // Rotate around the Y axis each frame
		   segment.rotation.y += 0.01;
		});

		// Render the WebGL image
		renderer.render(scene, camera);
		
		// Render the post processing image effects
		composer.render(); 
				
		// Next Frame Recursive Callback
		requestAnimationFrame(Animate_Scene_One);
	}
}
//Animate_Scene_One(); // Start Animation


// When the Mouse moves
function MouseMove(event){
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;               
	var collisions = Raycast(); // Are we over anything?
	
	if (collisions.length > 0){
		// The first object the ray collided with is our selection
		var selection = collisions[0].object;
		highlighted_cone_segments = []; // Purge previous selection
		highlighted_cone_segments.push(selection); // Add new selection
		
		// Update the renderer with the new selection
		outline_pass.selectedObjects = highlighted_cone_segments;
	}
	else{
		highlighted_cone_segments = []; // Purge previous selection
		outline_pass.selectedObjects = highlighted_cone_segments;
	}
} 


// When a click happens
function MouseClick(event){
    raycaster.setFromCamera(mouse, camera);
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;               
	var collisions = Raycast(); // Are we over anything?
	
	if (collisions.length > 0){
		// The first object the ray collided with is our selection
		var selection = collisions[0].object;
		console.log(selection.color);
		//selection.color === the key to the selected color 
	}
}


// Scene 1 Raycast
function Raycast(){
	// Go Go Gadget Raycaster!
	raycaster.setFromCamera(mouse, camera);
	var collisions = raycaster.intersectObject(scene, true);
	
	return collisions;
}


// Add new color cone segment to the scene
function NewConeSegment(radius, 
						 height, 
						 radial_segments, 
						 height_segments, 
						 open_ended, 
						 theta_start,
						 theta_offest,
						 theta_length,
						 gradient_start,
						 gradient_stop){

    // Cone segment geometry
	var geometry = new THREE.ConeGeometry(radius, 
									  height, 
									  radial_segments, 
									  height_segments, 
									  open_ended, 
									  theta_start + (theta_length * theta_offest),
									  theta_length);

	// New gradient texture
	var texture = new THREE.Texture(GenerateGradientTexture(gradient_start, gradient_stop));
	texture.needsUpdate = true;

	// Use the gradient texture as the material for the cone segment
	var material = new THREE.MeshBasicMaterial({color: [0,0,0],
		                                        map: texture});
	
	// Return the segment mesh object
	return new THREE.Mesh(geometry, material);
}


// Generate and return a canvas with a 2 point linear gradient between start and stop 
function GenerateGradientTexture(start, stop){
	var size = 512;

	// Create a canvas to paint on
	var canvas = document.createElement('canvas');
	canvas.width = size;
	canvas.height = size;

	// Get a 2d paint context for canvas
	var context = canvas.getContext('2d');

	// Generate gradient
	context.rect(0, 0, size, size);
	var gradient = context.createLinearGradient(size/2, 0, size/2, size); // x1 y1 x2 y2
	gradient.addColorStop(0, 'rgb('+start[0]+','+start[1]+','+start[2]+')');
	gradient.addColorStop(1, 'rgb('+stop[0]+','+stop[1]+','+stop[2]+')');          

    // Apply the gradient to the context  
	context.fillStyle = gradient;
	context.fill();

	return canvas;
}