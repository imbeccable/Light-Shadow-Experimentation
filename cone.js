/* cone.js
	
	Written by John Bell for CS 425, Fall 2020
	Last revised Spring 2023 by John Bell
	Modified by Becca Nika

    
    This file contains code to create and draw a unit cone, centered at the origin.
	
	Many steps are incomplete and/or commented out for exercise purposes.
    
*/

// Globals are evil.  We won't use any here. :-)

class Cone{ 

	constructor( gl, nSectors, color, program ) {
		
		// Save gl, program, and nSectors as instance variables for use by render( )
		this.gl = gl;
		this.program = program;
		this.nSectors = nSectors;
		
		var positions = [ ];	// Vertex location data 
		var normals = [ ];
		var colors    = [ ];	// Vertex color data
		
		// If the color passed in is invalid, then we will use random colors later.
		
		var validColor = false;
		
		if ( Array.isArray( color ) && color.length == 3 
			&& color[0] >= 0 && color[1] >= 0 && color[2] >=0
			&& color[0] <= 1 && color[1] <= 1 && color[2] <=1 ) {
			
			validColor = true;
																 
		}
	
		// Generate Points and Colors
		
		// TODO 3 - push vec3s into the colors array for each vertex.
		// If the passed color is valid, use it to make a vec3.  
		// Otherwise use calls to Math.random( ).
		// This object uses one vertex at the point and nSectors + 1 around the base.
		
		for( var i = 0; i < nSectors + 2; i++ ) {
			if( validColor ) {
				// Push the passed-in valid color here, as a vec3
				colors.push(color);
			} else {
				// Push a random color here, as a vec3 
				colors.push(vec3(Math.random(), Math.random(), Math.random()));
			}
		}
		
		// Then the vertex locations, starting with the apex

		var R = 1.0;			// Radius of the sphere
		var phi = 0.0;			// "Vertical" angle. 0 = straight up, PI = straight down
		var theta = 0.0;		// "horizontal" angle, circular around the "equator"
		
		phi =  Math.PI / nSectors;
		var rSinPhi = R * Math.sin( phi );		// Height above equator
		var rCosPhi = R * Math.cos( phi );		// Radius of a horizontal section at height rSinPhi
		var dTheta = 2.0 * Math.PI / nSectors;		// Increment around circle for each point
		
		// push ( 0, 1, 0 ) into the points array as a vec3
		positions.push(vec3(0,1.0,0));
		
		// Then the base points
		var dTheta = 2 * Math.PI / this.nSectors; // In radians
		for( i = 0; i < this.nSectors + 1; i++ ) { // Duplicate ( 1, 0, 0 ) to close loop.
			var theta = i * dTheta;
			// TODO 3 - push a vertex into positions here, 
			// using 0.5 * Math.cos( theta ) for X,
			// 0 for Y, and 0.5 * Math.sin( theta ) for Z
			// ( Radius 0.5 ==> Diameter 1.0 )
			positions.push(vec3( 0.5 * Math.cos(theta), 0, 0.5 * Math.sin(theta)));
			normals.push(vec3(rSinPhi * Math.cos( theta ), rCosPhi, rSinPhi * Math.sin( theta ) ));
		}	
			
		// Okay.  All data calculated.  Time to put it all in GPU buffers
		
		// Push vertex position data to GPU
		// Hold off on connecting the data to the shader variables
		
		this.positionBufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( positions ), gl.STATIC_DRAW );

		this.normalBufferID = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.normalBufferID);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(normals), gl.STATIC_DRAW);
		
		// TODO 3 - Add calls to createBuffer, bindBuffer, and bufferData 
		//      to push the color data to the GPU
		this.colorBufferID = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, this.colorBufferID);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
		
		// Unbind the buffer, for safety sake.
		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		
		return;
	
	} // Cone constructor
	
	render( ) {
		
		// Okay.  All transformation matrices sent to uniform variables.
		// Time to attach vertex shader variables to the buffers created in init( )
		
		// Connect the vertex data to the shader variables - First positions
		gl.bindBuffer( gl.ARRAY_BUFFER, this.positionBufferID );
		var vPositionLoc = gl.getAttribLocation( program, "vPosition" );
		gl.vertexAttribPointer( vPositionLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPositionLoc );

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBufferID);
		var vNormalLoc = gl.getAttribLocation(program, "vNormal");
		this.gl.vertexAttribPointer(vNormalLoc, 3, gl.FLOAT, false, 0, 0);
		this.gl.enableVertexAttribArray(vNormalLoc);
		
		// Then the colors
		
		// TODO 3 - - Insert the code to connect the color data 
		// to the vertex shader variable "vColor" using bindBuffer, 
		// getAttribLocation, vertexAttribPointer, and enableVertexAttribArray
		
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBufferID);
		var vColorLoc = gl.getAttribLocation( program, "vColor");
		gl.vertexAttribPointer( vColorLoc, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray( vColorLoc );
		
		// Unbind the array buffer, for safety sake.
		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
		// And finally to draw the cone
		
		// TODO 3 - use drawArrays to draw a TRIANGLE FAN using all the data points 
		// ( nSectors + 2 points )
		
		gl.drawArrays( gl.TRIANGLE_FAN, 0, this.nSectors+2 );	// Sides
		
		// TODO later - Draw the bottom.  
		// Could possibly make this controlled by an extra passed parameter.
		
	} // Cone.render( )
	
	// TODO someday - Additional methods could be added to this class.
	// For example to change the color after it had been constructed.

} // class Cone