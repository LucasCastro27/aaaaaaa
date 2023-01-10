import * as THREE from 'three';
import KeyboardState from '../libs/util/KeyboardState.js'
import { OBJLoader } from '../build/jsm/loaders/OBJLoader.js';
import {GLTFLoader} from '../build/jsm/loaders/GLTFLoader.js';
import {
    initRenderer,
    setDefaultMaterial,
} from "../libs/util/util.js";
import { CSG } from '../libs/other/CSGMesh.js'
import { FontLoader } from '../build/jsm/loaders/FontLoader.js';
import { TextGeometry } from '../build/jsm/geometries/TextGeometry.js';

document.querySelector("button").style.display="none"; //inline
document.getElementById("image1").style.display="none";
document.getElementById("image2").style.display="none";
document.getElementById("image3").style.display="none";
document.getElementById("keyCount1").style.display="none";
document.getElementById("keyCount2").style.display="none";
document.getElementById("keyCount3").style.display="none";
document.getElementById("keyCount3").style.display="none";
document.getElementById("test").style.display="none";


const LoadingManager = new THREE.LoadingManager();
var loader = new GLTFLoader(LoadingManager);


let spotlights = []
let colisions = [];
let block_colisions = [];
let blocks = [];
let key_collisions = [];
let buttonsObj = [];
let buttons = [];
let door_collisions = []
let door_triggers = []
var soundDoor0 = true;
var soundDoor1 = true;
var soundDoor2 = true;

var soundDoorPuzzle0 = true;
var soundDoorPuzzle1 = true;

var apertadosPuzzle0 = 0;
var apertadosPuzzle1 = 0;

let scene, renderer, material;
scene = new THREE.Scene();
renderer = initRenderer();
let ambLight = new THREE.AmbientLight("rgb(255,255,255)");
ambLight.intensity = 0.5;
scene.add(ambLight);
material = setDefaultMaterial();
var lightPosition = new THREE.Vector3(-30, 30, 30);

var d = 100;


function loadGLTFFile1(tipo, local) {


    if (tipo == 1) {
        loader.load('./assets/coisas/pedra/scene.gltf', (gltfScene) => {
            gltfScene.scene.traverse(function (node) {

                if (node.isMesh) { node.castShadow = true; }

            });
            gltfScene.scene.position.set(0, -0.3, 0);
            gltfScene.scene.scale.set(0.6, 1.2, 1.4);

            local.add(gltfScene.scene);
        });
    }
    if (tipo == 2) {
        loader.load('./assets/coisas/cristal/scene.gltf', (gltfScene) => {
            gltfScene.scene.traverse(function (node) {

                if (node.isMesh) { node.castShadow = true; }

            });
            gltfScene.scene.scale.set(1, 1, 1);
            gltfScene.scene.position.set(0, -0.65, 0);

            local.add(gltfScene.scene);
        });
    }
    if (tipo == 3) {
        loader.load('./assets/coisas/livros/scene.gltf', (gltfScene) => {
            gltfScene.scene.traverse(function (node) {

                if (node.isMesh) { node.castShadow = true; }

            });
            gltfScene.scene.position.set(0, -0.4, 0);
            gltfScene.scene.scale.set(0.01, 0.01, 0.01);
            local.add(gltfScene.scene);
        });
    }

}






var dirLight = new THREE.DirectionalLight("rgb(255,255,255)");
dirLight.position.copy(lightPosition);
dirLight.castShadow = true;
// Shadow Parameters
dirLight.shadow.mapSize.width = 4096;
dirLight.shadow.mapSize.height = 4096;
dirLight.shadow.camera.near = .01;
dirLight.shadow.camera.far = 100;
dirLight.shadow.camera.left = d;
dirLight.shadow.camera.right = -d;
dirLight.shadow.camera.bottom = d;
dirLight.shadow.camera.top = -d;
dirLight.shadow.bias = -0.0005;
dirLight.intensity = 0.4;

dirLight.shadow.radius = 0.8;

scene.add(dirLight);

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var keyboard = new KeyboardState();
let clock = new THREE.Clock();


let tileMaterial = new THREE.MeshLambertMaterial({
    color: "rgb(223,195,156,255)",
    opacity: 0.0,
    transparent: true
});

let tileMaterialSelected = new THREE.MeshLambertMaterial({
    color: "rgb(246,2,150)",
    opacity: 0.0,
    transparent: true
});
let groundMaterialRed = setDefaultMaterial(0xF12323);

let invisibleColor = 0xFFFFFF;

let collisionMaterial = new THREE.MeshPhongMaterial({
    color: invisibleColor,
    opacity: 0.0,
    transparent: true,
});
var man = null;
var mixer = new Array();
var textVisible = false;

//keys Controller
var hasBlueKey = false
var hasRedKey = false
var hasYellowKey = false



let doors = []
let keys = []

// create a characterBox
let cubeGeometry = new THREE.BoxGeometry(0.0002, 2, 0.0002);
let characterBox = new THREE.Mesh(cubeGeometry, collisionMaterial);
characterBox.position.set(0.0, 3, 0.0);
scene.add(characterBox);

function endGame() {

    const loader = new FontLoader();
    loader.load('../T3/snow_Candy_Regular.json', (font) => {
        const textGeometry = new TextGeometry('        Parabéns!\n Você Concluiu todos\n        os Puzzles!', {
            height: 0.5,
            size: 1,
            font: font,
        });
        const textMaterial = new THREE.MeshNormalMaterial();
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.x = -31;
        textMesh.position.y = 8;
        textMesh.position.z = 5
        textMesh.rotateY(2.3562);
        scene.add(textMesh);
        textVisible = true;

    });

}
//puzzle Controller
var botoesAcionados = new Array(5).fill(false);

var puzzle1Completo = false;
var puzzle2Completo = false;


//========================================================================================================//
//=========================================elementos do ambiente==========================================//


function createArch(size) {

    const textureLoader = new THREE.TextureLoader();
    var stone = textureLoader.load('./assets/textures/wall.png');
    let wallMaterial = new THREE.MeshLambertMaterial();
    wallMaterial.map = stone;

    let retangleMesh = new THREE.Mesh(new THREE.BoxGeometry(7.5, 10, 0.99));
    let sphereMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.51, 2.5, 10, 32));
    let retangleMesh2 = new THREE.Mesh(new THREE.BoxGeometry(5.02, 10, 1));
    /////////////////////////////////
    sphereMesh.position.set(0, 2, 0);
    sphereMesh.rotateX(1.5708);
    sphereMesh.matrixAutoUpdate = false;
    sphereMesh.updateMatrix();

    let SphereCSG = CSG.fromMesh(sphereMesh);
    let retangleCSG = CSG.fromMesh(retangleMesh);
    let csgObj = retangleCSG.subtract(SphereCSG);

    //////////////////////////////////////////////
    retangleMesh2.position.set(0, -3, 0);
    retangleMesh2.matrixAutoUpdate = false;
    retangleMesh2.updateMatrix();

    retangleCSG = CSG.fromMesh(retangleMesh2);
    csgObj = csgObj.subtract(retangleCSG);

    let arch1 = CSG.toMesh(csgObj, new THREE.Matrix4());
    arch1.material = wallMaterial;
    let arch2 = CSG.toMesh(csgObj, new THREE.Matrix4());
    arch2.material = wallMaterial;
    let arch3 = CSG.toMesh(csgObj, new THREE.Matrix4());
    arch3.material = wallMaterial;
    let arch4 = CSG.toMesh(csgObj, new THREE.Matrix4());
    arch4.material = wallMaterial;

    arch1.position.set(0, 5, (size / 2) - 1);
    arch2.position.set(0, 5, -(size / 2));
    arch3.position.set((size / 2) - 1, 5, 0);
    arch4.position.set(-(size / 2), 5, 0);

    arch3.rotateY(1.5708);
    arch4.rotateY(1.5708);


    arch1.castShadow = true;
    arch1.receiveShadow = true;
    arch2.castShadow = true;
    arch2.receiveShadow = true;
    arch3.castShadow = true;
    arch3.receiveShadow = true;
    arch4.castShadow = true;
    arch4.receiveShadow = true;

    scene.add(arch1);
    scene.add(arch2);
    scene.add(arch3);
    scene.add(arch4);

}


// escada 
function createStairs(size) {


    function guards(x, y, z, degree) {
        let guardStair = new THREE.BoxGeometry(1, 6, 6);
        let guard = new THREE.Mesh(guardStair, collisionMaterial);
        guard.position.set(x, y, z);
        guard.rotateY(degree);
        let deegBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        deegBB.setFromObject(guard);
        colisions.push(deegBB);
        scene.add(guard);
    }
    guards(-3, 2, 28, 0);
    guards(3, 2, 28, 0);
    guards(-3, 1, -28.4, 0);
    guards(3, 1, -28.4, 0);

    guards(-28.5, 2, -3, 1.5708);
    guards(-28.5, 2, 3, 1.5708);
    guards(28, 1, -3, 1.5708);
    guards(28, 1, 3, 1.5708);

    let degrau = new THREE.BoxGeometry(5.2, 0.21, 0.85);

    const textureLoader = new THREE.TextureLoader();

    var wood = textureLoader.load('./assets/textures/wood.jpg');
    let degrauMaterial = new THREE.MeshLambertMaterial();
    degrauMaterial.map = wood;





    for (var i = 1; i < 12; i++) {


        let degrau1 = new THREE.Mesh(degrau, degrauMaterial);
        degrau1.receiveShadow = true;

        degrau1.position.set(0, 0.2 * i, 24.5 + (i * 0.5));
        scene.add(degrau1);
        let deegBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        deegBB.setFromObject(degrau1);
        colisions.push(deegBB);
    }

    for (var i = 1; i < 14; i++) {

        let degrau1 = new THREE.Mesh(degrau, degrauMaterial);
        degrau1.receiveShadow = true;

        degrau1.position.set(0, 0.1 + (-0.2 * i), -(25 + (i * 0.5)));
        scene.add(degrau1);
        let deegBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        deegBB.setFromObject(degrau1);
        colisions.push(deegBB);
    }

    for (var i = 1; i < 13; i++) {

        let degrau1 = new THREE.Mesh(degrau, degrauMaterial);
        degrau1.receiveShadow = true;

        degrau1.rotateY(1.5708);
        degrau1.position.set((24.5 + (i * 0.5)), 0.2 + (-0.2 * i), 0);
        scene.add(degrau1);
        let deegBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        deegBB.setFromObject(degrau1);
        colisions.push(deegBB);
    }

    for (var i = 1; i < 10; i++) {

        let degrau1 = new THREE.Mesh(degrau, degrauMaterial);
        degrau1.receiveShadow = true;

        degrau1.position.set(-(25.5 + (i * 0.5)), 0.2 * i, 0);
        degrau1.rotateY(1.5708);
        scene.add(degrau1);
        let deegBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
        deegBB.setFromObject(degrau1);
        colisions.push(deegBB);
    }

}


//========================================================================================================//
//=========================================CRIAÇÃO DO AMBIENTE============================================//
//criação de tile
let block = new THREE.BoxGeometry(1, 1, 1);
function createButton(x, y, z) {
    let b = new THREE.BoxGeometry(1.7, 1.5, 1.7);
    let button = new THREE.Mesh(b, groundMaterialRed);
    button.castShadow = true;
    button.position.set(x, y, z);

    buttonsObj.push(button);
    scene.add(button);
    return setColision(button);

}

function createTile(x, y, z, c, cor) {
    if (c == 0 || c == 2) {
        const textureLoader = new THREE.TextureLoader();
        if (cor == 0)
            var wall = textureLoader.load('./assets/textures/wall.png');
        else if (cor == 1)
            var wall = textureLoader.load('./assets/textures/wallA.png');
        else if (cor == 2)
            var wall = textureLoader.load('./assets/textures/wallB.png');
        else if (cor == 3)
            var wall = textureLoader.load('./assets/textures/wallC.png');


        let wallMaterial = new THREE.MeshLambertMaterial();
        wallMaterial.map = wall;

        let tile = new THREE.Mesh(block, wallMaterial);
        tile.castShadow = true;
        tile.receiveShadow = true;
        tile.position.set(x, y, z);
        scene.add(tile);

        return setColision(tile)
    }
    else {
        let tile = new THREE.Mesh(block, collisionMaterial);
        tile.position.set(x, y, z);
        scene.add(tile);

        return setColision(tile)
    }
}
//adiciona os blocos criados a um vetor de colisoes
var numberBlocks = 0;
function createBlock(x, y, z) {
    numberBlocks++;
    let interactable_block = new THREE.Mesh(block, tileMaterial);
    interactable_block.position.set(x, y, z);
    var textura;
    if (numberBlocks <= 6)
        textura = 1;
    else if (numberBlocks <= 12)
        textura = 2;
    else
        textura = 3;


    loadGLTFFile1(textura, interactable_block);
    interactable_block.castShadow = false;
    scene.add(interactable_block);
    return interactable_block;

}

function setColision(obj) {
    let cubeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    cubeBB.setFromObject(obj);

    return cubeBB;
}



function createPlane(centerX, centerY, centerZ, x, z, local) {
    const textureLoader = new THREE.TextureLoader();
    var tile = textureLoader.load(local);

    tile.wrapS = THREE.RepeatWrapping;
    tile.wrapT = THREE.RepeatWrapping;

    tile.repeat.set(x / 4, z / 4);

    let planeGeometry = new THREE.PlaneGeometry(x, z);
    let planeMaterial = new THREE.MeshLambertMaterial();
    planeMaterial.map = tile;


    let plane = new THREE.Mesh(planeGeometry, planeMaterial);

    plane.receiveShadow = true;

    plane.position.set(centerX, centerY, centerZ)
    plane.rotateX(-1.5708);
    scene.add(plane);

    let planeBB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    planeBB.setFromObject(plane);

    return planeBB;
}




//=====================================================nivel 0===============================================================//
let max = 52;

createArch(52);
createStairs(52);

colisions.push(createPlane(-0.2, 0, 0, 51, 51, './assets/textures/tile5.png'));

//wall bounds
for (var i = 0; i < max; i++) {
    if (!(i >= ((max / 2) - 2) && i < ((max / 2) + 3)))//porta
        colisions.push(createTile(i - (max / 2), 0.5, (max / 2) - 1, 0, 0));
}
for (var i = 0; i < max; i++) {
    if (!(i >= ((max / 2) - 2) && i < ((max / 2) + 3)))//porta
        colisions.push(createTile(i - (max / 2), 0.5, -1 * (max / 2), 0, 0));
}
for (var i = 0; i < max; i++) {
    if (!(i >= ((max / 2) - 2) && i < ((max / 2) + 3)))//porta
        colisions.push(createTile(-1 * max / 2, 0.5, i - (max / 2), 0, 0));
}
for (var i = 0; i < max; i++) {
    if (!(i >= ((max / 2) - 2) && i < ((max / 2) + 3)))//porta
        colisions.push(createTile((max / 2) - 1, 0.5, i - (max / 2), 0, 0));
}

let materialPorta0 = new THREE.MeshLambertMaterial({
    color: "rgb(18,10,143)",
    opacity: 0.5,
    transparent: true
});
let materialPorta1 = new THREE.MeshLambertMaterial({
    color: "rgb(255,255,0)",
    opacity: 0.5,
    transparent: true
});
let materialPorta2 = new THREE.MeshLambertMaterial({
    color: "rgb(255,0,0)",
    opacity: 0.5,
    transparent: true
});



createPorta(5, 0.8, 0, 4.75, 25, materialPorta0)//0
createPorta(0.8, 5, -25.98, 4.75, 0, materialPorta1)//1
createPorta(0.8, 5, 25, 4.75, 0, materialPorta2)//2

//portas dentro das areas
createPorta(5, 0.8, 0, 4.75, 68, materialPorta0)//3
createPorta(0.8, 5, 79, 2.75, 0, materialPorta2)//4

function createPorta(scaleX, scaleZ, x, y, z, material) {


    //criação das portas
    let porta_mesh = new THREE.BoxGeometry(scaleX, 9.5, scaleZ);
    let porta_trigger = new THREE.BoxGeometry(scaleX * 25, 9.5, scaleZ * 25);
    let porta = new THREE.Mesh(porta_mesh, material);
    porta.castShadow = true
    let porta_trigger_obj = new THREE.Mesh(porta_trigger, collisionMaterial)
    //posições
    porta_trigger_obj.position.set(x, y, z)
    porta.position.set(x, y, z);
    //colisoes
    let col1 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    col1.setFromObject(porta);
    let trigger1 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
    trigger1.setFromObject(porta_trigger_obj);
    //adiciona na cena
    scene.add(porta_trigger_obj)
    scene.add(porta)
    //adiciona a colisão no array de colisoes
    door_collisions.push(col1)
    door_triggers.push(trigger1)
    doors.push(porta)
}

//=============================================================================================================================//



//=====================================================nivel 1===============================================================//

// plataform
colisions.push(createPlane(1, -2, -49.25, 25, 38.5, './assets/textures/tile1.png'));

//wals

for (var i = 0; i < 26; i++) {
    if (!(i >= 10 && i <= 11))
        colisions.push(createTile(i - 11, -1.5, -68, 0, 1, 1));
}
for (var i = 0; i < 26; i++) {
    if (!(i >= 9 && i <= 13))
        colisions.push(createTile(i - 11, -1.5, -31, 0, 1, 1));
}
for (var i = 0; i < 38; i++) {
    colisions.push(createTile(-11, -1.5, i - 68, 0, 1, 1));
}
for (var i = 0; i < 38; i++) {
    colisions.push(createTile(14, -1.5, i - 68, 0, 1, 1));
}

//obj

for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 14; j++) {
        colisions.push(createTile(i - 5, -2.5, -85 + j, 0, 1, 1));
    }
}

blocks.push(createBlock(6, -1.5, -43));
let cube0 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube0.setFromObject(blocks[0]);
block_colisions.push(cube0);

blocks.push(createBlock(-4, -1.5, -56));
let cube1 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1.setFromObject(blocks[1]);
block_colisions.push(cube1);



blocks.push(createBlock(-3, -1.5, -45));
let cube2 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube2.setFromObject(blocks[2]);
block_colisions.push(cube2);

blocks.push(createBlock(-7, -1.5, -47));
let cube3 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube3.setFromObject(blocks[3]);
block_colisions.push(cube3);

blocks.push(createBlock(4, -1.5, -50));
let cube4 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube4.setFromObject(blocks[4]);
block_colisions.push(cube4);

blocks.push(createBlock(7, -1.5, -60));
let cube5 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube5.setFromObject(blocks[5]);
block_colisions.push(cube5);

//ponte

var posicionados = new Array(6).fill(false)
// wals
for (var i = 0; i < 11; i++) {
    colisions.push(createTile(i - 5, -1.5, -85, 0, 1));
}
for (var i = 0; i < 14; i++) {
    colisions.push(createTile(-5, -1.5, -85 + i, 0, 1));
}

for (var i = 0; i < 14; i++) {
    colisions.push(createTile(5, -1.5, -85 + i, 0, 1));
}




//=============================================================================================================================//



//=====================================================nivel 2===============================================================//


// plataform
colisions.push(createPlane(2, 2, 49.5, 25, 38, './assets/textures/tile3.png'));

//obj

blocks.push(createBlock(-8, 2.5, 40));
let cube6 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube5.setFromObject(blocks[6]);
block_colisions.push(cube6);

blocks.push(createBlock(-3, 2.5, 50));
let cube7 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube5.setFromObject(blocks[7]);
block_colisions.push(cube7);

blocks.push(createBlock(-1, 2.5, 45));
let cube8 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube5.setFromObject(blocks[8]);
block_colisions.push(cube8);

blocks.push(createBlock(3, 2.5, 52));
let cube9 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube5.setFromObject(blocks[9]);
block_colisions.push(cube9);

blocks.push(createBlock(5, 2.5, 55));
let cube10 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube5.setFromObject(blocks[10]);
block_colisions.push(cube10);

blocks.push(createBlock(8, 2.5, 43));
let cube11 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube5.setFromObject(blocks[11]);
block_colisions.push(cube11);

for (var i = 0; i <= 2; i++) {
    buttons.push(createButton(-4 + i * 5, 1.75, 57, 0, 3));
}

//walls
for (var i = 0; i < 26; i++) {
    if (!(i >= 9 && i <= 13))
        colisions.push(createTile(i - 11, 2.5, 31, 0, 2));
}
for (var i = 0; i < 26; i++) {
    if (!(i >= 9 && i <= 13))
        colisions.push(createTile(i - 11, 2.5, 68, 0, 2));
}
for (var i = 0; i < 38; i++) {
    colisions.push(createTile(-11, 2.5, i + 31, 0, 2));
}
for (var i = 0; i < 38; i++) {
    colisions.push(createTile(14, 2.5, i + 31, 0, 2));
}

//objs

for (var i = 0; i < 11; i++) {
    for (var j = 0; j < 14; j++) {
        colisions.push(createTile(i - 5, 1.5, 69 + j, 0, 2));
    }
}

// walls 
for (var i = 0; i < 11; i++) {
    colisions.push(createTile(i - 5, 2.5, 82, 0, 2));
}
for (var i = 0; i < 14; i++) {
    colisions.push(createTile(-5, 2.5, 69 + i, 0, 2));
}

for (var i = 0; i < 14; i++) {
    colisions.push(createTile(5, 2.5, 69 + i, 0, 2));
}

//=============================================================================================================================//





//=====================================================nivel 3===============================================================//
//plataform
colisions.push(createPlane(55, -2, 1, 49, 24, './assets/textures/tile0.png'));


//walls 

for (var i = 0; i < 50; i++) {
    colisions.push(createTile(30 + i, -1.5, -11, 0, 3));
}
for (var i = 0; i < 50; i++) {
    colisions.push(createTile(30 + i, -1.5, 13, 0, 3));
}
for (var i = 0; i < 25; i++) {
    if (!(i >= 9 && i <= 13))
        colisions.push(createTile(30, -1.5, i - 11, 0, 3));
}
for (var i = 0; i < 25; i++) {
    if (!(i >= 9 && i <= 13))
        colisions.push(createTile(79, -1.5, i - 11, 0, 3));
}

const butonMaterialRed = new THREE.MeshLambertMaterial(
    {
        color: '#610C04',
        emissive: 0xff0000,
        emissiveIntensity: 1,
    }
);

//butons
for (var i = 0; i < 4; i++) {
    let butons = new THREE.BoxGeometry(0.5, 0.5, 2);
    let buton = new THREE.Mesh(butons, butonMaterialRed);
    buton.position.set(46 + i * 9, -1.5, 12.5);
    scene.add(buton);
}
for (var i = 0; i < 4; i++) {
    let butons = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    let buton = new THREE.Mesh(butons, butonMaterialRed);
    buton.position.set(46 + i * 9, -1.5, -10.5);
    scene.add(buton);
}

///spotlights

for (var i = 0; i < 4; i++) {
    let spotlight = new THREE.SpotLight("rgb(244,244,244)");
    spotlight.position.set(46 + i * 9, 0.5, 8.5);;
    spotlight.target.position.set(46 + i * 9, -1.5, 8.5);;
    spotlight.target.updateMatrixWorld();

    spotlight.penumbra = .2;

    scene.add(spotlight);
    spotlights.push(spotlight);
}

for (var i = 0; i < 4; i++) {
    let spotlight = new THREE.SpotLight("rgb(244,244,244)");
    spotlight.position.set(46 + i * 9, 0.5, -7.5);;
    spotlight.target.position.set(46 + i * 9, -1.5, -7.5);;
    spotlight.target.updateMatrixWorld();

    spotlight.penumbra = 0.2;

    scene.add(spotlight);
    spotlights.push(spotlight);
}



//objs
for (var i = 0; i < 14; i++) {
    for (var j = 0; j < 11; j++) {
        colisions.push(createTile(i + 80, -2.5, j - 5, 0, 3));
    }
}

blocks.push(createBlock(55, -1.5, -7));
let cube12 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube12.setFromObject(blocks[12]);
block_colisions.push(cube12);
blocks[12].visible = false;


blocks.push(createBlock(46, -1.5, 8));
let cube13 = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube13.setFromObject(blocks[13]);
block_colisions.push(cube13);
blocks[13].visible = false;


buttons.push(createButton(64, -2.25, 8, 0, 2));
buttons.push(createButton(46, -2.25, -7, 0, 2));




//walls
for (var i = 0; i < 14; i++) {
    colisions.push(createTile(i + 80, -1.5, -5, 0, 3));
}
for (var i = 0; i < 14; i++) {
    colisions.push(createTile(i + 80, -1.5, +5, 0, 3));
}

for (var i = 0; i < 9; i++) {
    colisions.push(createTile(93, -1.5, -4 + i, 0, 3));
}





//=============================================================================================================================//


//=======================================================nivel final===========================================================//
//plataform
colisions.push(createPlane(-35.5, 2.01, 0, 11, 11, './assets/textures/tile2.png'));
for (var i = 0; i < 2; i++) {
    for (var j = 0; j < 2; j++) {
        colisions.push(createTile(i - 36, 1.75, j - 1, 0, 3))
    }
}

//============================================================================================================================//




//========================================================================================================//
//===========================================CRIAÇÃO DAS CAMERAS==========================================//
// variavel para a troca de camera
let cameraControl = 1;

let camParam = 90;
let camera1 = new THREE.OrthographicCamera(-window.innerWidth / camParam, window.innerWidth / camParam, window.innerHeight / camParam, window.innerHeight / -camParam, -camParam, camParam);
let camera2 = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
let camera3 = new THREE.OrthographicCamera(-window.innerWidth / camParam, window.innerWidth / camParam, window.innerHeight / camParam, window.innerHeight / -camParam, -camParam, camParam);
let cameraHolder1 = new THREE.Object3D();
cameraHolder1.add(camera1);
characterBox.add(cameraHolder1);


let cameraHolder2 = new THREE.Object3D();
cameraHolder2.add(camera2);
characterBox.add(cameraHolder2);


let cameraHolder3 = new THREE.Object3D();
cameraHolder3.add(camera3);
characterBox.add(cameraHolder3);

var camera = camera1;

window.addEventListener('resize', redimensionar);

function redimensionar() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);

}
//posicionamento das cameras
cameraHolder1.translateX(6);
cameraHolder1.translateY(3);
cameraHolder1.translateZ(-6);
cameraHolder1.rotateY(2.37);
cameraHolder1.rotateX(-0.5);

cameraHolder2.translateX(10);
cameraHolder2.translateY(12);
cameraHolder2.translateZ(-10);
cameraHolder2.rotateY(2.37);
cameraHolder2.rotateX(-0.79);

// cameraHolder3.translateX(6);
// cameraHolder3.translateY(2);
// cameraHolder3.translateZ(6);
// cameraHolder3.rotateY(0.79);
// cameraHolder3.rotateX(-0.2);
// cameraHolder3.position.setFromSphericalCoords(5, Math.PI / 3, Math.PI / 4);
//========================================================================================================//
//========================================================================================================//






//========================================================================================================//
//*******************************Sistema de Colisão e Seleção de Objetsos******************************** */
let collisionGeometry = new THREE.BoxGeometry(0.3, 0.2, 0.5);
let collisionGeometryGravity = new THREE.BoxGeometry(0.001, 2.3, 0.001);


let collision1 = new THREE.Mesh(collisionGeometry, collisionMaterial);
let collision2 = new THREE.Mesh(collisionGeometry, collisionMaterial);
let collision3 = new THREE.Mesh(collisionGeometry, collisionMaterial);
let collision4 = new THREE.Mesh(collisionGeometry, collisionMaterial);

let collisionGround = new THREE.Mesh(collisionGeometryGravity, collisionMaterial);

collision3.rotateY(1.5708);
collision4.rotateY(1.5708);

collision1.position.set(0.3, -0.5, 0);
collision2.position.set(-0.3, -0.5, 0);
collision3.position.set(0, -0.5, -0.3);
collision4.position.set(0, -0.5, 0.3);

characterBox.add(collision1); //D
characterBox.add(collision2); //A
characterBox.add(collision3); //W
characterBox.add(collision4); //S

characterBox.add(collisionGround);


// colisão cube
let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(characterBox);

let D1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(collision1);

let A1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(collision2);

let W1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(collision3);

let S1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(collision4);


let G1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
cube1BB.setFromObject(collisionGround);



function checkCollisions() {
    var fall = 0
    var jump = false;

    for (var i = 0; i < colisions.length; i++) {
        if (colisions[i].intersectsBox(cube1BB)) { jump = true; }
        if (colisions[i].intersectsBox(A1BB)) { offD = false; }
        if (colisions[i].intersectsBox(W1BB)) { offS = false; }
        if (colisions[i].intersectsBox(D1BB)) { offA = false; }
        if (colisions[i].intersectsBox(S1BB)) { offW = false; }
        if (colisions[i].intersectsBox(G1BB)) { fall = fall + 1; }
    }
    for (var i = 0; i < door_collisions.length; i++) {
        if (door_collisions[i].intersectsBox(A1BB)) { offD = false; }
        if (door_collisions[i].intersectsBox(W1BB)) { offS = false; }
        if (door_collisions[i].intersectsBox(D1BB)) { offA = false; }
        if (door_collisions[i].intersectsBox(S1BB)) { offW = false; }
    }
    for (var i = 0; i < block_colisions.length; i++) {
        if (block_colisions[i].intersectsBox(A1BB)) { offD = false; }
        if (block_colisions[i].intersectsBox(W1BB)) { offS = false; }
        if (block_colisions[i].intersectsBox(D1BB)) { offA = false; }
        if (block_colisions[i].intersectsBox(S1BB)) { offW = false; }
    }
    //console.log(fall);

    for (var i = 0; i < key_collisions.length; i++) {
        if (key_collisions[i].intersectsBox(D1BB) || key_collisions[i].intersectsBox(S1BB) || key_collisions[i].intersectsBox(A1BB)) {
            if (i == 0) {
                hasBlueKey = true
                keys[0].position.set(1000, 0, 0)
            }
            if (i == 1) {
                hasRedKey = true
                keys[1].position.set(1000, 0, 0)
            }
            if (i == 2) {
                hasYellowKey = true
                keys[2].position.set(1000, 0, 0)
            }
        }
    }

    for (var i = 0; i < door_triggers.length; i++) {
        if (door_triggers[i].intersectsBox(D1BB) || door_triggers[i].intersectsBox(S1BB) || door_triggers[i].intersectsBox(A1BB)) {
            if (i == 0 && hasBlueKey) {
                if (soundDoor0 == true) {
                    soundDoor0 = false;
                    doorSound();
                }

                const posTarget = new THREE.Vector3(0, -4.75, 25)
                doors[0].position.lerp(posTarget, 0.1)
                setTimeout(() => {
                    door_collisions[0].translate(new THREE.Vector3(1000, 1000, 1000));
                    door_triggers[0].translate(new THREE.Vector3(1000, 1000, 1000));
                }, 2000);
            }
            if (i == 1 && hasYellowKey) {
                if (soundDoor1 == true) {
                    soundDoor1 = false;
                    doorSound();
                }


                const posTarget = new THREE.Vector3(-25.98, -4.75, 0)
                doors[1].position.lerp(posTarget, 0.1)
                setTimeout(() => {
                    door_collisions[1].translate(new THREE.Vector3(1000, 1000, 1000));
                    door_triggers[1].translate(new THREE.Vector3(1000, 1000, 1000));
                }, 2000);
            }
            if (i == 2 && hasRedKey) {
                if (soundDoor2 == true) {
                    soundDoor2 = false;
                    doorSound();
                }
                const posTarget = new THREE.Vector3(25, -4.75, 0)
                doors[2].position.lerp(posTarget, 0.1)

                setTimeout(() => {
                    door_collisions[2].translate(new THREE.Vector3(1000, 1000, 1000));
                    door_triggers[2].translate(new THREE.Vector3(1000, 1000, 1000));
                }, 2000);
            }
            //*************************************************************************** */
            //*************************************************************************** */
            //AQUI ESTAO AS PORTAS DO PUZZLE, A PORTA DE ID 3 É A DO PUZZLE AZUL E A COM ID 4 É DO PUZZLE VERMELHO
            if (i == 3 && puzzle1Completo) {
                if (soundDoorPuzzle0 == true) {
                    soundDoorPuzzle0 = false;
                    doorSound();
                }

                const posTarget = new THREE.Vector3(0, -4.75, 68)
                doors[3].position.lerp(posTarget, 0.1)
                setTimeout(() => {
                    door_collisions[3].translate(new THREE.Vector3(1000, 1000, 1000));
                    door_triggers[3].translate(new THREE.Vector3(1000, 1000, 1000));
                }, 1200);
            }
            if (i == 4 && puzzle2Completo) {
                if (soundDoorPuzzle1 == true) {
                    soundDoorPuzzle1 = false;
                    doorSound();
                }
                const posTarget = new THREE.Vector3(79, -6.75, 0)
                doors[4].position.lerp(posTarget, 0.1)
                setTimeout(() => {
                    door_collisions[4].translate(new THREE.Vector3(1000, 1000, 1000));
                    door_triggers[4].translate(new THREE.Vector3(1000, 1000, 1000));
                }, 2000);
            }
        }


    }

    if (jump) {
        characterBox.translateY(0.18);
    }

    if (fall < 1) {
        if (characterBox.position.y < -1) {
            characterBox.position.set(0, 2, 0);
        }
        cair();
    }


    for (var i = 0; i < 5; i++) {
        botoesAcionados[i] = false;
    }
    for (var i = 0; i < 5; i++) {
        for (var j = 0; j < 14; j++)

            if (buttons[i].intersectsBox(block_colisions[j])) {

                botoesAcionados[i] = true;
            }

    }
    for (var i = 0; i < 5; i++) {
        if (i <= 2) {
            if (botoesAcionados[i] && (buttonsObj[i].position.y > 1.5)) {
                buttonsObj[i].translateY(-0.1);
            }
        }
        else {
            if (botoesAcionados[i] && (buttonsObj[i].position.y > -2.5)) {
                buttonsObj[i].translateY(-0.1);
            }
        }
    }
    for (var i = 0; i < 5; i++) {
        if (i <= 2) {
            if ((botoesAcionados[i] == false) && (buttonsObj[i].position.y < 1.8)) {
                buttonsObj[i].translateY(0.1);
            }
        }
        else {
            if (!(botoesAcionados[i]) && (buttonsObj[i].position.y < -2.25)) {
                buttonsObj[i].translateY(0.1);
            }
        }
    }

    if (botoesAcionados[0] + botoesAcionados[1] + botoesAcionados[2] > apertadosPuzzle0) {
        apertadosPuzzle0 = botoesAcionados[0] + botoesAcionados[1] + botoesAcionados[2];
        buttonSound();
    }

    if (botoesAcionados[3] + botoesAcionados[4] > apertadosPuzzle1) {
        apertadosPuzzle1 = botoesAcionados[3] + botoesAcionados[4];
        buttonSound();
    }


    if ((botoesAcionados[0] && botoesAcionados[1] && botoesAcionados[2]) || testOn) {

        puzzle1Completo = true;
    }
    else {
        puzzle1Completo = false;
    }
    if (botoesAcionados[3] && botoesAcionados[4] || testOn) {
        puzzle2Completo = true;
    }
    else {
        puzzle2Completo = false;
    }

}




function cair() {
    characterBox.translateY(-0.2);
}



//Detecta clicks nos blocos clicáveis
const raycaster = new THREE.Raycaster();
const clickMouse = new THREE.Vector2();

var carregando_obj = false;
var objeto_carregado;

var v = new THREE.Vector3(0, 0, 0);
console.log(v)

function createBridge(x, z, index) {
    posicionados[index] = true
    objeto_carregado.position.set(x, -2.5, z)
    objeto_carregado.material = collisionMaterial
    colisions.push(setColision(objeto_carregado))
}


window.addEventListener('click', Event => {
    clickMouse.x = (Event.clientX / window.innerWidth) * 2 - 1;
    clickMouse.y = -(Event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(clickMouse, camera);
    const found = raycaster.intersectObject(scene);

    if (found[0] != null && (found[0].object.material == tileMaterial || found[0].object.material == tileMaterialSelected)) {
        objeto_carregado = found[0].object;
        var dist = characterBox.position.distanceTo(objeto_carregado.position);
        if (objeto_carregado.material == tileMaterial && !carregando_obj && dist < 4) {
            carregando_obj = true

            objeto_carregado.material = tileMaterialSelected;
            objeto_carregado.position.set(0, 1, -2);
            characterBox.add(objeto_carregado)
            objeto_carregado.getWorldPosition(v);

        }
        else if (carregando_obj && objeto_carregado.material == tileMaterialSelected) {
            carregando_obj = false
            objeto_carregado.material = tileMaterial;
            objeto_carregado.getWorldPosition(v);
            scene.add(objeto_carregado)

            objeto_carregado.position.set(Math.round(v.x), Math.round(v.y), Math.round(v.z))
            console.log(objeto_carregado.position)

            //verifica ponte
            if ((Math.round(v.x) < 3 || Math.round(v.x) > -3) && Math.round(v.z) > -72) {
                if (Math.round(v.z) == -69 && !posicionados[0]) {
                    createBridge(0, -69, 0)
                    thumpSound()
                }
                else if (Math.round(v.z) == -69 && !posicionados[1]) {
                    createBridge(-1, -69, 1)
                    thumpSound()
                }
                else if (Math.round(v.z) == -70 && !posicionados[2]) {
                    createBridge(0, -70, 2)
                    thumpSound()
                }
                else if (Math.round(v.z) == -70 && !posicionados[3]) {
                    createBridge(-1, -70, 3)
                    thumpSound()
                }
                else if (Math.round(v.z) == -71 && !posicionados[4]) {
                    createBridge(0, -71, 4)
                    thumpSound()
                }
                else if (Math.round(v.z) == -71 && !posicionados[5]) {
                    createBridge(-1, -71, 5)
                    thumpSound()
                }
                else
                    objeto_carregado.position.set(Math.round(v.x), Math.round(v.y) - 1.5, Math.round(v.z))
            }
            else {
                objeto_carregado.position.set(Math.round(v.x), Math.round(v.y) - 1.5, Math.round(v.z))
            }

        }
    }
});
//*********************************************************************************************************/
//========================================================================================================//





//==========================================CARREGA O MODELO================================================//
// Load animated files
loadGLTFFile('../assets/objects/walkingMan.glb', false);

function loadGLTFFile(modelName) {

    loader.load(modelName, function (gltf) {
        var obj = gltf.scene;
        obj.traverse(function (child) {
            if (child) {
                child.castShadow = true;
            }
        });
        obj.traverse(function (node) {
            if (node.material) node.material.side = THREE.DoubleSide;
        });
        // The man around will have a different geometric transformation

        man = obj;
        characterBox.add(man);

        man.position.set(0, -1.1, 0);

        // Create animationMixer and push it in the array of mixers
        var mixerLocal = new THREE.AnimationMixer(obj);
        mixerLocal.clipAction(gltf.animations[0]).play();
        mixer.push(mixerLocal);
    }, onProgress, onError);
}

function onError() { };

function onProgress(xhr, model) {
    if (xhr.lengthComputable) {
        var percentComplete = xhr.loaded / xhr.total * 100;
    }
}

// instantiate a loader
const loader1 = new OBJLoader();

loadKey(0, -1.5, -78, 0x45AFF)//blue
loadKey(0, 2.5, 75, 0xF12323)//red
loadKey(86, -1.5, 0, 0xFFE53F)//yellow

function loadKey(x, y, z, color) {
    loader1.load(
        '../T3/key.obj',
        function (object) {
            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.color.setHex(color);
                }
            });
            object.scale.set(0.01, 0.01, 0.01) //XD
            object.position.set(x, y, z)
            let col = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
            col.setFromObject(object);
            scene.add(object);
            keys.push(object);
            key_collisions.push(col)
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened');
        }
    );
}

//==========================================================================================================//
//==========================================================================================================//








//========================================================================================================//
//==============================================MOVIMENTAÇÃO==============================================//
// variavel controle de movimento
var offA = true;
var offS = true;
var offW = true;
var offD = true;

var degreeAtt = 0;
var target = 0;

//controles teclado 
var testOn = false;

function testMode() {
    if (keyboard.down("T")) {

        testOn = !testOn;
        hasBlueKey = !hasBlueKey;
        hasRedKey = !hasRedKey;
        hasYellowKey = !hasYellowKey;
        puzzle1Completo = !puzzle1Completo;
        puzzle2Completo = !puzzle2Completo;

    }
}
function keyboardUpdate() {

    keyboard.update();
    var speed = 7;
    var moveDistance = speed * clock.getDelta();
    var partialDegree = 0;
    var pressedKeys = 0;


    if (keyboard.down("C")) {
        if (cameraControl == 0) {
            camera = camera1;
            cameraControl = 1;
        }
        else if (cameraControl == 1) {
            camera = camera2;
            cameraControl = 2;

        }
        else {
            camera = camera3;
            cameraControl = 0;

        }

    }

    if ((keyboard.pressed("A") || keyboard.pressed("left")) && offA && (keyboard.pressed("W") || keyboard.pressed("up")) && offW) {
        characterBox.translateZ(moveDistance);
        partialDegree = 0;

        pressedKeys++;
    }

    else if ((keyboard.pressed("D") || keyboard.pressed("right")) && offD && (keyboard.pressed("W") || keyboard.pressed("up")) && offW) {
        characterBox.translateX(-moveDistance);
        partialDegree = partialDegree + 270;

        pressedKeys++;

    } else if ((keyboard.pressed("D") || keyboard.pressed("right")) && offD && (keyboard.pressed("S") || keyboard.pressed("down")) && offS) {
        characterBox.translateZ(-moveDistance);
        partialDegree = partialDegree + 180;

        pressedKeys++;

    } else if ((keyboard.pressed("A") || keyboard.pressed("left")) && offA && (keyboard.pressed("S") || keyboard.pressed("down")) && offS) {
        characterBox.translateX(moveDistance);
        partialDegree = partialDegree + 90;

        pressedKeys++;

    } else {
        var axisA = new THREE.Vector3(-0.75, 0, -0.75);
        var axisS = new THREE.Vector3(-0.75, 0, 0.75);
        var axisD = new THREE.Vector3(0.75, 0, 0.75);
        var axisW = new THREE.Vector3(0.75, 0, -0.75);

        if ((keyboard.pressed("A") || keyboard.pressed("left")) && offA) {
            characterBox.translateOnAxis(axisA, -moveDistance);
            partialDegree = partialDegree + 45;

            pressedKeys++;
        }

        if ((keyboard.pressed("S") || keyboard.pressed("down")) && offS) {
            characterBox.translateOnAxis(axisS, -moveDistance);
            partialDegree = partialDegree + 135;

            pressedKeys++;
        }

        if ((keyboard.pressed("D") || keyboard.pressed("right")) && offD) {
            characterBox.translateOnAxis(axisD, -moveDistance);
            partialDegree = partialDegree + 225;

            pressedKeys++;
        }

        if ((keyboard.pressed("W") || keyboard.pressed("up")) && offW) {
            characterBox.translateOnAxis(axisW, -moveDistance);
            partialDegree = partialDegree + 315;

            pressedKeys++;
        }

    }


    if (pressedKeys) {
        for (var i = 0; i < mixer.length; i++)
            mixer[i].update(moveDistance / 5);
        target = partialDegree;
        if (target != degreeAtt) {
            ratationAnimation();
        }
    }


    offD = true;
    offS = true;
    offA = true;
    offW = true;

}

//Rotation Handler
function ratationAnimation() {
    var velocity = 0;
    var a = target - degreeAtt;
    var b = target - degreeAtt + 360;
    var y = target - degreeAtt - 360;

    var shortest = a;
    if ((b * b) < (shortest * shortest))
        shortest = b;
    if ((y * y) < (shortest * shortest))
        shortest = y;

    if (shortest < 0) {
        velocity = -15;
    }
    else
        velocity = 15;

    man.rotateY(THREE.MathUtils.degToRad(velocity));
    if (velocity < 0 && degreeAtt == 0)
        degreeAtt = 360;

    degreeAtt = degreeAtt + velocity;
    degreeAtt = degreeAtt % 360;
}
//========================================================================================================//
//========================================================================================================//
function attcolisisionsMovables() {
    for (var i = 0; i < block_colisions.length; i++)
        block_colisions[i].copy(blocks[i].geometry.boundingBox).applyMatrix4(blocks[i].matrixWorld);
}

function spotlightscontrol() {

    buttonsObj[3].visible = false;
    buttonsObj[4].visible = false;

    if (puzzle2Completo) {
        for (var i = 0; i < 8; i++) {
            spotlights[i].intensity = 1;
            blocks[12].visible = true;
            blocks[13].visible = true;
            buttonsObj[3].visible = true;
            buttonsObj[4].visible = true;
        }
    }
    else {

        for (var i = 0; i < 8; i++) {
            spotlights[i].intensity = 0;
        }


        if (blocks[12].position.y > -1.5) {
            blocks[12].visible = true;
        } else
            blocks[12].visible = false;

        if (blocks[13].position.y > -1.5) {
            blocks[13].visible = true;
        } else
            blocks[13].visible = false;


        if (characterBox.position.x >= 41 && characterBox.position.x <= 50) {
            if (characterBox.position.z <= 0) {
                spotlights[4].intensity = 1;
                buttonsObj[4].visible = true;
                if (blocks[12].position.x >= 41 && blocks[12].position.x <= 50)
                    if (blocks[12].position.z <= 0)
                        blocks[12].visible = true;
                if (blocks[13].position.x >= 41 && blocks[13].position.x <= 50)
                    if (blocks[13].position.z <= 0)
                        blocks[13].visible = true;

            }
            if (characterBox.position.z > 0) {
                spotlights[0].intensity = 1;
                if (blocks[12].position.x >= 41 && blocks[12].position.x <= 50)
                    if (blocks[12].position.z > 0)
                        blocks[12].visible = true;
                if (blocks[13].position.x >= 41 && blocks[13].position.x <= 50)
                    if (blocks[13].position.z > 0)
                        blocks[13].visible = true;

            }

        } else
            if (characterBox.position.x >= 51 && characterBox.position.x <= 60) {
                if (characterBox.position.z <= 0) {
                    spotlights[5].intensity = 1;
                    if (blocks[12].position.x >= 51 && blocks[12].position.x <= 60)
                        if (blocks[12].position.z <= 0)
                            blocks[12].visible = true;
                    if (blocks[13].position.x >= 51 && blocks[13].position.x <= 60)
                        if (blocks[13].position.z <= 0)
                            blocks[13].visible = true;

                } else
                    if (characterBox.position.z > 0) {
                        spotlights[1].intensity = 1;
                        if (blocks[12].position.x >= 51 && blocks[12].position.x <= 60)
                            if (blocks[12].position.z > 0)
                                blocks[12].visible = true;
                        if (blocks[13].position.x >= 51 && blocks[13].position.x <= 60)
                            if (blocks[13].position.z > 0)
                                blocks[13].visible = true;

                    }


            } else
                if (characterBox.position.x >= 61 && characterBox.position.x <= 70) {
                    if (characterBox.position.z <= 0) {
                        spotlights[6].intensity = 1;
                        if (blocks[12].position.x >= 61 && blocks[12].position.x <= 70)
                            if (blocks[12].position.z <= 0)
                                blocks[12].visible = true;
                        if (blocks[13].position.x >= 61 && blocks[13].position.x <= 70)
                            if (blocks[13].position.z <= 0)
                                blocks[13].visible = true;

                    }
                    if (characterBox.position.z > 0) {
                        spotlights[2].intensity = 1;
                        buttonsObj[3].visible = true;
                        if (blocks[12].position.x >= 61 && blocks[12].position.x <= 70)
                            if (blocks[12].position.z > 0)
                                blocks[12].visible = true;
                        if (blocks[13].position.x >= 61 && blocks[13].position.x <= 70)
                            if (blocks[13].position.z > 0)
                                blocks[13].visible = true;

                    }
                } else
                    if (characterBox.position.x >= 71 && characterBox.position.x <= 80) {
                        if (characterBox.position.z <= 0) {
                            spotlights[7].intensity = 1;
                            if (blocks[12].position.x >= 71 && blocks[12].position.x <= 80)
                                if (blocks[12].position.z <= 0)
                                    blocks[12].visible = true;
                            if (blocks[13].position.x >= 71 && blocks[13].position.x <= 80)
                                if (blocks[13].position.z <= 0)
                                    blocks[13].visible = true;

                        }
                        if (characterBox.position.z > 0) {
                            spotlights[3].intensity = 1;
                            if (blocks[12].position.x >= 71 && blocks[12].position.x <= 80)
                                if (blocks[12].position.z > 0)
                                    blocks[12].visible = true;
                            if (blocks[13].position.x >= 71 && blocks[13].position.x <= 80)
                                if (blocks[13].position.z > 0)
                                    blocks[13].visible = true;

                        }
                    }


    }
}


//========================================================================================================//
//=============================================efeitos sonoros=============================================//

const audioLoader = new THREE.AudioLoader();
const listener = new THREE.AudioListener();
characterBox.add(listener);
const backgroundSound = new THREE.Audio(listener);
audioLoader.load('./assets/music/ambiente.mp3', function (buffer) {
    backgroundSound.setBuffer(buffer);
    backgroundSound.setLoop(true);
    backgroundSound.setVolume(0.05);
    backgroundSound.play();
});

function thumpSound() {
    const audioLoaderthump = new THREE.AudioLoader();
    const listenerthump = new THREE.AudioListener();
    characterBox.add(listenerthump);
    const thumpSound = new THREE.Audio(listenerthump);
    audioLoaderthump.load('./assets/music/thump.wav', function (buffer) {
        thumpSound.setBuffer(buffer);
        thumpSound.setVolume(1);
        thumpSound.play();
    });
}

function doorSound() {
    const audioLoaderdoor = new THREE.AudioLoader();
    const listenerdoor = new THREE.AudioListener();
    characterBox.add(listenerdoor);
    const doorSound = new THREE.Audio(listenerdoor);
    audioLoaderdoor.load('./assets/music/door.mp3', function (buffer) {
        doorSound.setBuffer(buffer);
        doorSound.setVolume(0.5);
        doorSound.play();
    });
}




function completSound() {
    const audioLoadercomplet = new THREE.AudioLoader();
    const listenercomplet = new THREE.AudioListener();
    characterBox.add(listenercomplet);
    const completSound = new THREE.Audio(listenercomplet);
    audioLoadercomplet.load('./assets/music/complete.wav', function (buffer) {
        completSound.setBuffer(buffer);
        completSound.setVolume(1);
        completSound.play();
    });
}

function buttonSound() {
    const audioLoaderbutton = new THREE.AudioLoader();
    const listenerbutton = new THREE.AudioListener();
    characterBox.add(listenerbutton);
    const buttonSound = new THREE.Audio(listenerbutton);
    audioLoaderbutton.load('./assets/music/button.wav', function (buffer) {
        buttonSound.setBuffer(buffer);
        buttonSound.setVolume(1);
        buttonSound.play();
    });
}

function keySound() {
    const audioLoaderkey = new THREE.AudioLoader();
    const listenerkey = new THREE.AudioListener();
    characterBox.add(listenerkey);
    const keySound = new THREE.Audio(listenerkey);
    audioLoaderkey.load('./assets/music/key.mp3', function (buffer) {
        keySound.setBuffer(buffer);
        keySound.setVolume(0.33);
        keySound.play();
    });
}

var coletada0 = false;
var coletada1 = false;
var coletada2 = false;

function SFX() {



    if (hasBlueKey == true && coletada0 == false) {
        coletada0 = true;
        keySound();
    }

    if (hasRedKey == true && coletada1 == false) {
        coletada1 = true;
        keySound();
    }

    if (hasYellowKey == true && coletada2 == false) {
        coletada2 = true;
        keySound();
    }

}





//========================================================================================================//

let img = document.createElement("img");
img.src = "https://www.iconsdb.com/icons/preview/blue/key-6-xxl.png";
document.body.appendChild(img);

function updateKeys() {
    if (hasBlueKey)
        keyCount1.innerHTML = 'x' + 1;
    else
        keyCount1.innerHTML = 'x' + 0;
    if (hasRedKey)
        keyCount2.innerHTML = 'x' + 1;
    else
        keyCount2.innerHTML = 'x' + 0;
    if (hasYellowKey)
        keyCount3.innerHTML = 'x' + 1;
    else
        keyCount3.innerHTML = 'x' + 0;

    if (testOn) {
        test.innerHTML = 'Test Mode On'
    }
    else
        test.innerHTML = 'Test Mode Off'

}
var victorysound = true;


LoadingManager.onProgress = function(a,b,c){
    if(b==c)
        document.querySelector("button").style.display="inline"; //none

}


render();
function render() {



    cube1BB.copy(characterBox.geometry.boundingBox).applyMatrix4(characterBox.matrixWorld);
    D1BB.copy(collision1.geometry.boundingBox).applyMatrix4(collision1.matrixWorld);
    S1BB.copy(collision4.geometry.boundingBox).applyMatrix4(collision4.matrixWorld);
    A1BB.copy(collision2.geometry.boundingBox).applyMatrix4(collision2.matrixWorld);
    W1BB.copy(collision3.geometry.boundingBox).applyMatrix4(collision3.matrixWorld);
    G1BB.copy(collisionGround.geometry.boundingBox).applyMatrix4(collisionGround.matrixWorld);

    checkCollisions();
    if (hasYellowKey && characterBox.position.y >= 3.25 && characterBox.position.x <= -35) {

        endGame();
        if(victorysound)
            completSound();
        victorysound = false;
        
    }

    if (characterBox.position.x >= 23 && dirLight.intensity > 0) {

        dirLight.intensity = dirLight.intensity - 0.02;
        ambLight.intensity = ambLight.intensity - 0.012;
    }
    if (characterBox.position.x < 23 && dirLight.intensity < 0.4) {

        dirLight.intensity = dirLight.intensity + 0.02;
        ambLight.intensity = ambLight.intensity + 0.012;
    }
    requestAnimationFrame(render);
    if (!textVisible) {
        keyboardUpdate();

    }
    SFX();
    testMode();
    updateKeys();

    spotlightscontrol();
    attcolisisionsMovables();
    renderer.render(scene, camera);
}

