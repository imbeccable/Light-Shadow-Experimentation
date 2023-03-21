/* axes.js
	
	Written by John Bell for CS 425, Fall 2020
	Last revised Spring 2023
    
    This file contains code to create and draw a set of unit axes, centered at the origin.
    
*/

// Globals are evil.  We won't use any here. :-)

class Axes{ 

	constructor( gl, program ) {
		
		this.program = program;
		this.gl = gl;
		
		var positions = [ ];	// Vertex position data 
		var colors    = [ ];	// Vertex color data
		
		// Generate Points and Colors
		
		// First the points and colors for the axes.
		positions.push( vec3( 0, 0, 0 ) );
		positions.push( vec3( 1, 0, 0 ) );
		colors.push( vec3( 1, 0, 0 ) );
		colors.push( vec3( 1, 0, 0 ) );
		
		positions.push( vec3( 0, 0, 0 ) );
		positions.push( vec3( 0, 1, 0 ) );
		colors.push( vec3( 0, 1, 0 ) );
		colors.push( vec3( 0, 1, 0 ) );
		
		positions.push( vec3( 0, 0, 0 ) );
		positions.push( vec3( 0, 0, 1 ) );
		colors.push( vec3( 0, 0, 1 ) );
		colors.push( vec3( 0, 0, 1 ) );
		
		// Okay.  All data calculated.  Time to put it all in GPU buffers
		
		// Push Vertex Location Data to GPU
		// Hold off on connecting the data to the shader variables
		
		this.vBufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( positions ), gl.STATIC_DRAW );
		
		// Push  Vertex Color Data to GPU
		// Hold off on connecting the data to the shader variables
		
		this.cBufferID = gl.createBuffer( );
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferID );
		gl.bufferData( gl.ARRAY_BUFFER, flatten( colors ), gl.STATIC_DRAW );
		
		// Unbind the buffer, for safety sake.
		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
		
		return;
	
	}
	
	render( ) {
		
		var gl = this.gl;
		
		// Connect the vertex data to the shader variables - First positions
		gl.bindBuffer( gl.ARRAY_BUFFER, this.vBufferID );
		var vPositionLoc = gl.getAttribLocation( this.program, "vPosition" );
		gl.vertexAttribPointer( vPositionLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vPositionLoc );
		
		// Then the colors
		gl.bindBuffer( gl.ARRAY_BUFFER, this.cBufferID );
		var vColorLoc = gl.getAttribLocation( this.program, "vColor" );
		gl.vertexAttribPointer( vColorLoc, 3, gl.FLOAT, false, 0, 0 );
		gl.enableVertexAttribArray( vColorLoc );
		
		// Unbind the array buffer, for safety sake.
		
		gl.bindBuffer( gl.ARRAY_BUFFER, null );
	
		// And finally to draw the axes
		
		gl.drawArrays( gl.LINES, 0, 6 );	
		
	} // render( )

} // class Axes