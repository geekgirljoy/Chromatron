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

// Add the WebGLRenderer
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight - 100);
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
window.addEventListener('mousemove', TrackMouse, false);

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
var theta_length = Math.PI / 6;
var cone_segments = [];
var selected_cone_segments = [];
var colors ={  
            // The world is a carousel of color,
            // Wonderful, wonderful color.
			red: [255, 0, 0],
			orange: [255, 127, 0],
			yellow: [255, 255, 0],
			chartreuse: [128, 255, 0],
			green: [0, 255, 0],
			spring: [0, 255, 127],
			cyan: [0, 255, 255],
			azure: [0, 127, 255],
			blue: [0, 0, 255],
			violet: [128, 0, 255],
			magenta: [255, 0, 255],
			rose: [255, 0, 127]
};


// Create color cone segments
var color_index = 1;
for (var color in colors){
	cone_segments.push(NewConeSegment(radius, height, radial_segments, height_segments, open_ended, theta_start, color_index, theta_length, [0,0,0], colors[color]));
	color_index++;
}


// Add segments to the scene
cone_segments.forEach(function(segment){
	segment.rotation.x = Math.PI * 1.2;
	scene.add(segment);
});


camera.position.z = 2; // distance


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
function TrackMouse(event){
	mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
	mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;               
	Raycast(); // Are we over anything?
} 


// Scene 1 Raycast
function Raycast(){

	// Go Go Gadget Raycaster!
	raycaster.setFromCamera(mouse, camera);
	var collisions = raycaster.intersectObject(scene, true);

	if (collisions.length > 0){

		// The first object the ray collided with is our selection
		var selection = collisions[0].object;
		selected_cone_segments = []; // Purge previous selection
		selected_cone_segments.push(selection); // Add new selection
		
		// Update the renderer with the new selection
		outline_pass.selectedObjects = selected_cone_segments;

	}
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