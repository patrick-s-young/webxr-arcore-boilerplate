import * as THREE from 'three';

export function Floor() {
  const materialBasic = new THREE.MeshBasicMaterial({
    color: 0x00ff00
  });

  const materialShadow = new THREE.ShadowMaterial();
  materialShadow.opacity = 0.3;


  const geometry = new THREE.PlaneGeometry(.5, .5);
  const mesh = new THREE.Mesh( geometry, materialShadow );
  mesh.rotateX(-Math.PI / 2);
  mesh.receiveShadow = true;
  mesh.position.set(0, 0, 0);
  mesh.visible = false;

  const setMatrixFromArray = (matrixArray) => {
    mesh.position.set(...matrixArray);
    mesh.visible = true;;
  }

  return {
    get mesh() { return mesh },
    set position(newPosition) { mesh.position.set(...newPosition)},
    setMatrixFromArray
  }
}