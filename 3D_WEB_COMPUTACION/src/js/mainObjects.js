/* Author: Jhoan Sebastian Ortiz Alvarez
   Date of creation: 20/09/2023
   Last Modification: 26/08/2023 
*/

//Pato Cargador
//Sounds (backgroud(ambient), takeElements, Win, Lost)
//1 Pantalla Win, Lost

//Creation elements
var scene = null,
    camera = null,
    renderer = null,
    controls = null

const size = 20,
    divisions = 20;

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
    controls = new THREE.OrbitControls(camera,renderer.domElement);
    camera.position.set(0,0,0);
    controls.update();

    camera.position.z = 20;

    //Grid Helper
    const gridHelper = new THREE.GridHelper( size, divisions);
    scene.add( gridHelper );

    //Axes Helper
    const axesHelper = new THREE.AxesHelper( 5 );
    scene.add( axesHelper );  

    //const light = new THREE.AmbientLight( 0xFFFFFF ); // soft white light
    //scene.add( light );

    const pointLight = new THREE.PointLight( 0xff0000, 1, 2 );
    pointLight.position.set( -1.5, 0.5, 0.5 );
    const pointLight2 = new THREE.PointLight( 0xEDEEB5, 1, 100 );
    pointLight2.position.set( 2, 5, 2 );
    scene.add(pointLight, pointLight2)

    //const sphereSize = 1;
    //const pointLightHelper = new THREE.PointLightHelper( pointLight2, sphereSize );
    //scene.add( pointLightHelper );

    animate();
    // Escenario
    loadModel_objMtl("../src/models/obj_mtl/escenario/", "escenario.obj", "escenario.mtl");

    // Human Model
    loadModel_objMtl("../src/models/obj_mtl/personaje/", "personaje.obj", "personaje.mtl");

    // GLTF Model
    loadGLTF("../src/models/gltf/Duck.gltf");
}

function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function loadModel_objMtl(Path, nameObj, nameMTL){
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
            
            //object.scale.set(5,5,5);
        });
    });
}

function loadGLTF(Path){
    const gltfLoader = new THREE.GLTFLoader();
    gltfLoader.load(Path, function (gltf) {
        const model = gltf.scene;
        scene.add(model);

        model.position.set(1, 0, 1);
        model.scale.set(1, 1, 1);
        model.rotation.set(0, 1, 0);
    });
}
    