/* Author: Jhoan Sebastian Ortiz Alvarez
   Date of creation: 20/09/2023
   Last Modification: 3/10/2023 
*/

//Creation elements
var scene = null,
    camera = null,
    renderer = null,
    //controls = null,
    timeLeft = 60,
    countdownInterval;

const size = 20,
    divisions = 20;

//Avatar
var myPlayer =null,
    myPlayerMesh = null,
    input ={left:0, right:0, up:0, down:0},
    rootSpeed = 0.05,
    speed = 0.5;

function startScene() {
    // Scene, Camera, Renderer
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x524E4E)
    camera = new THREE.PerspectiveCamera( 
        75,                                        //Angulo de visión(Abajo o arriba) 
        window.innerWidth / window.innerHeight,    //Relación de aspecto 16:9
        0.1,                                       //Mas cerca (no renderiza)
        1000 );                                    //Mas lejos ()

    renderer = new THREE.WebGLRenderer({canvas: document.getElementById('modelsLoad')});
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    //Orbit controls
    //controls = new THREE.OrbitControls(camera,renderer.domElement);
    //camera.position.set(0,10,30); 
    //camera.position.set(18,10,20);
    //controls.update();



    //Grid Helper
    const gridHelper = new THREE.GridHelper( size, divisions);
    scene.add( gridHelper );

    //Axes Helper
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );  

    //const light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    //scene.add( light );

    const pointLight = new THREE.PointLight( 0xff0000, 4, 5);
    pointLight.position.set( -9, 2, 3 );
    const pointLight2 = new THREE.PointLight( 0xEDEEB5, 1.2, 100 );
    pointLight2.position.set( 8, 18, 8 );
    scene.add(pointLight, pointLight2)

    //const sphereSize = 1;
    //const pointLightHelper = new THREE.PointLightHelper( pointLight2, sphereSize );
    //scene.add( pointLightHelper );

    animate();
    // Escenario
    loadModel_objMtl("../src/models/obj_mtl/escenario/", "escenario.obj", "escenario.mtl", 5, 0);

    // Human Model
    loadModel_objMtl("../src/models/obj_mtl/personaje/", "personaje.obj", "personaje.mtl", 3, 0.6);

    // GLTF Model
    loadGltf("../src/models/gltf/","Duck.gltf");

    //Gift
    createCollectibles();

    startCountdown();

    //
    stateGame('');

    //
    createPlayer();
}

function animate(){
    requestAnimationFrame(animate);
    //controls.update();
    movementPlayer();
    //myPlayerMesh.position.set(myPlayer.position.x,myPlayer.position.y,myPlayer.position.z);
    renderer.render(scene, camera);
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadModel_objMtl(Path, nameObj, nameMTL, size, positions){
    //Load MTL
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setResourcePath(Path);
    mtlLoader.setPath(Path);
    mtlLoader.load(nameMTL, function (materials){
        materials.preload();

        //Load OBJ
        var objLoader = new THREE.OBJLoader();
        objLoader.setPath(Path);
        objLoader.setMaterials(materials);
        objLoader.load(nameObj, function  (object){
            scene.add(object)
            object.scale.set(size,size,size);
            if(nameObj == "personaje.obj"){
                myPlayerMesh = object;
                myPlayerMesh.rotation.y = Math.PI;
            }
            object.position.set(0,positions,0);
            camera.position.set(object.position.x,object.position.y+6, object.position.z+20);
        });
    });
}

function loadGltf(path, nameGltfGet) {
    var nameGltf = path + nameGltfGet;
    // Instantiate a loader
    const loader = new THREE.GLTFLoader();

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    const dracoLoader = new THREE.DRACOLoader();
    dracoLoader.setDecoderPath(path);
    loader.setDRACOLoader(dracoLoader);

    // Load a glTF resource
    loader.load(
        // resource URL
        nameGltf,
        // called when the resource is loaded
        function (gltf) {

            scene.add(gltf.scene);

            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Group
            gltf.scenes; // Array<THREE.Group>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object

            gltf.scene.position.set(2, 0.9, 2);
            gltf.scene.rotation.set(0,1,0);

        },
        // called while loading is progressing
        function (xhr) {

            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

        },
        // called when loading has errors
        function (error) {

            console.log('An error happened');

        }
    );
}

function createCollectibles(){

    const min = -4.8;
    const max = 6;

    for( var i=0; i<5; i++){
        var posx = Math.floor(Math.random() * (max - min + 1) + min);
        var posy = Math.floor(Math.random() * (max - min + 1) + min);
        const texture = new THREE.TextureLoader().load('../src/img/paperGift.jpg')

        const geometry = new THREE.BoxGeometry( 1, 1, 1 ); 
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, map:texture});
        const cube = new THREE.Mesh( geometry, material ); 

        cube.position.set(posx,1.5,posy);
        scene.add( cube );
    }
    
}

function stateGame(state){
    switch(state){
        case 'win':
            document.getElementById("winPage").style.display = "block";
            break;
        
        case 'lose':
            document.getElementById("losePage").style.display = "block";
            break;
        default:
            document.getElementById("winPage").style.display = "none";
            document.getElementById("losePage").style.display = "none";
            break;
}
}

function startCountdown() {
    countdownInterval = setInterval(function() {
        timeLeft--;
        if (timeLeft === 0) {
            stateGame('lose');
            stopCountdown();
            playLoseSound();
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

function stopCountdown() {
    clearInterval(countdownInterval);
}

function updateTimerDisplay() {
    // Updates the HTML element that shows the remaining time
    document.querySelector('#timer').textContent = 'Time: ' + timeLeft;
}

function playLoseSound() {
    // Pause ambient sound
    var ambientSound = document.getElementById("ambientSound");
    if (ambientSound) {
        ambientSound.pause();
    }

    // Play the sound of losing
    var loseSound = new Audio('../src/sounds/lose.mp3');
    loseSound.play();
}

function createPlayer(){
    const geometry = new THREE.BoxGeometry( 4.5, 9.5, 5); 
    const material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true} ); 
    myPlayer = new THREE.Mesh( geometry, material ); 
    scene.add( myPlayer );
    myPlayer.position.y =5.5;
    myPlayer.position.z = -0.4;

    myPlayer.position.set(camera.position.x,camera.position.y,camera.position.z);
}

function movementPlayer(){
    if (input.right == 1){// Rotation Right
        camera.rotation.y -= rootSpeed;
        myPlayer.rotation.y -= rootSpeed;
        myPlayerMesh.rotation.y -= rootSpeed;
    }else if(input.left == 1){ // Rotation Left
        camera.rotation.y += rootSpeed;
        myPlayer.rotation.y += rootSpeed;
        myPlayerMesh.rotation.y += rootSpeed;
    }else if(input.up == 1){ // Move Up
        camera.position.z -= Math.cos(camera.rotation.y) * speed;
        camera.position.z -= Math.sin(camera.rotation.y) * speed;
        myPlayer.position.z -= Math.cos(camera.rotation.y) * speed;
        myPlayer.position.z -= Math.sin(camera.rotation.y) * speed;
        myPlayerMesh.position.z -= Math.cos(camera.rotation.y) * speed;
        myPlayerMesh.position.z -= Math.sin(camera.rotation.y) * speed;
    }else if(input.down == 1){ // Move down
        camera.position.z += Math.cos(camera.rotation.y) * speed;
        camera.position.z += Math.sin(camera.rotation.y) * speed;
        myPlayer.position.z += Math.cos(camera.rotation.y) * speed;
        myPlayer.position.z += Math.sin(camera.rotation.y) * speed;
        myPlayerMesh.position.z += Math.cos(camera.rotation.y) * speed;
        myPlayerMesh.position.z += Math.sin(camera.rotation.y) * speed;
    }
}

document.addEventListener('keydown', (e) => {
    //console.log("Undi: "+e.keyCode);

    switch(e.keyCode) {
        case 68: // Derecha
            input.right = 1;
          break;
        case 65: // Izquierda
            input.left = 1;
          break;
        case 87: // Ariba
            input.up = 1;
          break;
        case 83: // Abajo
            input.down = 1;
          break;
    }
});

document.addEventListener('keyup', (e) => {
    //console.log("Solte: "+e.keyCode);

    switch(e.keyCode) {
        case 68: // Derecha
            input.right = 0;
          break;
        case 65: // Izquierda
            input.left = 0;
          break;
        case 87: // Ariba
            input.up = 0;
          break;
        case 83: // Abajo
            input.down = 0;
          break;
    }
});