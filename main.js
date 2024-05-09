let orb_element = document.getElementById('orb');
let moomin_orb_element = document.getElementById('moomin-orb');

// Actual Image Dimensions
let image_width = 3680;
image_width = 1840; // smol
let image_height = 2458;
image_height = 1229; // smol

// Check the URL and load an alternate image if present
function load_vision() {
    // Load Image from GET Variable if present
    let GET = {};
    if(document.location.toString().indexOf('?') !== -1) {
        let query = document.location
                            .toString()
                            .replace(/^.*?\?/, '')
                            .replace(/#.*$/, '')
                            .split('&');
        for(let i = 0, l = query.length; i<l; i++) {
            let aux = decodeURIComponent(query[i]).split('=');
            GET[aux[0]] = aux[1];
        }
    }
    
    if('vision' in GET) { orb_element.style.backgroundImage = 'url("' + GET['vision'] + '")'; }
}

// Let user's load an image locally
function load_local_vision() {
    let input = document.createElement('input');
    input.type = "file";
    input.accept = "image/*";
    // Remove the animation to retrigger it
    orb_element.style.animationName = null;
    // Do something heinous to launder the fact we're loading a local file
    input.addEventListener("change", (e) => {
        console.log(e);
        if(e.target.files.length !== 0) {
            let img = e.target.files[0].name;
            let fr = new FileReader();
            fr.onload = function(ee) {
                orb_element.style.animationName = "orblurload";
                orb_element.style.backgroundImage = 'url("' + ee.target.result + '")';
            }
            fr.readAsDataURL(e.target.files[0]);
        }
    });

    input.click();
};

// Caculate the size and position of the image in the orb
function calculate_orb_position() {

    // Viewport dimensions
    let view_width = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    let view_height = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);

    // Determine how CSS is calculating `background: cover;`
    let scale_x = view_width / image_width;
    let scale_y = view_height / image_height;
    let bg_scale = Math.max(scale_x, scale_y); 

    // New image dimensions once prjected onto the viewport
    let projected_width = image_width * bg_scale | 0;
    let projected_height = image_height * bg_scale | 0;

    // How much  of the resized image to clip off the sides
    let top = (projected_height - view_height) / 2 | 0;
    let left = (projected_width - view_width) / 2 | 0;

    // Modify the Moomin-Space orb coordinates to match this new projection
    let projected_coords = transform_default_coordinates(scale_x, scale_y);

    // Use the new coordinates to calculate the absolute position on screen
    let absolute_view_coordinates = clipspace_to_absolute(view_height, view_width, projected_coords);

    // Update the Orb
    set_orb_styling(orb_element, absolute_view_coordinates);
}

// Transforms the Orb's relative coordinates compared to an unscaled, clipped Moomin-Orb image 
// to match the newly scaled Moomin-Orb image
function transform_default_coordinates(scale_x, scale_y) {
    let scale = Math.max(scale_x,scale_y);
    let ixs = 1 / scale_x; 
    let iys = 1 / scale_y;
    // Moomin-Space Coordinates of the Orb Image
    return {
        top: 0.26 * scale * iys,
        left: -0.45 * scale * ixs,
        bottom: -0.66 * scale * iys, 
        right: 0.35 * scale * ixs,
    };
}

// Sets the Orb Element's Styling based off absolute coordinates in view-space
function set_orb_styling(orb, coords) {
    orb.style.top = coords.top + 'px';
    orb.style.left = coords.left + 'px';
    orb.style.width = Math.abs(coords.left - coords.right) + 'px';
    orb.style.height = Math.abs(coords.top - coords.bottom) + 'px';
}

// Takes the view dimensions and a set of clip space coordinates and returns the absolute coordinates
function clipspace_to_absolute(vh, vw, coords) {
    return {
        top: (vh / 2) - (coords.top * (vh / 2)) | 0, 
        left: (vw / 2) + (coords.left * (vw / 2)) | 0,
        bottom: (vh / 2) - (coords.bottom * (vh / 2)) | 0,
        right: (vw / 2) + (coords.right * (vw / 2)) | 0,
    };
}

window.onload = function() {
    load_vision();
    calculate_orb_position();
};

window.onresize = function() {
    calculate_orb_position();
};

// Image Parallax
window.addEventListener('mousemove', function(e) {
    // Normalized 
    let px = ((e.clientX - window.innerWidth / 2) / window.innerWidth) * 2
    let py = ((e.clientY - window.innerHeight / 2) / window.innerHeight) *2;

    px *= -2;
    py *= -2;
    moomin_orb_element.style.transform = 'translateX(' + px + 'vw) translateY(' + py + 'vh)';

    px *= 2;
    py *= 2;
    orb_element.style.transform = 'translateX(' + px + 'vw) translateY(' + py + 'vh)';
});
