var container, stats;
var camera, scene, renderer, particle;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var text2;
var text3;
var totalAmount = 0;
var donateImage;
var timeSinceLastInMs = Date.now();
var globalCounter = 0;
var TPS = 0;

init();
animate();


function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    text2 = document.createElement('div');
    text2.id = 'textdiv';
    text2.style.position = 'absolute';
    text2.style.width = 150;
    text2.style.height = 150;
    text2.style.color = "white";
    text2.innerHTML = "transaction value:";
    text2.style.top = 50 + 'px';

    text3 = document.createElement('div');
    text3.id = 'tpstextdiv';
    text3.style.position = 'absolute';
    text3.style.width = 150;
    text3.style.height = 50;
    text3.style.color = "white";
    text3.innerHTML = "Total Amount: ";
    text3.style.top = 240 + 'px';


    document.body.appendChild(text2);
    document.body.appendChild(text3);

    donateImage = document.createElement('div')
    donateImage.style.position = 'absolute';
    donateImage.style.width = 100;
    donateImage.style.height = 100;
    donateImage.style.top = 320 + 'px';
    donateImage.style.color = "white";
    donateImage.innerHTML = '<p>Buy me coffee: </p> <img src="/static/bitstar/js/donate" alt="donate: 1JJYdHcbHpSLuG1aygsdZwUcvGvN41SPWy" style="width:150;height:150;">'
    document.body.appendChild(donateImage);

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 5000 );
    camera.position.z = 1000;
    scene = new THREE.Scene();

    initRenderer();
    drawStar(2);
}

function drawStar(size) {

    //map is the texture map
    var material = new THREE.SpriteMaterial( {
        map: new THREE.CanvasTexture( generateSpriteCanvasTexture() ),
        blending: THREE.AdditiveBlending
    } );

    particle = new THREE.Sprite( material );
    initParticle( particle, size );
    scene.add( particle );
}

function initRenderer() {
    renderer = new THREE.CanvasRenderer();
    renderer.setClearColor( 0x000040 );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    container.appendChild( renderer.domElement );
    stats = new Stats();
    container.appendChild( stats.dom );

    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'touchstart', onDocumentTouchStart, false );
    document.addEventListener( 'touchmove', onDocumentTouchMove, false );

    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function generateSpriteCanvasTexture() {
    var canvas = document.createElement( 'canvas' );
    canvas.width = 16;
    canvas.height = 16;
    var context = canvas.getContext( '2d' );
    var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
    gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
    gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
    gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
    gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height );
    return canvas;
}

function initParticle( particle, size ) {
    var particle = this instanceof THREE.Sprite ? this : particle;
    particle.position.set( 0, 0, 0 );
    particle.scale.x = particle.scale.y = (Math.random() + .5) * 32 + 8 * size

    new TWEEN.Tween( particle.position )
        .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 }, 15000 )
        .start();

    new TWEEN.Tween( particle.scale )
        .to( { x: .01, y: .01 }, 20000 )
        .start();
}

function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
}
function onDocumentTouchStart( event ) {
    if ( event.touches.length == 1 ) {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}

function onDocumentTouchMove( event ) {
    if ( event.touches.length == 1 ) {
        event.preventDefault();
        mouseX = event.touches[ 0 ].pageX - windowHalfX;
        mouseY = event.touches[ 0 ].pageY - windowHalfY;
    }
}

function animate() {
    requestAnimationFrame( animate );
    render();
    stats.update();
}

function render() {
    TWEEN.update();
    //camera.position.x += ( mouseX - camera.position.x ) * 0.01;
    //camera.position.y += ( - mouseY - camera.position.y ) * 0.01;
    camera.lookAt( scene.position );
    renderer.render( scene, camera );
}

var btcs = new WebSocket('wss://ws.blockchain.info/inv');

btcs.onopen = function() {
    btcs.send( JSON.stringify( {"op":"unconfirmed_sub"} ) );
};

var counter = 0;
btcs.onmessage = function(onmsg) {
    counter ++;
    var response = JSON.parse(onmsg.data);
    var amount = response.x.out[0].value;
    var calAmount = amount / 100000000;
    text3.innerHTML = "<p>Total Amount: " + getTotalAmount(calAmount) + " BTC </p> <p>TPS: " + getTPS() + "</p>";

    text2.innerHTML = "<p>" + calAmount + " BTC </p>" + text2.innerHTML

    if(counter > 5) {
        text2.innerHTML = shrinkDownParagraphs(text2.innerHTML);
    }

    if(calAmount > 4) {
        calAmount = 4;
    }

    drawStar(calAmount);
}

function shrinkDownParagraphs(theString) {
    var lastOfIndex = theString.lastIndexOf("<p>");
    return theString.substring(0,lastOfIndex);

}

//NEEDS WORK
function getTPS() {
    globalCounter ++;
    if((Date.now() - timeSinceLastInMs) > 1000) {
        globalCounter = 0;
        timeSinceLastInMs = Date.now();
    }
    TPS = globalCounter;

    return TPS
}

function getTotalAmount(calAmount) {
 totalAmount = totalAmount + calAmount;
 return totalAmount;
}