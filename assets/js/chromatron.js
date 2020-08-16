import * as THREE from './three.js-master/build/three.module.js';
import{ EffectComposer } from './three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import{ OutlinePass } from './three.js-master/examples/jsm/postprocessing/OutlinePass.js';
import{ RenderPass } from './three.js-master/examples/jsm/postprocessing/RenderPass.js';
import{ Raycaster } from './three.js-master/src/core/Raycaster.js';




// New Scene
window.scene = new THREE.Scene();
window.scene.background = new THREE.Color(0x222222);


// New Camera
window.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
window.camera.position.z = 2; // distance


// Add the WebGLRenderer
window.renderer = new THREE.WebGLRenderer();
window.renderer.setSize(window.innerWidth, window.innerHeight - 100);
window.renderer.domElement.addEventListener("click", MouseClick, true);
document.body.appendChild(window.renderer.domElement);


// Image Effects / Post Processing
window.composer = new EffectComposer(window.renderer);

// Outline pass of highlighted segment
var outline_pass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), window.scene, window.camera);
outline_pass.edgeGlow = 1;
outline_pass.edgeStrength = 3;
outline_pass.edgeThickness = 1;
outline_pass.pulsePeriod = 2;
outline_pass.visibleEdgeColor.set('#ffffff');
outline_pass.hiddenEdgeColor.set('#0000ff');

// Add multi-pass renderings to the effects composer
var renderPass = new RenderPass(window.scene, window.camera);
window.composer.addPass(renderPass);
window.composer.addPass(outline_pass);


// Mouse Movement
window.raycaster = new THREE.Raycaster(); 
var mouse = new THREE.Vector2(); 
window.addEventListener('mousemove', MouseMove, false);


// Handle window resizing
window.addEventListener('resize', function(){
    window.camera.aspect = window.innerWidth / window.innerHeight;
    window.camera.updateProjectionMatrix();
    window.renderer.setSize(window.innerWidth, window.innerHeight - 100);
    window.composer.setSize(window.innerWidth, window.innerHeight - 100);
});


// Font Loader
window.font_loader = new THREE.FontLoader();
        

window.highlighted_objects = [];
window.scene_objects = [];



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




///////////////////////////////////
// Scene Functions               //
///////////////////////////////////


//////////////////////////////////////////
//                                      //
//    Scene 1 : Carousel of Color       //
//                                      //
//////////////////////////////////////////
function CarouselOfColor(){
    // Color cone segments & parameters
    var radius = 0.5;
    var height = 1.0;
    var radial_segments = 6;
    var height_segments = 15;
    var open_ended = false;
    var theta_start = 0.00;
    var theta_length = Math.PI / 24;
    var cone_segments = [];
    
    // Create color cone segments and add them to the scene
    var color_index = 1;
    for (var color in colors){
        var segment = NewConeSegment(radius, 
                                     height, 
                                     radial_segments, 
                                     height_segments, 
                                     open_ended, 
                                     theta_start, 
                                     color_index, 
                                     theta_length, 
                                     [0,0,0], 
                                     colors[color]);
        segment.color = color;
        segment.type = 'carousel';
        segment.rotation.x = Math.PI * 1.2;
        cone_segments.push(segment);
        window.scene.add(segment);
        color_index++;
    }
    
    window.scene_objects = cone_segments;
}// / CarouselOfColor()



//////////////////////////////////////////
//                                      //
//    Scene 2 : Color Conformation      //
//                                      //
//////////////////////////////////////////
function ColorConformation(){

    
	// Display the color
	var swatch_geometry = new THREE.BoxGeometry(1, 0.3, 0.01);
	var swatch_texture = new THREE.Texture(GenerateGradientTexture(colors[window.base_color], [0,0,0]));
	swatch_texture.needsUpdate = true;
	
	// Use the gradient texture as the material for the cone segment
	var swatch_material = new THREE.MeshBasicMaterial({color: [0,0,0],
												map: swatch_texture});
	var swatch = new THREE.Mesh(swatch_geometry, swatch_material);
	swatch.position.y += 1.2;
	
	var color_name = window.base_color.toString();
	Text(swatch, color_name.charAt(0).toUpperCase() + color_name.slice(1), [0,0,0], 0.08, 0, 0, 0);

	window.scene.add(swatch);
	window.scene_objects.push(swatch);
	
	// ask to proceed
	var continue_btn = CubeButton(0.45, colors['harlequin'],  0, 0.4, 0, 'Continue >', 0.04, [255, 255, 255]);
	window.scene.add(continue_btn);
	window.scene_objects.push(continue_btn);
	
	// ask to go back
	var go_back_btn = CubeButton(0.45, [220, 53, 69],  0, -0.4, 0, '< Go Back', 0.04, [255, 255, 255]);	
	window.scene.add(go_back_btn);
	window.scene_objects.push(go_back_btn);

}// / ColorConformation()


///////////////////////////////////
// / Scene Functions             //
///////////////////////////////////



///////////////////////////////////
// Scene Config Functions        //
///////////////////////////////////

// The Animation Loop
export function Animate(){
    
    if(window.current_scene === 1){ // Carousel Of Color
        // For all the RGB cone segments
        window.scene_objects.forEach(function(segment){
           // Rotate around the Y axis each frame
           segment.rotation.y += 0.0075;
        });
    }
	if(window.current_scene === 2){ // Color Conformation 
	
	    // For all the cube buttons
        window.scene_objects.forEach(function(scene_element){
			
			if(scene_element.type === 'button'){
			   // Rotate around the X & Z axis each frame

			   scene_element.rotation.x += 0.01;
			   scene_element.rotation.z += 0.01;
			}
        });
	}
    
    // Render the WebGL image
    window.renderer.render(window.scene, window.camera);
    
    // Render the post processing image effects
    window.composer.render(); 
            
    // Next Frame Recursive Callback
    requestAnimationFrame(Animate);
    
} // / Animate()
//Animate(); // Start Animation



// Change the scene to a different selection
export function SceneChange(scene_number, title, instructions){
	window.scene_objects = [];
    window.current_scene = scene_number;
    document.title = title;
    document.getElementById('instructions').innerHTML = instructions;
    
    // Pickup our toys
    ClearScene();
    
    // What shall we play with now?
    if(scene_number === 1){
        CarouselOfColor();
    }
    else if(scene_number === 2){
        ColorConformation();
    }
	/*
	else if(scene_number === 3){
        Scene3Function();
    }
    else if(scene_number === 4){
        Scene4Function();
    }
    
    */
} // / SceneChange()

function ClearScene(){
    while(window.scene.children.length > 0){         
        window.scene.remove(window.scene.children[0]);     
    }    
} // / ClearScene()

///////////////////////////////////
// / Scene Config Functions      //
///////////////////////////////////


///////////////////////////////////
// Mouse Functions               //
///////////////////////////////////


// When the Mouse moves
function MouseMove(event){
    
    // Get the location of the mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1; 
    
    var collisions = Raycast(); // Are we over anything?
    
    if (collisions.length > 0){
        // The first object the ray collided with is our selection
        var selection = collisions[0].object;
        window.highlighted_objects = []; // Purge previous selection
        window.highlighted_objects.push(selection); // Add new selection
        
        // Update the renderer with the new selection
        outline_pass.selectedObjects = window.highlighted_objects;
    }
    else{
        window.highlighted_objects = []; // Purge previous selection
        outline_pass.selectedObjects = window.highlighted_objects;
    }
} // / MouseMove()


// When a click happens
function MouseClick(event){
    // Get the location of the mouse
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1; 
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1; 

    var collisions = Raycast(); // Are we over anything?
    
    if (collisions.length > 0){
        console.log(window.scene_number);
        
        // The first object the ray collided with is our selection
        var selection = collisions[0].object;
        
        if(window.current_scene === 1){
            CarouselOfColorMouseClickHandeler(selection);
        }
        
        else if(window.current_scene === 2){
            ColorConformationMouseClickHandeler(selection);
        }
		/*
        else if(window.current_scene === 3){
            SceneThreeMouseClickHandeler();
        }
        */
        
    }
} // / MouseClick()


// Don't you judge me! This is perfectly valid! :-P
function CarouselOfColorMouseClickHandeler(selection){
    
    if(selection.type === 'carousel'){// clicked on the carousel
    
        console.log(selection.color);
        window.base_color = selection.color;
        //selection.color & window.base_color === the key to the selected color
        
        SceneChange(2, 'Chromatron: Color Conformation', 'Continue with this color?')
        
    } // / clicked the carousel
    else if(selection.type === 'button'){ // clicked on a button
        
        // Go Back button clicked
        SceneChange(1, 'Chromatron: Carousel of Color', 'Select the color that seems closest to your favorite color');
        
        
        // Go Forward button clicked
        //SceneChange(3, 'Chromatron: Hue Going My Way?', '');
        
        
    } // / clicked on a button
} // / CarouselOfColorMouseClickHandeler()



function ColorConformationMouseClickHandeler(selection){
    
    if(selection.type === 'button'){ // clicked on a button
        
		
		// if go back
			// Go Back button clicked
			SceneChange(1, 'Chromatron: Carousel of Color', 'Select the color that seems closest to your favorite color');
			
        
		// if continue
			// Go Forward button clicked
			//SceneChange(3, 'Chromatron: Hue Going My Way?', '');
        
        
    } // / clicked on a button
} // / ColorConformationMouseClickHandeler()





///////////////////////////////////
// / Mouse Functions             //
///////////////////////////////////


///////////////////////////////////
// Other Functions               //
///////////////////////////////////


function RGBColorToHex(rgb_array){

   var hex_string = 0x00;
    
    rgb_array.forEach(function(color){
           
           var hex = Number(color).toString(16); 
           if (hex.length < 2) { 
               hex = "0" + hex; 
            }
           
           hex_string = hex_string + hex;
    });
    
    return parseInt(hex_string, 16);
} // / RGBColorToHex()



// Scene Raycaster
function Raycast(){
    // Go Go Gadget Raycaster!
    window.raycaster.setFromCamera(mouse, window.camera);
    var collisions = window.raycaster.intersectObject(window.scene, true);
    
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
} // / Raycast()




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
} // / GenerateGradientTexture()




function Text(parent_obj, text_string, color, size, x, y, z, rot_x = 0, rot_y = 0, rot_z = 0){

    window.font_loader.load('./assets/js/Pacifico_Regular.js', function(font){
        var text_material = new THREE.MeshBasicMaterial({color: color});
        var text_geometry = new THREE.TextGeometry(text_string, {
            font: font,
            size: size,
            height: 0.01,
            curveSegments: 3,
            bevelEnabled: false,
        } );
        text_geometry.center();
        
        var mesh = new THREE.Mesh(text_geometry, text_material);
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
		
		mesh.rotation.x += rot_x;
		mesh.rotation.y += rot_y;
		mesh.rotation.z += rot_z;

        parent_obj.add(mesh);
    });
} // / Text()



function CubeButton(button_size, button_color, x, y, z, text_value, text_size, text_color){
	
	var btn_geometry = new THREE.BoxGeometry(button_size, button_size, button_size);
	
	var btn_texture = new THREE.Texture(GenerateGradientTexture(button_color, [0,0,0]));
	btn_texture.needsUpdate = true;
	
	var btn_material = new THREE.MeshBasicMaterial({color: button_color,
	                                                map: btn_texture});
	
	var btn = new THREE.Mesh(btn_geometry, btn_material);
	btn.type = 'button';
	
	btn.position.x = x;
    btn.position.y = y;
    btn.position.z = z;
	
	
	// Add text to button faces
	Text(btn, text_value, text_color, text_size, 0, 0, button_size/2);
	Text(btn, text_value, text_color, text_size, 0, 0, button_size/2 * (1 * -1), 0, 3.15, 0);
	Text(btn, text_value, text_color, text_size, 0, button_size/2, 0, -89.5, 0, 0);
	Text(btn, text_value, text_color, text_size, 0,  button_size/2 * (1 * -1), 0, 89.5, 0);
	Text(btn, text_value, text_color, text_size, button_size/2, 0, 0, 0, 89.5, 0);
	Text(btn, text_value, text_color, text_size, button_size/2 * (1 * -1), 0, 0, 0, -89.5, 0);
	
	
	return btn;
}

///////////////////////////////////
// / Other Functions             //
///////////////////////////////////