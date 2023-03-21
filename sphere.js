/* Sphere.js

   Written by John Bell for CS 425 Fall 2020.  Last modified Spring 2023
   
   This program draws a sphere, using triangle fans at top and bottom and triangle strips in the middle.
   
   Inspired by Section 2.4.3 in "Interactive Computer Graphics" by Edward R. Angel
*/


// The following parameters are passed in to the constructor:

//var gl;			// A WebGLRenderingContext
//var program;		// The shaders program
//var nLong;		// Number of longitudinal sections ( points around equator )
//var nLat;			// Number of latitudinal sections ( top to bottom, including two fans and nLat - 2 strips
//var color;		// A solid colored sphere if this color is valid.  Otherwise random colors for each vertex.

class Sphere { 

	constructor( gl, program, nLat, nLong, color ) {
		
		this.program = program;
		this.gl = gl;
		this.nLat = nLat;
		this.nLong = nLong;
		
		var positions = [ ];	// Vertex position data 
		var colors    = [ ];	// Vertex color data
		
		var validColor = false;
		
		if ( Array.isArray( color ) && color.length == 3 
			&& color[0] >= 0 && color[1] >= 0 && color[2] >=0
			&& color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {
				validColor = true;
		}
		
		// All the colors can be calculated in a single loop
		// Top and bottom fans require 2 * ( ( nLong + 1 ) + 1 )
		// Strips require ( nLat - 2 ) * ( 2 * ( nLong + 1 ) )
		for( var i = 0; i < 2 * ( nLong + 1 ) * ( nLat - 1 ) + 2; i++ ) {
			if( validColor )
				colors.push( vec3( color ) );
			else
				colors.push( vec3( Math.random( ), Math.random( ), Math.random( ) ) );
		}
	
		// Now to generate the vertex coordinates

		var R = 1.0;			// Radius of the sphere
		var phi = 0.0;			// "Vertical" angle. 0 = straight up, PI = straight down
		var theta = 0.0;		// "horizontal" angle, circular around the "equator"
		
		// Top triangle fan, starting with the "North Pole"
		
		positions.push( vec3( 0.0, R, 0.0 ) ); // Top of sphere
		
		phi =  Math.PI / nLat;
		var rSinPhi = R * Math.sin( phi );		// Height above equator
		var rCosPhi = R * Math.cos( phi );		// Radius of a horizontal section at height rSinPhi
		var dTheta = 2.0 * Math.PI / nLong;		// Increment around circle for each point
	
		for( var i = 0; i < nLong + 1; i++ ) {	// Loop around the circle
			theta = i * dTheta;
			positions.push( vec3(  rSinPhi * Math.cos( theta ), rCosPhi, rSinPhi * Math.sin( theta ) ) );
		} // Loop for top triangle fan.
		
		// Bottom triangle fan, starting with the "South Pole"
		
		positions.push( vec3( 0.0, -R, 0.0 ) ); // Bottom of sphere
	
		for( var i = 0; i < nLong + 1; i++ ) {	// Loop around the circle
			theta = i * dTheta;
			positions.push( vec3(  rSinPhi * Math.cos( theta ), -rCosPhi, rSinPhi * Math.sin( theta ) ) );
		} // Loop for bottom triangle fan.
	
		// Now for the center strips
		// To use triangle strips, two rows of points need to be interleaved.
		
		var phi1, phi2, rSinPhi1, rSinPhi2, rCosPhi1, rCosPhi2;	// Top and bottom of strip variables.
		var dPhi = Math.PI / nLat;	// Increment "down" the sphere, from top to bottom
		
		for( var i = 0; i < nLat - 2; i++ ) {	// Loop through strips
		
			phi1 = ( i + 1 ) * dPhi;		// Calc trig functions of phi once only per strip.
			phi2 = phi1 + dPhi;
			rSinPhi1 = R * Math.sin( phi1 );
			rCosPhi1 = R * Math.cos( phi1 );
			rSinPhi2 = R * Math.sin( phi2 );
			rCosPhi2 = R * Math.cos( phi2 );
			
			for( var j = 0; j < nLong + 1; j++ ) {	// Loop around circles
			
				theta = j * dTheta;
				
				// First a point on the top edge of the strip
				positions.push( vec3(  rSinPhi1 * Math.cos( theta ), -rCosPhi1, rSinPhi1 * Math.sin( theta ) ) );
				
				// Then a corresponding point on the bottom edge of the strip
				positions.push( vec3(  rSinPhi2 * Math.cos( theta ), -rCosPhi2, rSinPhi2 * Math.sin( theta ) ) );
				
			} // Loop for points on a single strip
		} // loop through strips

		// Push Vertex Location Data to GPU
		
		this.vBufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( positions ), gl.STATIC_DRAW );
		
		// Push Vertex Color Data to GPU
		
		this.cBufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW );
		
		// Unbind the buffer, for safety sake.
		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
	} // Constructor

	render( ) {
		
		var gl = this.gl;
		var nLat = this.nLat;
		var nLong = this.nLong;
		
		// Attach the data in the buffers to the variables in the shaders
		
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferID );
		var vPositionLoc = gl.getAttribLocation( this.program, "vPosition" );
		gl.vertexAttribPointer( vPositionLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPositionLoc );
		
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferID );
		var vColorLoc = gl.getAttribLocation( this.program, "vColor" );
		gl.vertexAttribPointer( vColorLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColorLoc );
		
		// ( For the special case of a unit sphere centered at the origin,
		//   the positions data could also be pushed to the vNormal shader variable. )
		
		// Draw points and lines for diagnostic and explanatory purposes
		// var nPoints = 2 * ( nLong + 1 ) * ( nLat - 1 ) + 2;
		//gl.drawArrays( gl.POINTS, 0, nPoints );
		//gl.drawArrays( gl.LINE_LOOP, 0, nPoints );
	
		// Now draw the top and bottom fans.
		// Last two arguments are the index of the first data point to use, and the number of points to draw
		// Note that the last point in the "circle" is the same as the first, hence nLong + 1 points / circle.
		
		gl.drawArrays( gl.TRIANGLE_FAN, 0, nLong + 2 );
		gl.drawArrays( gl.TRIANGLE_FAN, nLong + 2, nLong + 2 );
		
		// And finally to draw the middle strips
		// For each strip, skip over the vertices for the two fans, plus preceding strips
		// Each strip has nLong + 1 vertices per circle, times two circles per strip
		
		for( var i = 0; i < nLat - 2; i++ ) {
			var firstIndex = 2 * ( nLong + 2 ) + i * ( 2 * ( nLong + 1 ) ) ; 
			gl.drawArrays( gl.TRIANGLE_STRIP, firstIndex, 2 * ( nLong + 1 ) );
		}
		
	} // render
	
} // sphere class