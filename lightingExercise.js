/* lightingExercise.js
//	
//	Written by John Bell for CS 425, Fall 2021
    
    Simple moving sphere and moving light source to test lighting.
    
*/

// Globals are evil, but necessary when callback functions are used

// Object-independent variables
var gl;				// WebGL graphics environment
var program;		// The shader program
var aspectRatio;	// Aspect ratio of viewport

var uViewXform;		// The camera view transformation matrix

// Object-related variables
var theSphere;		// Colored Sphere object
var theWhiteSphere;	// White sphere, marking the light location
var theAxes;		// Axes object
var cone;
var cone2;

// Initialization function runs whenever the page is loaded

window.onload = function init( ) {
	
	var nLat = 15;		// Number of latitudinal sectors in the sphere
	var nLong = 20;		// Number of longitudinal sectors in the sphere
	
	// Set up the canvas, viewport, and clear color

	var canvas = document.getElementById( "gl-canvas" );
	gl=WebGLUtils.setupWebGL( canvas );
	if( !gl ) {
		alert( "No WebGL" );
	}
	
	gl.viewport( 0, 0, canvas.width, canvas.height );
	aspectRatio = canvas.width / canvas.height ;
	gl.clearColor( 0.5, 0.5, 0.5, 1.0 );
	
	// Load the shaders, create a GLSL program, and use it.
	program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Next the objects.  
	theAxes = new Axes( gl, program );
	theSphere = new Sphere( gl, program, nLat, nLong, [ 1.0, 0.5, 0.0 ] ); // An orange sphere
	//theSphere = new Sphere( gl, program, nLat, nLong, 0 ); // set color to 0 for random colors
	theWhiteSphere = new Sphere( gl, program, 5, 9, [ 1.0, 0, 1.0 ] ); // Crude marker
	cone = new Cone(gl, 10, [1,0,0], program);
	cone2 = new Cone(gl, 10, [0,1,0], program);
	
	gl.enable( gl.DEPTH_TEST );	
	
	// Initialize some things in the GPU.  Some are just placeholders until replaced.
	
	// Create the view transform, viewXform, using lookAt( eye, at, up );
	// Push it to the GPU as a uniform variable.
	uViewXform = lookAt( vec3( 10, 5, 10 ), vec3( 0, 0, 0 ), vec3( 0, 1, 0 ) );
	var uViewXformLoc = gl.getUniformLocation( program, "uViewXform" );
	gl.uniformMatrix4fv( uViewXformLoc, false, flatten( uViewXform ) );
	
	// Create the 3D to 2D projection matrix using perspective( ) and send it to the GPU
	
	var uProjection = perspective( 60, aspectRatio, 0.1, 100.0 );
	var uProjectionLoc = gl.getUniformLocation( program, "uProjection" );
	gl.uniformMatrix4fv( uProjectionLoc, false, flatten( uProjection ) );
	
	// Set the model transformation matrix, uModelXform, as a mat4 Identity matrix and send it to the GPU
	
	var uModelXform = mat4( );
	var uModelXformLoc = gl.getUniformLocation( program, "uModelXform" );
	gl.uniformMatrix4fv( uModelXformLoc, false, flatten( uModelXform ) );
	
	// Set the normal transformation matrix, uNormalXform as a mat3 Identity matrix and send it to the GPU
	
	var uNormalXform = mat3();
	var uNormalXformLoc = gl.getUniformLocation( program, "uNormalXform" );
	gl.uniformMatrix3fv( uNormalXformLoc, false, flatten( uNormalXform ) );
	
	// Set the lightposition as a vec3 at the origin and send it to the GPU
	
	var uLightPosition = vec4( 1.0, 0.5, 1.0, 0 );
	var uLightPositionLoc = gl.getUniformLocation( program, "uLightPosition" );
	gl.uniform3fv( uLightPositionLoc, flatten( uLightPosition ) );
	
	// Set the gouraud flag to zero and send it to the GPU
	
	var uGouraudLoc = gl.getUniformLocation( program, "uGouraud" );
	gl.uniform1iv( uGouraudLoc, [ 0 ] );

	// Set the phong flag to zero and send it to the GPU

	// var uPhongLoc = gl.getUniformLocation( program, "uPhong");
	// gl.uniform1iv( uPhong, [ 0 ])
	
	// Initialization is done.  Now initiate first rendering
	render( );
}

var time = 0;

function render( ) {
	
	
	// Clear out the color buffers and the depth buffers.
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	
	// Get uniform locations once
	
	var uModelXformLoc = gl.getUniformLocation( program, "uModelXform" );
	var uLightPositionLoc = gl.getUniformLocation( program, "uLightPosition" );
	var uNormalXformLoc = gl.getUniformLocation( program, "uNormalXform" );
	var uGouraudLoc = gl.getUniformLocation( program, "uGouraud" );
	
	// First to set the light position, before drawing anything
	// "Translate" the origin, and extract the vec3 position
	// The transformation is the same as for the small white sphere to follow
	// ( Scaling doesn't apply to light position, but it will for the marker that goes with it. )
	
	var uModelXform = mult( rotateY( 0.42 * time ), mult( translate( 7.0, 2.5, 0.0 ),  scalem( 0.25, 0.25, 0.25 )  ) );
	
	var uLightPosition = vec3( mult( uModelXform, vec4( 0.0, 0.0, 0.0, 1.0 ) ) );
	gl.uniform3fv( uLightPositionLoc, flatten( uLightPosition ) );
	
	// Now to draw the objects
	
	// The small white sphere and the axes will not use shading
	gl.uniform1iv( uGouraudLoc, [ 0 ] );
	
	// First the small white sphere representing the light, as it uses the same transformation as the light
	
	gl.uniformMatrix4fv( uModelXformLoc, false, flatten( uModelXform ) );
	theWhiteSphere.render( );
	
	// Next the world axes, at the origin.  Scale by 10
	
	uModelXform = scalem( 10.0, 10.0, 10.0 );
	gl.uniformMatrix4fv( uModelXformLoc, false, flatten( uModelXform ) );
	theAxes.render( );
	
	// Next the sphere, rotating around the origin in the X-Z plane
	// Turn on gouraud shading for this object
	
	gl.uniform1iv( uGouraudLoc, [ 1 ] );

	uModelXform = mult( translate( 5.0, 4.0, 0.0 ),  scalem( 1.0, 1.0, 2.0 )  );
	gl.uniformMatrix4fv(uModelXformLoc, false, flatten(uModelXform ) );
	cone.render();

	uModelXform = mult( translate( 0, 4.0, 5.0 ),  scalem( 1.0, 1.0, 2.0 )  );
	gl.uniformMatrix4fv(uModelXformLoc, false, flatten( uModelXform ) );
	cone2.render();
	
	uModelXform = mult( rotateY( -time ), mult( translate( 5.0, 0.0, 0.0 ),  scalem( 1.0, 1.0, 2.0 )  ) );
	gl.uniformMatrix4fv( uModelXformLoc, false, flatten( uModelXform ) );
	
	// The normal matrix is a function of the object transformation.  Calculate that and send it too.
	
	gl.uniformMatrix3fv( uNormalXformLoc, false, flatten( calcNormalMatrix( uViewXform, uModelXform ) ) );

	theSphere.render( );

	time += 0.5;

	requestAnimFrame( render );
	
}

/*  When an object is transformed, the object normals are also transformed, but not in exactly the same way.
    Translation and uniform scaling don't affect normals, but rotation and non-uniform scaling do.
	The goal is to have the same angle between the transformed normals and the transformed eye and light vectors
	in eye coordinate space.  See derivation in pages 309-310 of Angel.
	
	The result is that the necessary normalMatrix is the inverse of the transform of the upper left 3x3 submatrix
	of the product of "modelView", where modelView is the product of viewXform times modelXform.
*/

/* NOTE:  It is reccomended to incorporate the following code into a "sendTransformsToShader( )" function or
		  something like it, so that every time the Model or View transformation matrices are updated, the 
		  normal matrix is automatically updated at the same time.
*/

function calcNormalMatrix( viewXform, modelXform ) {
	var modelView =( mult( viewXform, modelXform ) );
	var N = mat3( );
	for( var i = 0; i < 3; i++ )
		for( var j = 0; j < 3; j++ )
			N[ i ][ j ] = modelView[ i ][ j ];
	return transpose( inverse3( N ) );
}
