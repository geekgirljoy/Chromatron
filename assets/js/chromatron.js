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





///////////////////////////////////
// Functions                     //
///////////////////////////////////

function ClearScene(){
    while(window.scene.children.length > 0){         
        window.scene.remove(window.scene.children[0]);     
    }    
} // / ClearScene()

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



// The Animation Loop
export function Animate(){
    
    if(window.current_scene === 1){
        // For all the RGB cone segments
        window.scene_objects.forEach(function(segment){
           // Rotate around the Y axis each frame
           segment.rotation.y += 0.0075;
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
        /*
        else if(window.current_scene === 2){
            SceneTwoMouseClickHandeler();
        }
        else if(window.current_scene === 3){
            SceneTwoMouseClickHandeler();
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

        ClearScene();
        
        // Display the color
        var swatch_geometry = new THREE.BoxGeometry(0.3, 0.3, 0.1);
        var swatch_texture = new THREE.Texture(GenerateGradientTexture(colors[selection.color], [0,0,0]));
        swatch_texture.needsUpdate = true;
        
        // Use the gradient texture as the material for the cone segment
        var swatch_material = new THREE.MeshBasicMaterial({color: [0,0,0],
                                                    map: swatch_texture});
        var swatch = new THREE.Mesh(swatch_geometry, swatch_material);
        swatch.position.y += 0.4;
        
        window.scene.add(swatch);
        
        
        // ask to proceed or go back
        var btn_geometry = new THREE.BoxGeometry(0.4, 0.2, 1);
        //var btn_material = new THREE.MeshBasicMaterial({color: RGBColorToHex(colors['harlequin'])});
        var btn_material = new THREE.MeshBasicMaterial({color: 0xdc3545});
        
        var go_back_btn = new THREE.Mesh(btn_geometry, btn_material);
        go_back_btn.type = 'button';
        window.scene.add(go_back_btn);
        
        Text(go_back_btn, '< Go Back', 0xffffff, 0.03, 0, 0, 1);
        
        
    } // / clicked the carousel
    else if(selection.type === 'button'){ // clicked on a button
        
        // Go Back button clicked
        SceneChange(1, 'Chromatron: Carousel of Color', 'Select the color that seems closest to your favorite color');
        
        
        // Go Forward button clicked
        //SceneChange(2, 'Chromatron: Hue Going My Way?', '');
        
        
    } // / clicked on a button
} // / CarouselOfColorMouseClickHandeler()


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


export function SceneChange(scene_number, title, instructions){
    window.current_scene = scene_number;
    document.title = title;
    document.getElementById('instructions').innerHTML = instructions;
    
    // Pickup our toys
    ClearScene();
    
    // What shall we play with now?
    if(scene_number === 1){
        CarouselOfColor();
    }
    /*
    
    if(scene_number === 2){
        Scene2Function();
    }
    else if(scene_number === 3){
        Scene3Function();
    }
    else if(scene_number === 4){
        Scene4Function();
    }
    
    */
} // / SceneChange()



function Text(parent_obj, text_string, color, size, x, y, z){

    window.font_loader.load( './assets/js/Pacifico_Regular.js', function ( font ) {
        var text_material = new THREE.MeshBasicMaterial({color: color});
        var text_geometry = new THREE.TextGeometry( text_string, {
            font: font,
            size: size,
            height: 0.01,
            curveSegments: 3,
            bevelEnabled: false,
            bevelThickness: 0.01,
            bevelSize: 0.01,
            bevelSegments: 3,
        } );
        text_geometry.center();
        
        var mesh = new THREE.Mesh( text_geometry, text_material );
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;

        parent_obj.add(mesh);
    } );
} // / Text()

