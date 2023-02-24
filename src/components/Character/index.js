import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// Components
import { Animation } from '../Animation';



export function Character({
  assetPath,
  walkingSpeed,
  meshScaler,
  speedScaler,
  defaultClipAction,
  turningIncrement,
  onLoadCallback }) {
  // LOADER
  const gltfLoader = new GLTFLoader();
  // MODEL
  const mesh = new THREE.Group();
  mesh.matrixAutoUpdate = true;
  mesh.visible = false;
  mesh.position.set(0, 0, 0);
  // ANIMATION
  const animation = Animation();
  // DIRECTION
  const yRotateAngle = new THREE.Vector3(0, 1, 0);
  const yRotateQuaternion = new THREE.Quaternion();
  let yPrev;
  let targetRadians;
  let xDirection;
  let zDirection;
  // SPEED
  let speed = 0;


  setDirection(0);

  gltfLoader.load(assetPath, (gltf) => {
    gltf.scene.scale.set(meshScaler, meshScaler, meshScaler);
    gltf.scene.traverse((node) => { if (node.isMesh) node.castShadow = true });
    const model = gltf.scene;
    model.position.set(0, 0, 0);
    mesh.add(model);
    animation.init(gltf);
    animation.playClipAction(defaultClipAction);
    if (onLoadCallback !== undefined) onLoadCallback();
  });


  const setClipAction = (clipActionName) => {
    animation.playClipAction(clipActionName);
    // SET NEW SPEED
    if (clipActionName === 'Idle') {
      speed = 0;
    } else if (clipActionName === 'Walk') {
      speed = walkingSpeed * speedScaler;
    }
  }
  // SET DIRECTION
  function setDirection (radians) {
    targetRadians = radians;
    yRotateQuaternion.setFromAxisAngle(yRotateAngle, targetRadians);
  }
  // SET POSITION TO HIT TEST RESULTS
  const setMatrixFromArray = (matrixArray) => {
    mesh.position.set(...matrixArray);
    mesh.visible = true;
    //mesh.matrix.fromArray(matrixArray);
  }



  ////////////////////////////////////////
  // UPDATE ANIMATION, POSITION, DIRECTION
  const updateRotation = () => {
    mesh.quaternion.rotateTowards(yRotateQuaternion, turningIncrement);
    const [x, yNow, z, w] = mesh.quaternion.toArray();
    if (yNow !== yPrev) {
      const angle = 2 * Math.acos(w);
      let s;
      if (1 - w * w < 0.000001) {
        s = 1;
      } else {
        s = Math.sqrt(1 - w * w);
      }
      const yAngle = yNow/s * angle;
      xDirection= Math.sin(-yAngle);
      zDirection = Math.cos(yAngle);
      yPrev = yNow;
    }
  }
  const updatePosition = () => {
    mesh.position.x += xDirection * speed;
    mesh.position.z -= zDirection * speed;
  }
  const update = (deltaSeconds) => {
    if (mesh.visible === false) return;
    animation?.update(deltaSeconds);
    updateRotation();
    updatePosition();
  }
//
////////////////////////

  return {
    get mesh() { return mesh },
    get position() { return mesh.position},
    set visible(isVisible) { mesh.visible = isVisible },
    get visible() { return mesh.visible },
    get matrix() { return mesh.matrix },
    get clipActionsMap() { return clipActionsMap },
    update,
    setMatrixFromArray,
    setClipAction,
    setDirection
  }
}
