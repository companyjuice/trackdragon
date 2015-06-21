 // openJSONCad.js, a Parser function to handle JSONCAD JSON graphics specification
//
// Copyright (c) 2015 by James Reilly <jimreillyemail@gmail.com>
//
// Version: 0.001
// License: MIT License
OpenJSONCad.Viewer.prototype.toFrontView = function(e) {	if (!! e) {	e.preventDefault(); e.stopPropagation();}
									this.controls_.reset();
									this.camera_.up.set(0,1,0);
									this.camera_.position.set(0,0,800);
									this.camera_.rotation.order = "YXZ";					
									this.camera_.rotation.set(0,0,0);
									this.controls_.dispatchEvent( { type: 'change' } ); 
									this.controls_._changed = false;		
									this.controls_.update();	 	
};
OpenJSONCad.Viewer.prototype.lineTo  = function (x0,y0,z0 ,x1,y1,z1, clr ){  
									gm		=			new THREE.Geometry();	
									gm.vertices.push(	new THREE.Vector3(x0, y0,z0 ));		
									gm.vertices.push(	new THREE.Vector3(x1, y1,z1 ));		
											return		new THREE.Line( gm, new THREE.LineBasicMaterial( { color:  clr || 0  }  ), THREE.LinePieces ) ;
};
 
//	Prototype for Line Leaders and Leader Text
// 
//				line  hatches at [a,b,c...]		specific textual offsets for leader lines one per line[n]					 x / y screen offsets	 line horiz/vert	txt rotation	color					fontsize			scalar for location offset also fontsz += scale
////var	 ws=[
//			 {	line :  [3,28,51, 75    ],		txy: [{x:  0,y: 15}	,{x:  0 ,y:15}	,{x :  0, y : 15}	,{x:  0,y:15}]		,x:-670 ,y:  80			,isx : 1			, rz :  0		, color : 0xff0000		 ,fontsz :  7		,scale: 5} 
//			,{	line :  [0, 3,75, 78    ],		txy: [{x:  0,y: 15}	,{x:  0 ,y:15}	,{x : -2, y : 15}	,{x:  4,y:15}]		,x:-200 ,y: 325			,isx : 1			, rz :  0		, color : 0xff0000		 ,fontsz :  7		,scale: 5} 
// ];	
OpenJSONCad.Viewer.prototype.doLeaderLinesAndText= function(ws){	if (!  this.options.threeJSAnnotate_) return; 
								var ws = this.options.threeJSAnnotate_;
							// Leader Lines
							for (var j = 0; j < ws.length; j++) {
								 var  ob	=			ws[j]
									, base	=			0
									, top	=			ob.scale * 10 
									, bplus	=			Math.round(top *.2 )
									, mid	=			Math.round(top / 2 )
 									, lstrt =			Math.round(ob.scale * ob.line[0]  )
									, lend	=			Math.round(ob.scale * ob.line[ob.line.length-1]  ) ;

	 									if (ob.isx ) 	this.scene_.add(	this.lineTo(  ob.x + lstrt , ob.y + mid		,0  , ob.x + lend,  ob.y + mid  ,0 ));
										else			this.scene_.add(	this.lineTo(  ob.x + mid   , ob.y + lstrt	,0	, ob.x + mid ,  ob.y + lend ,0 ));
					
								for (var  i =0; i<  ob.line.length; i++){ 
										var lenxy	 =	Math.round(ob.scale * ob.line[i]  );
										if (ob.isx ) 	this.scene_.add(	this.lineTo(  ob.x  + lenxy	, ob.y + base	,0 ,  ob.x + lenxy	  ,ob.y + top-base	,0 ));
										else			this.scene_.add(	this.lineTo(  ob.x  + base	, ob.y + lenxy	,0 ,  ob.x + top-base ,ob.y + lenxy		,0 ));
										base		=   (i < (ob.line.length -2)	) ?   bplus : 0;
									}
								}	
								// leader text
								for (var j = 0; j < ws.length; j++) for (var ob =	ws[j], i =0; i<  ob.line.length; i++) 
						 			this.scene_.add( (ob.isx )	? 	this.aLineOfText(ob.line[i],ob.txy[i].x +  ob.x  + Math.round(ob.scale * ob.line[i])		,ob.txy[i].y + ob.y + Math.round(ob.scale * 8   )			,0, ob.fontsz  , ob.color,ob.scale)	  
						 										:	this.aLineOfText(ob.line[i],ob.txy[i].x +  ob.x  + Math.floor(ob.scale * 2  )				,ob.txy[i].y + ob.y + Math.round(ob.scale * ob.line[i]) 	,0, ob.fontsz  , ob.color,ob.scale));
};
 
OpenJSONCad.Viewer.prototype.aLineOfText = function  (theText,x,y,z, fontsize, fcolor,scale  ) {  
								 theText	=	theText	+ '';
								 x			=	x || 0; 
								 y			=	y || 0; 
								 z			=	z || 0; 
								 fontsize	=	fontsize	|| 7;
								 fontcolor	=	fcolor		|| 0;
								 scale		=	scale		|| 1;
								 fontsize	=	( scale < 1) ?	Math.round((fontsize * scale ) ) : Math.round( fontsize + scale  )
								 color		=	new THREE.Color(fontcolor)
								 ;
  								var convexhullShapeGroup	= []
								,		solidShapeGroup		= []
								,		beziers				= []
								,		invert				= []
								,		group				= new	THREE.Group()
								,		bezierGeometry		= new	THREE.Geometry() 
 								,		textMaterial		= new	THREE.MeshBasicMaterial( {	 color: new THREE.Color(0, 0, 1 ), overdraw: 0.5, wireframe: true, side: THREE.DoubleSide } ) 
 								,		textShapes			=		THREE.FontUtils.generateShapes( theText, {size: fontsize  ,height: 20,curveSegments: 2, font: "arial narrow", bevelEnabled: false} ) 
								,		text3d				= new	THREE.ShapeGeometry( textShapes );
 																	text3d.computeBoundingBox();

 									for (var s=0; s < textShapes.length;s++) {
 										var process		=		processShape(textShapes[s].curves);
 										beziers			=		beziers.concat(	process.beziers);
 										invert			=		invert.concat(	process.invert);
 										convexhullShape = new	THREE.Shape(	process.pts );
 										solidShape		= new	THREE.Shape(	process.pts2 );
 																convexhullShapeGroup.push( convexhullShape );
 																solidShapeGroup.push( solidShape );
 										
										for (var i=0; i< textShapes[s].holes.length;i++) {
 											process	=		processShape(	textShapes[s].holes[i].curves, true);
 											beziers	=		beziers.concat(	process.beziers);
 											invert	=		invert.concat(	process.invert);
 															convexhullShape.holes.push(	new THREE.Shape(process.pts  ));
 															solidShape.holes.push(		new THREE.Shape(process.pts2 ));
 											}
 									} 
 									for (var i=0;i<beziers.length;i++) 
 										bezierGeometry.vertices.push( new THREE.Vector3(beziers[i].x, beziers[i].y, 0) );			
 						 
 									for (i=0;i<beziers.length;i+=3) {
 										bezierGeometry.faces.push(    new THREE.Face3(i, i+1, i+2) );
 										bezierGeometry.faceVertexUvs[0].push( [new THREE.Vector2(0, 0),new THREE.Vector2(0.5, 0),new THREE.Vector2(1, 1)] );
 									}
 									bezierGeometry.computeBoundingBox();
 									bezierGeometry.computeFaceNormals();
 									bezierGeometry.computeVertexNormals();

									var text = new	THREE.Mesh( 
													bezierGeometry
												,	new THREE.ShaderMaterial( {
														attributes:		{ invert: { type: 'f', value: invert } }
													,	uniforms:		{ color:  { type: 'c', value: color  } }
													,	vertexShader:	getShader( 'vs' )
													,	fragmentShader:	getShader( 'fs' )
													,	side:			THREE.DoubleSide } )
												);
												text.position.set(x,y,z);
 												text.rotation.set(0,0,0);
 									group.add(  text );
 							
									text3d = new THREE.ShapeGeometry( solidShapeGroup );
 												text3d.computeBoundingBox();
 									text = new	THREE.Mesh( text3d, new THREE.MeshBasicMaterial( { color:  fontcolor, side: THREE.DoubleSide } ) );
 												text.position.set(x,y,z);
 												text.rotation.set(0,0,0);
									group.add(  text );
									return group;
 							
							function getShader(shadername){ 
										var sn={ fs : "varying vec2 vUv; varying float flip; uniform vec3 color; float inCurve(vec2 uv) {  return uv.x * uv.x - uv.y; } float delta = 0.1;	void main() { float x = inCurve(vUv); if (x * flip > 0.) discard; gl_FragColor = vec4(color, 1.);	}"
											    ,vs : "varying vec2 vUv; attribute float invert; varying float flip; void main() { vUv = uv; flip = invert;	vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );	gl_Position = projectionMatrix * mvPosition;}"
											};
											return sn[shadername];	
							}
							function processShape(path ) {		
									var pts = [], pts2 = [],beziers = [],invert = [], z , vA = new	THREE.Vector2() ,vB	 = new	THREE.Vector2();
 									pts.push(  path[0].getPoint(0) );
 									pts2.push( path[0].getPoint(0) );
 									for (var i=0; i < path.length; i++) { var curve = path[i];
 										if (curve instanceof THREE.LineCurve) {	
											pts.push( curve.v2 );	
											pts2.push( curve.v2 );
											continue;
 										} 
										if (! curve instanceof THREE.QuadraticBezierCurve) continue;
 										vA	= vA.subVectors( curve.v1, curve.v0 );												 
 										vB	= vB.subVectors( curve.v2, curve.v1 );
 										z	=  vA.x * vB.y - vA.y * vB.x;															// z component of cross Production
 										if   (z < 0) {	pts.push( curve.v1 );	pts.push(  curve.v2 );	pts2.push( curve.v2 );	}	// clockwise/anticlock wind
										else {			pts.push( curve.v2 );	pts2.push( curve.v1 );	pts2.push( curve.v2 );	}
 										
										var flip = (z < 0) ? 1 : -1; 	 
 										invert.push(flip, flip, flip);
 										beziers.push( curve.v0, curve.v1, curve.v2);
 									}
 									return {pts: pts,pts2: pts2,beziers: beziers,invert: invert};
 							}
};
OpenJSONCad.Viewer.prototype.doImg = function(id,img,x,y,w,h,r1, r2){

											x= x || 0;
											y= y || 0;
											w= w || 1600;
											h= h || 900	;
										   var	img = new THREE.MeshBasicMaterial({    map: THREE.ImageUtils.loadTexture(img)  });
												img.map.needsUpdate = true; 
										var object = new THREE.Mesh(new THREE.PlaneGeometry(1600, 900),img);
										   object.rotation.x = -( Math.PI / 2) *.95   ; 
										  
										  object.position.set(250,-1, -30);
										
										  this.scene_.add( object );
 
};

//	Text format for svg Graphics
//							Text					 xyscreen coordinates		rotation		 color as rgba			 fontsize			
//var etxt= [	 {	strng : "XXX  FRAME"			,xy : [1330 ,580 ]			,rz : -90		,color : [0,0,0,1]		,fontsz : 52 } 
//				,{	strng : "XXXX YYYYYYY "			,xy : [1410 ,580 ]			,rz : -90		,color : [0,0,0,1]		,fontsz : 52 } 
//			]; 

OpenJSONCad.Viewer.prototype.doSVGImg		= function (img, id,x,y,w,h){
											x= x || 0;
											y= y || 0;
											w= w || 1600;
											h= h || 900	;
									if (!	document.getElementById('svg_' + id )) 
											document.getElementById( id	).appendChild(	svgobj ('svg_' + id ));
								var draw =	document.getElementById('svg_' + id );
											draw.appendChild(	svgimg (img,'img_'+id,x-40, y, w, h, img ));

			function svgobj(id,x,y,w,h){	var svg=document.createElementNS('http://www.w3.org/2000/svg',"svg");
											svg.setAttributeNS(null, 'id'			, id || 'svg'	);
											svg.setAttributeNS(null, 'x'			, x  || 0		);
											svg.setAttributeNS(null, 'y'			, y  || 0		);
											svg.setAttributeNS(null, 'width'		, w  || 1600	);
											svg.setAttributeNS(null, 'height'		, h  || 900		);
											return svg;
							}
			 function svgimg(s,id,x,y,w,h){ if (! s) return null;
										var	img	= document.createElementNS('http://www.w3.org/2000/svg',"image"	);
											img.setAttributeNS(null, 'id'			, id || s + '_id'			);
											img.setAttributeNS(null, 'x'			, x  || 0					);
											img.setAttributeNS(null, 'y'			, y  || 0					);
											img.setAttributeNS(null, 'width'		, w  || 1600				);
											img.setAttributeNS(null, 'height'		, h  || 900					);
											img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', s	);
											return img;
							}
}
OpenJSONCad.Viewer.prototype.doSVGText		= function (ob,id ){

									if (!	document.getElementById('svg_' + id )) 
											document.getElementById( id	).appendChild(	svgobj ('svg_' + id ));
								var draw =	document.getElementById('svg_' + id );
											for (var i =0; i < ob.length; i++) 
												draw.appendChild(  svgtxt( ob[i].strng ,'text_'+ id+ '__' + i,  ob[i].x   ,ob[i].y  , ob[i].color,   ob[i].fontsz ,ob[i].rz ));

			function svgobj(id,x,y,w,h){	var svg=document.createElementNS('http://www.w3.org/2000/svg',"svg");
											svg.setAttributeNS(null, 'id'			, id || 'svg'	);
											svg.setAttributeNS(null, 'x'			, x  || 0		);
											svg.setAttributeNS(null, 'y'			, y  || 0		);
											svg.setAttributeNS(null, 'width'		, w  || 1600	);
											svg.setAttributeNS(null, 'height'		, h  || 900		);
											return svg;
							}
			 function svgimg(s,id,x,y,w,h){ if (! s) return null;
										var	img	= document.createElementNS('http://www.w3.org/2000/svg',"image"	);
											img.setAttributeNS(null, 'id'			, id || s + '_id'			);
											img.setAttributeNS(null, 'x'			, x  || 0					);
											img.setAttributeNS(null, 'y'			, y  || 0					);
											img.setAttributeNS(null, 'width'		, w  || 1600				);
											img.setAttributeNS(null, 'height'		, h  || 900					);
											img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', s	);
											return img;
							}
			 function svgtxt(s,id,x,y,clr,fsz,trz, ff,sty){ if (! s) return null;
										var	txt	= document.createElementNS('http://www.w3.org/2000/svg',"text" );
											txt.setAttributeNS(null, 'id'			, id  || s + '_txt'				);
											txt.setAttributeNS(null, 'x'			, x   || 0						);
											txt.setAttributeNS(null, 'y'			, y   || 0						);
											txt.setAttributeNS(null, 'fill'			, clr || 0						);
											txt.setAttributeNS(null, 'font-size'	, fsz || 8						);
											txt.setAttributeNS(null, 'font-family'	, ff  || 'Arial Narrow'			);
											txt.setAttributeNS(null, 'style'		, sty || 'text-anchor: left;'	);
											if (trz)
											txt.setAttributeNS(null, 'transform'	,  'rotate( ' + trz + ', ' + x  + ' , ' + y + ' ) ' );
											txt.appendChild(document.createTextNode(s))	;				
 											return txt;
							}
			 function svgline(id,x1,y1,x2,y2,clr,stw){ if (! s) return null;
										var	lin	= document.createElementNS('http://www.w3.org/2000/svg',"line"		);
											lin.setAttributeNS(null, 'id'			, id  ||   '_line'				);
											lin.setAttributeNS(null, 'x1'			, x1  || 0						);
											lin.setAttributeNS(null, 'y1'			, y1  || 0						);
											lin.setAttributeNS(null, 'x2'			, x2  || 0						);
											lin.setAttributeNS(null, 'y2'			, y2  || 0						);
											lin.setAttributeNS(null, 'stroke'		, clr || 0						);
											lin.setAttributeNS(null, 'stroke-width'	, stw || 1						);
  									return	lin;
							}	
			 function svgrect(id,x,y,w,h,rx,ry,stw,stc,fcl){ 
										var	rec	= document.createElementNS('http://www.w3.org/2000/svg',"rect"		);
											rec.setAttributeNS(null, 'id'			, id  ||   '_line'				);
											rec.setAttributeNS(null, 'x'			, x   || 0						);
											rec.setAttributeNS(null, 'y'			, y   || 0						);
											rec.setAttributeNS(null, 'width'		, w   || 0						);
											rec.setAttributeNS(null, 'height'		, h   || 0						);
											rec.setAttributeNS(null, 'rx'			, x   || 0						);
											rec.setAttributeNS(null, 'ry'			, y   || 0						);
											rec.setAttributeNS(null, 'fill'			, fcl || 0						);
											rec.setAttributeNS(null, 'stroke'		, stc || 0						);
											rec.setAttributeNS(null, 'stroke-width'	, stw || 1						);
  									return  rec;
							}	
			 function svgline(id,x1,y1,x2,y2,clr,stw){ 
										var	lin	= document.createElementNS('http://www.w3.org/2000/svg',"line"		);
											lin.setAttributeNS(null, 'id'			, id  ||   '_line'				);
											lin.setAttributeNS(null, 'x1'			, x1  || 0						);
											lin.setAttributeNS(null, 'y1'			, y1  || 0						);
											lin.setAttributeNS(null, 'x2'			, x2  || 0						);
											lin.setAttributeNS(null, 'y2'			, y2  || 0						);
											lin.setAttributeNS(null, 'stroke'		, clr || 0						);
											lin.setAttributeNS(null, 'stroke-width'	, stw || 1						);
  									return  lin;
							}	
			 function svgpath(id,d,clr,stw,fcl){ 
										var	pat	= document.createElementNS('http://www.w3.org/2000/svg',"path"		);
											pat.setAttributeNS(null, 'id'			, id  ||   '_path'				);
								if(!! d )	pat.setAttributeNS(null, 'd'			, d								);
								if(!!crl)	pat.setAttributeNS(null, 'stroke'		, clr  							);
								if(!!stw)	pat.setAttributeNS(null, 'stroke-width'	, stw  							);
								if(!!fcl)	pat.setAttributeNS(null, 'fill'			, fcl  							);
  											return	pat;
							}	
		 }