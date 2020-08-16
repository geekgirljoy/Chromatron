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
    window.base_color = null;
    window.current_color = null;
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
    Text(swatch, color_name.charAt(0).toUpperCase() + color_name.slice(1), [255,255,255], 0.08, 0, 0, 0);

    window.scene.add(swatch);
    window.scene_objects.push(swatch);
    
    // ask to proceed
    var continue_btn = CubeButton(0.45, colors['harlequin'], [0, 0, 0],  0, 0.4, 0, 'Continue >', 52, [255, 255, 255], (512/2) - 115, (512/2));
    continue_btn.action = 'change scene';
    continue_btn.action_data = '3';
    
    window.scene.add(continue_btn);
    window.scene_objects.push(continue_btn);
    
    // ask to go back
    var go_back_btn = CubeButton(0.45, [220, 53, 69], [0,0,0], 0, -0.4, 0, '< Go Back', 52, [255, 255, 255], (512/2) - 130, (512/2));    
    go_back_btn.action = 'change scene';
    go_back_btn.action_data = '1';
    
    window.scene.add(go_back_btn);
    window.scene_objects.push(go_back_btn);

}// / ColorConformation()


//////////////////////////////////////////
//                                      //
//    Scene 3 : Hue Going My Way        //
//                                      //
//////////////////////////////////////////
function HueGoingMyWay(){
   // Display the color swatch button
    var swatch_geometry = new THREE.BoxGeometry(1, 0.3, 0.01);
    
    if(window.current_color == null){
        var c = colors[window.base_color];
        window.current_color = [c[0], c[1], c[2]];
    }
    var swatch_texture = new THREE.Texture(GenerateGradientTexture(window.current_color, window.current_color));    
    swatch_texture.needsUpdate = true;
    
    // Use the gradient texture as the material for the cone segment
    var swatch_material = new THREE.MeshBasicMaterial({color: [0,0,0],
                                                map: swatch_texture});
    var swatch = new THREE.Mesh(swatch_geometry, swatch_material);
    swatch.position.y += 1.2;
        
    //var color_name = window.base_color.toString();
    var swatch_text = 'R:'+window.current_color[0].toString() + ' '
                    + 'G:'+window.current_color[1].toString() + ' '
                    + 'B:'+window.current_color[2].toString();
    
    if((window.current_color[0] + window.current_color[1] + window.current_color[2]) > 382)
    {
        var swatch_text_color = [0,0,0];
    }
    else{
        var swatch_text_color = [255,255,255];
    }
    Text(swatch,swatch_text, swatch_text_color, 0.08, 0, 0, 0);

    swatch.type = 'swatch button';
    swatch.action = 'change scene';
    swatch.action_data = 1;
    
    window.scene.add(swatch);
    window.scene_objects.push(swatch);


    if(window.current_color[0]+30 <= 255){
        // R+30
        var R30_btn = CubeButton(0.25, [window.current_color[0]+30,window.current_color[1], window.current_color[2]], [255,255,255], -0.35, 0.70, 0, '+30', 128, [255, 0, 0], (512/2) - 115, (512/2));
        R30_btn.action = 'red';
        R30_btn.action_data = '30';
        window.scene.add(R30_btn);
        window.scene_objects.push(R30_btn);
    }

    if(window.current_color[0]+15 <= 255){
        // R+15
        var R15_btn = CubeButton(0.25, [window.current_color[0]+15,window.current_color[1], window.current_color[2]], [255,255,255], -0.35, 0.35, 0, '+15', 128, [255, 0, 0], (512/2) - 115, (512/2));
        R15_btn.action = 'red';
        R15_btn.action_data = '15';
        window.scene.add(R15_btn);
        window.scene_objects.push(R15_btn);
    }

    if(window.current_color[0]+1 <= 255){
        // R+1
        var R1_btn = CubeButton(0.25, [window.current_color[0]+1,window.current_color[1], window.current_color[2]], [255,255,255], -0.35, 0, 0, '+1', 128, [255, 0, 0], (512/2) - 115, (512/2));
        R1_btn.action = 'red';
        R1_btn.action_data = '1';
        window.scene.add(R1_btn);
        window.scene_objects.push(R1_btn);
    }

    if(window.current_color[1]+30 <= 255){
        // G+30
        var G30_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1]+30, window.current_color[2]], [255,255,255],  0, 0.70, 0, '+30', 128, [0, 255, 0], (512/2) - 115, (512/2));
        G30_btn.action = 'green';
        G30_btn.action_data = '30';
        window.scene.add(G30_btn);
        window.scene_objects.push(G30_btn);
    }

    if(window.current_color[1]+15 <= 255){
        // G+15
        var G15_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1]+15, window.current_color[2]], [255,255,255],  0, 0.35, 0, '+15', 128, [0, 255, 0], (512/2) - 115, (512/2));
        G15_btn.action = 'green';
        G15_btn.action_data = '15';
        window.scene.add(G15_btn);
        window.scene_objects.push(G15_btn);
    }

    if(window.current_color[1]+1 <= 255){
        // G+1
        var G1_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1]+1, window.current_color[2]], [255,255,255],  0, 0, 0, '+1', 128, [0, 255, 0], (512/2) - 115, (512/2));
        G1_btn.action = 'green';
        G1_btn.action_data = '1';
        window.scene.add(G1_btn);
        window.scene_objects.push(G1_btn);
    }

    if(window.current_color[2]+30 <= 255){
        // B+30
        var B30_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1], window.current_color[2]+30], [255,255,255],  0.35, 0.70, 0, '+30', 128, [0, 0, 255], (512/2) - 115, (512/2));
        B30_btn.action = 'blue';
        B30_btn.action_data = '30';
        window.scene.add(B30_btn);
        window.scene_objects.push(B30_btn);
    }
    
    if(window.current_color[2]+15 <= 255){
        // B+15
        var B15_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1], window.current_color[2]+15], [255,255,255],  0.35, 0.35, 0, '+15', 128, [0, 0, 255], (512/2) - 115, (512/2));
        B15_btn.action = 'blue';
        B15_btn.action_data = '15';
        window.scene.add(B15_btn);
        window.scene_objects.push(B15_btn);
    }

    if(window.current_color[2]+1 <= 255){
        // B+1
        var B1_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1], window.current_color[2]+1], [255,255,255],  0.35, 0, 0, '+1', 128, [0, 0, 255], (512/2) - 115, (512/2));
        B1_btn.action = 'blue';
        B1_btn.action_data = '1';
        window.scene.add(B1_btn);
        window.scene_objects.push(B1_btn);
    }
    
    ////////////////////
    //  lighter
    //  darker
    ////////////////////
    
    if(window.current_color[0]-1 >= 0){
        // R-1
        var R_1_btn = CubeButton(0.25, [window.current_color[0]-1,window.current_color[1], window.current_color[2]], [0,0,0], -0.35, -0.35, 0, '-1', 128, [255, 0, 0], (512/2) - 115, (512/2));
        R_1_btn.action = 'red';
        R_1_btn.action_data = '-1';
        window.scene.add(R_1_btn);
        window.scene_objects.push(R_1_btn);
    }
    
    if(window.current_color[0]-15 >= 0){
        // R-15
        var R_15_btn = CubeButton(0.25, [window.current_color[0]-15,window.current_color[1], window.current_color[2]], [0,0,0], -0.35, -0.70, 0, '-15', 128, [255, 0, 0], (512/2) - 115, (512/2));
        R_15_btn.action = 'red';
        R_15_btn.action_data = '-15';
        window.scene.add(R_15_btn);
        window.scene_objects.push(R_15_btn);
    }

    if(window.current_color[0]-30 >= 0){
        // R-30
        var R_30_btn = CubeButton(0.25, [window.current_color[0]-30,window.current_color[1], window.current_color[2]], [0,0,0], -0.35, -1.05, 0, '-30', 128, [255, 0, 0], (512/2) - 115, (512/2));
        R_30_btn.action = 'red';
        R_30_btn.action_data = '-30';
        window.scene.add(R_30_btn);
        window.scene_objects.push(R_30_btn);
    }
    
    if(window.current_color[1]-1 >= 0){
        // G-1
        var G_1_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1]-1, window.current_color[2]], [0,0,0],  0,  -0.35, 0, '-1', 128, [0,255,0], (512/2) - 115, (512/2));
        G_1_btn.action = 'green';
        G_1_btn.action_data = '-1';
        window.scene.add(G_1_btn);
        window.scene_objects.push(G_1_btn);
    }
    
    if(window.current_color[1]-15 >= 0){
        // G-15
        var G_15_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1]-15, window.current_color[2]], [0,0,0],  0, -0.70, 0, '-15', 128, [0,255,0], (512/2) - 115, (512/2));
        G_15_btn.action = 'green';
        G_15_btn.action_data = '-15';
        window.scene.add(G_15_btn);
        window.scene_objects.push(G_15_btn);
    }

    if(window.current_color[1]-30 >= 0){
        // G-30
        var G_30_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1]-30, window.current_color[2]], [0,0,0],  0, -1.05, 0, '-30', 128, [0,255,0], (512/2) - 115, (512/2));
        G_30_btn.action = 'green';
        G_30_btn.action_data = '-30';
        window.scene.add(G_30_btn);
        window.scene_objects.push(G_30_btn);
    }

    if(window.current_color[2]-1 >= 0){
        // B-1
        var B_1_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1], window.current_color[2]-1], [0,0,0],  0.35,  -0.35, 0, '-1', 128, [0,0,255], (512/2) - 115, (512/2));
        B_1_btn.action = 'blue';
        B_1_btn.action_data = '-1';
        window.scene.add(B_1_btn);
        window.scene_objects.push(B_1_btn);
    }
    
    if(window.current_color[2]-15 >= 0){
        // B-15
        var B_15_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1], window.current_color[2]-15], [0,0,0],  0.35, -0.70, 0, '-15', 128, [0,0,255], (512/2) - 115, (512/2));
        B_15_btn.action = 'blue';
        B_15_btn.action_data = '-15';
        window.scene.add(B_15_btn);
        window.scene_objects.push(B_15_btn);
    }

    if(window.current_color[2]-30 >= 0){
        // B-30
        var B_30_btn = CubeButton(0.25, [window.current_color[0],window.current_color[1], window.current_color[2]-30], [0,0,0],  0.35, -1.05, 0, '-30', 128, [0,0,255], (512/2) - 115, (512/2));
        B_30_btn.action = 'blue';
        B_30_btn.action_data = '-30';
        window.scene.add(B_30_btn);
        window.scene_objects.push(B_30_btn);
    }

}// / HueGoingMyWay()

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
    else if(window.current_scene === 2){ // Color Conformation 
    
        // For all the cube buttons
        window.scene_objects.forEach(function(scene_element){
            
            if(scene_element.type === 'button'){
               // Rotate around the X & Z axis each frame

               scene_element.rotation.x += 0.01;
               scene_element.rotation.z += 0.01;
            }
        });
    }
    else if(window.current_scene === 3){ // Hue Going My Way
    
        // For all the cube buttons
        window.scene_objects.forEach(function(scene_element){
            
            if(scene_element.type === 'button'){
               // Rotate around the X & Z axis each frame
               
               if(scene_element.action_data > 0){
                   scene_element.rotation.x -= 0.01;
               }
               else if(scene_element.action_data < 0){
                   scene_element.rotation.x += 0.01;
               }
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
    
    else if(scene_number === 3){
        HueGoingMyWay();
    }
    /*
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
              
        // The first object the ray collided with is our selection
        var selection = collisions[0].object;
        
        if(window.current_scene === 1){
            CarouselOfColorMouseClickHandeler(selection);
        }
        
        else if(window.current_scene === 2){
            ColorConformationMouseClickHandeler(selection);
        }
        
        else if(window.current_scene === 3){
            HueGoingMyWayMouseClickHandeler(selection);
        }
        
    }
} // / MouseClick()


// Don't you judge me! This is perfectly valid! :-P
function CarouselOfColorMouseClickHandeler(selection){
    
    if(selection.type === 'carousel'){// clicked on the carousel
    
        console.log(selection.color);
        window.base_color = selection.color;
        //selection.color & window.base_color === the key to the selected color
        
        SceneChange(2, 'Chromatron: Color Conformation', 'Continue with this color?');
        
    } // / clicked the carousel
    
} // / CarouselOfColorMouseClickHandeler()



function ColorConformationMouseClickHandeler(selection){
    
    if(selection.type === 'button'){ // clicked on a button

        // Go Back button clicked
        if(selection.action == 'change scene' && selection.action_data == 1){
            SceneChange(1, 'Chromatron: Carousel of Color', 'Select the color that seems closest to your favorite color');
        }
        // Go Forward button clicked
        else if(selection.action == 'change scene' && selection.action_data == 3){
            SceneChange(3, 'Chromatron: Hue Going My Way?', 'Adjust the color until it\'s perfect, click the swatch when you are done.');
        }

    } // / clicked on a button
} // / ColorConformationMouseClickHandeler()


function HueGoingMyWayMouseClickHandeler(selection){
    
    if(selection.type === 'button'){ // clicked on a button

        // RGB color adjust button clicked
        if(selection.action == 'red' || selection.action == 'green' || selection.action == 'blue'){
            
            if(selection.action == 'red'){
                var color_channel = 0;
            }
            else if(selection.action == 'green'){
                var color_channel = 1;
            }
            else if(selection.action == 'blue'){
                var color_channel = 2;
            }
                        
            window.current_color[color_channel] += Number(selection.action_data);
            SceneChange(3, 'Chromatron: Hue Going My Way?', 'Adjust the color until it\'s perfect, click the swatch when you are done.');
        }

    } // / clicked on a button
    else if(selection.type === 'swatch button'){ // clicked the swatch button

        if(selection.action == 'change scene' && selection.action_data == 1){
            SceneChange(1, 'Chromatron: Carousel of Color', 'Select the color that seems closest to your favorite color');
        }
        // Scene 4 Chrom
        //SceneChange(4, 'Chromatron: Chro-my-goodness!!', '');
    }
} // / HueGoingMyWayMouseClickHandeler()




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
        var text_material = new THREE.MeshBasicMaterial({color: RGBColorToHex(color)});
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


function TextAsTexture(texture_color_start, texture_color_end, text_value, text_size, text_color, text_x, text_y){

    // convert [r,g,b] to #rrggbb
    if(Array.isArray(text_color)){
        
        var hex_string = '#';
        text_color.forEach(function(color){
           var hex = Number(color).toString(16); 
           if (hex.length < 2) { 
               hex = "0" + hex; 
            }
           hex_string = hex_string + hex;
        });
        
        text_color = hex_string;
    }
    
    var canvas = GenerateGradientTexture(texture_color_start, texture_color_end);
    var context = canvas.getContext('2d');
    context.font = text_size.toString() + 'px Pacifico';
    context.fillStyle = text_color;
    context.textBaseline = 'middle';
    context.fillText(text_value, text_x, text_y);

    return canvas;

} // / TextAsTexture()


function CubeButton(button_size, button_color_start, button_color_end, x, y, z, text_value, text_size, text_color, text_x = (512/2), text_y = (512/2), text_3D = false){

    var btn_geometry = new THREE.BoxGeometry(button_size, button_size, button_size);
    
    if(text_3D === true){
        var btn_texture = new THREE.Texture(GenerateGradientTexture(button_color_start, button_color_end));
    }
     else{
        var btn_texture = new THREE.Texture(TextAsTexture(button_color_start, button_color_end, text_value, text_size, text_color, text_x, text_y));
    }
    
    btn_texture.needsUpdate = true;
    var btn_material = new THREE.MeshBasicMaterial({color: button_color_start,
                                                        map: btn_texture});
        
    var btn = new THREE.Mesh(btn_geometry, btn_material);

    if(text_3D === true){
        // Add text to button faces
        Text(btn, text_value, text_color, text_size, 0, 0, button_size/2);
        Text(btn, text_value, text_color, text_size, 0, 0, button_size/2 * (1 * -1), 0, 3.15, 0);
        Text(btn, text_value, text_color, text_size, 0, button_size/2, 0, -89.5, 0, 0);
        Text(btn, text_value, text_color, text_size, 0,  button_size/2 * (1 * -1), 0, 89.5, 0);
        Text(btn, text_value, text_color, text_size, button_size/2, 0, 0, 0, 89.5, 0);
        Text(btn, text_value, text_color, text_size, button_size/2 * (1 * -1), 0, 0, 0, -89.5, 0);
    }
    
    btn.type = 'button';
    btn.position.x = x;
    btn.position.y = y;
    btn.position.z = z;
    
    return btn;
}

///////////////////////////////////
// / Other Functions             //
///////////////////////////////////