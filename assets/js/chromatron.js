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

window.ClipboardText = '';


///////////////////////////////////
// Scene Functions               //
///////////////////////////////////






//////////////////////////////////////////
//                                      //
//    Scene 0 : Main Menu               //
//                                      //
//////////////////////////////////////////
function MainMenu(){

    // Show the overlay "scene"
    document.getElementById("MainMenu").style.display = "block";
}

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
//    Scene 2 : Color Confirmation      //
//                                      //
//////////////////////////////////////////
function ColorConfirmation(){
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

}// / ColorConfirmation()


//////////////////////////////////////////
//                                      //
//    Scene 3 : Hue Going My Way        //
//                                      //
//////////////////////////////////////////
function HueGoingMyWay(){
    
    var swatch = document.getElementById('continueSwatchButtonHueGoingMyWay');
    
    if(window.current_color == null){
        var c = colors[window.base_color];
        window.current_color = [c[0], c[1], c[2]];
    }
    
    var swatch_text_color = [255,255,255];
    if((window.current_color[0] + window.current_color[1] + window.current_color[2]) > 382)
    {
        swatch_text_color = [0,0,0];
    }
        
    var swatch_text = 'R:'+window.current_color[0].toString() + ' '
                    + 'G:'+window.current_color[1].toString() + ' '
                    + 'B:'+window.current_color[2].toString();

    // Update swatch text
    swatch.innerHTML = swatch_text;
   
    // Update swatch text color
    swatch.style.color = 'rgb(' + swatch_text_color[0] + ',' + swatch_text_color[1] + ',' + swatch_text_color[2] + ')';

    // Update swatch color
    swatch.style.backgroundColor = 'rgb(' + window.current_color[0] + ',' + window.current_color[1] + ',' + window.current_color[2] + ')';
   
   
    // Display the color swatch button
    swatch.style.display = 'inline';

    // Add cube buttons
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



//////////////////////////////////////////
//                                      //
//    Scene 4 : Chro-my-goodness!!      //
//                                      //
//////////////////////////////////////////
function ChroMyGoodness(){
    
    var width = 300;
    var height = 950;
    var margin = 10;
    var row_size = 32;

    var canvas = document.getElementById("myFavoriteColor");
    var context = canvas.getContext("2d");
    
    // Make sure the canvas is large enough
    canvas.height = height;
    canvas.width = width;
    
    
    // Calculate RGB, HSL & Hex for the favorite color
    var fav_color_rgb = 'rgb('+window.current_color[0]+', '+window.current_color[1]+', '+window.current_color[2]+')';
    var fav_color_hsl = RGBToHSL([window.current_color[0],window.current_color[1], window.current_color[2]]);
    var fav_color_hex = RGBColorToHexString([window.current_color[0],window.current_color[1], window.current_color[2]]);
    var degrees =  360 / 12;
    
    // Calculate Analogous colors
    var analogous_colors = [];
     analogous_colors[0] = fav_color_hsl.slice();
    var h = RotateHue(fav_color_hsl[0], -degrees);
    analogous_colors[0][0] = h;
    analogous_colors[0] = RGBColorToHexString(HSLtoRGB(analogous_colors[0]));
    analogous_colors[1] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], degrees);
    analogous_colors[1][0] = h;
    analogous_colors[1] = RGBColorToHexString(HSLtoRGB(analogous_colors[1]));
    
    // Calculate complementary color
    var complementary_color_hex = RGBColorToHexString(ComplementaryRGBColor([window.current_color[0],window.current_color[1], window.current_color[2]]));

    // Calculate split complementary colors
    var split_complementary_colors = [];
     split_complementary_colors[0] = fav_color_hex;
    split_complementary_colors[1] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], -(degrees*5));
    split_complementary_colors[1][0] = h;
    split_complementary_colors[1] = RGBColorToHexString(HSLtoRGB(split_complementary_colors[1]));
    split_complementary_colors[2] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], (degrees*5));
    split_complementary_colors[2][0] = h;
    split_complementary_colors[2] = RGBColorToHexString(HSLtoRGB(split_complementary_colors[2]));

    // Calculate Triadic color
    var triadic_colors = [];
     triadic_colors[0] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], -(degrees*4));
    triadic_colors[0][0] = h;
    triadic_colors[0] = RGBColorToHexString(HSLtoRGB(triadic_colors[0]));
    triadic_colors[1] = fav_color_hex;    
    triadic_colors[2] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], (degrees*4));
    triadic_colors[2][0] = h;
    triadic_colors[2] = RGBColorToHexString(HSLtoRGB(triadic_colors[2]));

    // Calculate Tetradic color
    var tetradic_colors = [];
    tetradic_colors[0] = fav_color_hex;    
     tetradic_colors[1] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], (degrees*2));
    tetradic_colors[1][0] = h;
    tetradic_colors[1] = RGBColorToHexString(HSLtoRGB(tetradic_colors[1]));
    tetradic_colors[2] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], (degrees*6));
    tetradic_colors[2][0] = h;
    tetradic_colors[2] = RGBColorToHexString(HSLtoRGB(tetradic_colors[2]));
    tetradic_colors[3] = fav_color_hsl.slice();
    h = RotateHue(fav_color_hsl[0], -(degrees*4));
    tetradic_colors[3][0] = h;
    tetradic_colors[3] = RGBColorToHexString(HSLtoRGB(tetradic_colors[3]));

    // Calc above
    
    //Store colors as text string for copy to clipboard.
    window.ClipboardText = 'Your Favorite Color:\n'
    window.ClipboardText += 'RGB: ' + window.current_color[0]+', '+window.current_color[1]+', '+window.current_color[2] + '\n';
    window.ClipboardText += 'HSL: ' + fav_color_hsl[0].toFixed(3)+', '+(fav_color_hsl[1] * 100).toFixed(1) + '%'+', '+(fav_color_hsl[2] * 100).toFixed(1) + '%\n';
    window.ClipboardText += 'HEX: ' + fav_color_hex + '\n';
    window.ClipboardText += 'Analogous Colors: ' + analogous_colors[0] + ', ' + analogous_colors[1] + '\n';
    window.ClipboardText += 'Split Complementary Colors: ' + split_complementary_colors[0] + ', ' + split_complementary_colors[1] + ', ' + split_complementary_colors[2] + '\n';
    window.ClipboardText += 'Triadic Colors: ' + triadic_colors[0] + ', ' + triadic_colors[1] + ', ' + triadic_colors[2] + '\n';
    window.ClipboardText += 'Tetradic Colors: ' + tetradic_colors[0] + ', ' + tetradic_colors[1] + ', ' + tetradic_colors[2] + '\n';
    window.ClipboardText += '\n\nChromatron: https://geekgirljoy.github.io/Chromatron/\n';
    window.ClipboardText += 'Created By: https://geekgirljoy.wordpress.com/';
    
    // Draw below
    
    // Create background
    context.fillStyle = '#000000';
    context.fillRect(0, 0, 300, height);
        
    // Create "Your Favorite Color" swatch
    context.fillStyle = fav_color_rgb;
    context.fillRect(margin,margin,width - (margin * 2), 50);

    // Create Labels
    context.fillStyle = '#ffffff';
    context.font = "16px Arial";
    context.fillText("RGB", margin, (row_size * 3));
    context.fillText('('+window.current_color[0]+', '+window.current_color[1]+', '+window.current_color[2]+')', margin+120, (row_size * 3));
    context.fillText("HSL", margin, (row_size * 4));
    context.fillText('('+fav_color_hsl[0].toFixed(3)+', '+(fav_color_hsl[1] * 100).toFixed(1) + '%'+', '+(fav_color_hsl[2] * 100).toFixed(1) + '%)', margin+80, (row_size * 4));
    context.fillText("HEX", margin, (row_size * 5));
    context.fillText(fav_color_hex, margin+140, (row_size * 5));
    context.fillText("Gradients", 115, (row_size * 6));  
    context.fillText("Gradient to White", margin, (row_size * 7));
    context.fillText("Gradient to Black", margin, (row_size * 8));
    context.fillText("Analogous Colors", 85, (row_size * 9));
    context.fillText(analogous_colors[0], margin, (row_size * 10));
    context.fillText(analogous_colors[1], margin, (row_size * 11));
    context.fillText("Complementary Color", 65, (row_size * 12));
    context.fillText(complementary_color_hex, margin, (row_size * 13));
    context.fillText("Split Complementary Colors", 45, (row_size * 14));
    context.fillText(split_complementary_colors[0], margin, (row_size * 15));
    context.fillText(split_complementary_colors[1], margin, (row_size * 16));
    context.fillText(split_complementary_colors[2], margin, (row_size * 17));
    context.fillText("Triadic Colors", 95, (row_size * 18));
    context.fillText(triadic_colors[0], margin, (row_size * 19));
    context.fillText(triadic_colors[1], margin, (row_size * 20));
    context.fillText(triadic_colors[2], margin, (row_size * 21));
    context.fillText("Tetradic Colors", 90, (row_size * 22));
    context.fillText(tetradic_colors[0], margin, (row_size * 23));
    context.fillText(tetradic_colors[1], margin, (row_size * 24));
    context.fillText(tetradic_colors[2], margin, (row_size * 25));
    context.fillText(tetradic_colors[3], margin, (row_size * 26));
    context.fillText("https://geekgirljoy.github.io/Chromatron/", margin, (row_size * 28));
    context.fillText("https://geekgirljoy.wordpress.com/", margin+20, (row_size * 29));


    // Create Swatches
    // Gradient fav -> white swatch
    var grd = context.createLinearGradient(150,(row_size * 7) - 20, 300,width - (margin * 2));
    grd.addColorStop(0, fav_color_rgb);
    grd.addColorStop(1,"white");
    context.fillStyle = grd;
    context.fillRect(150,(row_size * 7) - 20,140,30);
      
    // Gradient fav -> black swatch
    grd = context.createLinearGradient(150,(row_size * 8) - 20, 300,width - (margin * 2));
    grd.addColorStop(0, fav_color_rgb);
    grd.addColorStop(1,"black");
    context.fillStyle = grd;
    context.fillRect(150,(row_size * 8) - 20,140,30);
  
    // Analogous colors swatches
    context.fillStyle = analogous_colors[0];
    context.fillRect(150,(row_size * 10)-20,140,30);
    context.fillStyle = analogous_colors[1];
    context.fillRect(150,(row_size * 11)-20,140,30);
    
    // Complementary color swatch
    context.fillStyle = complementary_color_hex;
    context.fillRect(150,(row_size * 13)-20,140,30);
        
    // Split complementary colors swatches
    context.fillStyle = split_complementary_colors[0];
    context.fillRect(150,(row_size * 15)-20,140,30);
    context.fillStyle = split_complementary_colors[1];
    context.fillRect(150,(row_size * 16)-20,140,30);
    context.fillStyle = split_complementary_colors[2];
    context.fillRect(150,(row_size * 17)-20,140,30);        
    
    // Triadic colors swatches
    context.fillStyle = triadic_colors[0];
    context.fillRect(150,(row_size * 19)-20,140,30);
    context.fillStyle = triadic_colors[1];
    context.fillRect(150,(row_size * 20)-20,140,30);
    context.fillStyle = triadic_colors[2];
    context.fillRect(150,(row_size * 21)-20,140,30);
    
    // Tetradic colors swatches
      context.fillStyle = tetradic_colors[0];
    context.fillRect(150,(row_size * 23)-20,140,30);
    context.fillStyle = tetradic_colors[1];
    context.fillRect(150,(row_size * 24)-20,140,30);
    context.fillStyle = tetradic_colors[2];
    context.fillRect(150,(row_size * 25)-20,140,30);
    context.fillStyle = tetradic_colors[3];
    context.fillRect(150,(row_size * 26)-20,140,30);
    
    // Horizontal ruler
    context.beginPath();
    context.strokeStyle = '#ffffff';
    context.moveTo(margin, (row_size * 27));
    context.lineTo(width - margin, (row_size * 27));
    context.stroke(); 

    // Make sure the download button points to the canvas data
    var download_link = document.getElementById('downloadImageButton');
    download_link.setAttribute('download', 'MyFavoriteColor.png');
    download_link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));

    // Show the overlay "scene"
    document.getElementById("ChroMyGoodness").style.display = "block";
} // / ChroMyGoodness()


//////////////////////////////////////////
//                                      //
//    Scene 5 : Select Images           //
//                                      //
//////////////////////////////////////////

function SelectImages(){

    // Show the overlay "scene"
    document.getElementById("SelectImages").style.display = "block";
}


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
    else if(window.current_scene === 2){ // Color Confirmation 
    
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
    if(scene_number === 0){
        MainMenu();
    }
    if(scene_number === 1){
        CarouselOfColor();
    }
    else if(scene_number === 2){
        ColorConfirmation();
    }
    else if(scene_number === 3){
        HueGoingMyWay();
    }
    else if(scene_number === 4){
        ChroMyGoodness();
    }
    else if(scene_number === 5){
        SelectImages();
    }

} // / SceneChange()

function ClearScene(){

    // Okay look this isn't the "best" way to do this but... well, it works and this is just a prototype :-P
    document.getElementById("MainMenu").style.display = "none";
    document.getElementById("ChroMyGoodness").style.display = "none";
    document.getElementById("SelectImages").style.display = "none";
    document.getElementById('continueSwatchButtonHueGoingMyWay').style.display = "none";

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
        
        // Show a pointer when appropriate  
        if(selection.type === 'button' 
           || selection.type === 'carousel' 
           || selection.type === 'swatch button'){
            document.body.style.cursor = 'pointer';
        }
                
        window.highlighted_objects = []; // Purge previous selection
        window.highlighted_objects.push(selection); // Add new selection
        
        // Update the renderer with the new selection
        outline_pass.selectedObjects = window.highlighted_objects;
    }
    else{
        
        document.body.style.cursor = 'default';
        
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
            ColorConfirmationMouseClickHandeler(selection);
        }
        else if(window.current_scene === 3){
            HueGoingMyWayMouseClickHandeler(selection);
        }
        /*
        else if(window.current_scene === 4){
            // No Raycasting for Scene 4 - Chro-my-goodness
        }
        else if(window.current_scene === 5){
            // No Raycasting for Scene 5 - SelectImages
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
        
        SceneChange(2, 'Chromatron: Color Confirmation', 'Continue with this color?');
        
    } // / clicked the carousel
    
} // / CarouselOfColorMouseClickHandeler()



function ColorConfirmationMouseClickHandeler(selection){
    
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
} // / ColorConfirmationMouseClickHandeler()


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

        if(selection.action == 'change scene' && selection.action_data == 4){
            SceneChange(4, 'Chromatron: Chro-my-goodness!!', 'Chro-my-goodness that\'s a great color!');
        };
    }
} // / HueGoingMyWayMouseClickHandeler()


// ChroMyGoodness Buttons / "Mouse Functions"
export function CopyToClipboard() {
    
    var Clipboard = document.createElement('textarea');
    Clipboard.value = window.ClipboardText;
    Clipboard.setAttribute('readonly', '');  
    document.body.appendChild(Clipboard);
    Clipboard.select();
    Clipboard.setSelectionRange(0, 99999); // mobile
    document.execCommand('copy');
    document.body.removeChild(Clipboard);
    
    alert('Copied!\n\n' + window.ClipboardText);
}
// / ChroMyGoodness Buttons / "Mouse Functions"



///////////////////////////////////
// / Mouse Functions             //
///////////////////////////////////


///////////////////////////////////
// Color Functions               //
///////////////////////////////////


function RGBColorToHex(rgb_array){

   var hex_string = 0x00;
    
    rgb_array.forEach(function(color){
           
           var hex = Number(color).toString(16); 
           if (hex.length < 2){ 
               hex = "0" + hex; 
            }
           
           hex_string = hex_string + hex;
    });
    
    return parseInt(hex_string, 16);
} // / RGBColorToHex()

function RGBColorToHexString(rgb_array) {

   var hex_string = '';
   
   rgb_array.forEach(function(color){
           
           var hex = Number(color).toString(16); 
           if (hex.length < 2){ 
               hex = "0" + hex; 
            }
           
           hex_string = hex_string + hex;
    });

    return "#" + hex_string;
} // / RGBColorToHexString()




// Complementary / Opposite
// Based on the information available here:
// https://en.wikipedia.org/wiki/Complementary_colors
// Complementary colors are pairs of colors which, 
// when combined or mixed, cancel each other out (lose hue) 
// by producing a grayscale color like white or black.
function ComplementaryRGBColor(rgb_array){
    // white minus this color = Complementary / Opposite 
    var color_r = 255 - rgb_array[0];
    var color_g = 255 - rgb_array[1];
    var color_b = 255 - rgb_array[2];

    return [color_r, color_g, color_b];
} // / ComplementaryRGBColor()
//console.log(ComplementaryRGBColor([0,0,0])); // [255, 255, 255]




// RGB Array [r,g,b] to HSL Array
// Based on the information available here:
// https://en.wikipedia.org/wiki/HSL_and_HSV
function RGBToHSL(rgb_array){

   var color = [];

   // Convert the 0 - 255 values to a range of 0 - 1
   color['red'] = rgb_array[0] / 255;
   color['green'] = rgb_array[1] / 255;
   color['blue'] = rgb_array[2] / 255;
  
   // Find the largest and smallest color values
   color['max'] = Math.max.apply(Math,[color['red'], color['green'], color['blue']])
   color['min'] = Math.min.apply(Math,[color['red'], color['green'], color['blue']])
      

   // Compute Chroma 
   // The distance from the center of the HSL hexagonal color model to the color
   // This is the magnitude of the vector pointing to the color. 
   color['chroma'] = color['max'] - color['min'];
     
   // Compute Lightness 
   //  The average of the brightest and darkest color channels
   color['lightness'] = (color['max'] + color['min']) / 2;
   
  
  // No Calculation Needed
  if(color['chroma'] === 0){
      color['hue'] = 0;
      color['saturation'] = 0;
  }
  else{

      // Calculate Saturation
      if(color['lightness'] === 0 || color['lightness'] === 1){
          color['saturation'] = 0;
      }else{
          color['saturation'] = color['chroma'] / (1 - Math.abs(2 * color['lightness'] - 1));
      }


      // Calculate Hue
      // This is the angle of the vector pointing to the color. 
      if(color['max'] === color['red']){
          color['hue'] = (60 * ((color['green'] - color['blue']) / color['chroma']) + 0) % 360;
          if(color['hue'] < 0){
              color['hue'] += 360;
          }
        
      }
      else if(color['max'] === color['green']){
          color['hue'] = (60 * ((color['blue'] - color['red']) / color['chroma']) + 120) % 360;
      }
    
      else if(color['max'] === color['blue']){
          color['hue'] = (60 * ((color['red'] - color['green']) / color['chroma']) + 240) % 360;
      }
  }


  // Return RGB() -> HSL()
  return [color['hue'], color['saturation'], color['lightness']]; 
} // / RGBToHSL()
//console.log(RGBToHSL([128,0,0])); // [0, 1, 0.25098039215686274];



// HSL Array [h,s,l] to RGB Array
// Based on the information available here:
// https://en.wikipedia.org/wiki/HSL_and_HSV
function HSLtoRGB(hsl_array){
  
    var color = [];
    
    // Compute Chroma, Hue prime and Chi
    color['chroma'] = (1 - Math.abs((2 * hsl_array[2]) - 1)) * hsl_array[1];
    color['hue_prime'] = (hsl_array[0] / 60);
    color['chi'] = color['chroma'] * (1 - Math.abs( color['hue_prime'] % 2 - 1));    
     
    // Zero out the RGB Color Channels
    color['red'] = 0;
    color['green'] = 0;
    color['blue'] = 0;
    
    // Determine where this color is in the HSL color space
    // update RGB color channels accordingly
    if(0 <= color['hue_prime'] && color['hue_prime'] <= 1){
        color['red'] = color['chroma'];
        color['green'] = color['chi'];
    }
    else if(1 <= color['hue_prime'] && color['hue_prime'] <= 2){
        color['red'] = color['chi'];
        color['green'] = color['chroma'];
    }
    else if(2 <= color['hue_prime'] && color['hue_prime'] <= 3){
        color['green'] = color['chroma'];
        color['blue'] = color['chi'];
    }
    else if(3 <= color['hue_prime'] && color['hue_prime'] <= 4){
        color['green'] = color['chi'];
        color['blue'] = color['chroma'];
    }
    else if(4 <= color['hue_prime'] && color['hue_prime'] <= 5){
        color['red'] = color['chi'];
        color['blue'] = color['chroma'];
    }
    else if(5 <= color['hue_prime'] && color['hue_prime'] <= 6){
        color['red'] = color['chroma'];
        color['blue'] = color['chi'];
    }
    
    // Determine color lightness magnitude
    color['magnitude'] = hsl_array[2] - (color['chroma'] / 2);
    
    // Adjust the lightness of the RGB channels
    color['red'] = (color['red'] + color['magnitude']) * 255;
    color['green'] = (color['green'] + color['magnitude']) * 255;
    color['blue'] = (color['blue'] + color['magnitude']) * 255;
    
    // Return HSL() -> RGB()
    return [Math.round(color['red']), Math.round(color['green']), Math.round(color['blue'])];
} // / HSLtoRGB()
//console.log(HSLtoRGB([0, 1, 0.25098039215686])); // [128,0,0];



function RotateHue(hue, degrees){
        
    hue += degrees;
    
     // rotate around
    if(hue < 0){
        hue += 360;
    }
    if(hue > 360){
        hue -= 360;
    }
    return hue;
}
//console.log(RotateHue(0, -20)); // 340

///////////////////////////////////
// / Color Functions             //
///////////////////////////////////



///////////////////////////////////
// Other Functions               //
///////////////////////////////////


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
        Text(btn, text_value, text_color, text_size, 0, button_size/2 * (1 * -1), 0, 89.5, 0);
        Text(btn, text_value, text_color, text_size, button_size/2, 0, 0, 0, 89.5, 0);
        Text(btn, text_value, text_color, text_size, button_size/2 * (1 * -1), 0, 0, 0, -89.5, 0);
    }
    
    btn.type = 'button';
    btn.position.x = x;
    btn.position.y = y;
    btn.position.z = z;
    
    return btn;
} // / CubeButton()


///////////////////////////////////
// / Other Functions             //
///////////////////////////////////




///////////////////////////////////
//  Image Functions              //
///////////////////////////////////

export function LoadCompareImage(input, canvas){
    canvas = document.getElementById(canvas);
    var context = canvas.getContext('2d');
    input = document.getElementById(input);

    var file = new FileReader();
    file.onload = function(event){
        var image = new Image();
        image.onload = function(){
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image,0,0);
        }
        image.src = event.target.result;
        
        
    } 
    file.readAsDataURL(input.files[0]);     
} // / LoadCompareImage()



export function SelectPixelColorFromImage(event, swatch_label){
    
    // Where the image is
    var canvas = document.getElementById(event.target.id);
    var context = canvas.getContext('2d');
    var rect = canvas.getBoundingClientRect();
    
    // Where the mouse is
    var x = event.clientX - rect.left; 
    var y = event.clientY - rect.top; 

    // The canvas has a max-height & max-width css property making the
    // mouse position not be the X & Y of the canvas in relation to the image dimensions
    // so we need to figure out how much smaller the image is inside the canvas
    var horizontal_ratio = canvas.width / canvas.offsetWidth;
    var vertical_ratio = canvas.height / canvas.offsetHeight;
    x = Math.round(x*horizontal_ratio);
    y = Math.round(y*vertical_ratio);
    
    // Get the pixel color as an RGBA array
    var rgba = context.getImageData(x, y, 1, 1).data;
    
    // Store the color as a SelectedColor property
    // on the canvas element, cuz... why not?
    canvas.SelectedColor = rgba;
    
    // Update the label swatch color
    document.getElementById(swatch_label).style.backgroundImage = 'linear-gradient('+ 'rgb('+rgba[0] + ',' + rgba[1] + ',' + rgba[2] + ')' + ', ' + 'black)';
} // / SelectPixelColorFromImage()


///////////////////////////////////
// / Image Functions             //
///////////////////////////////////
