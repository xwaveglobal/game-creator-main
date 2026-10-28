import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createShadowRider } from '../src/ShadowRider.js';

// Geometry/rig smoke test without a WebGL context. Browser rendering is checked separately.
globalThis.document = { createElement: () => ({
  width: 0, height: 0,
  getContext: () => ({ fillRect(){}, beginPath(){}, moveTo(){}, lineTo(){}, stroke(){}, closePath(){}, fill(){} }),
}) };
const rider = createShadowRider();
const stats = rider.getStats();
assert(stats.meshes > 100 && stats.triangles > 10000);
for (const pose of ['ride', 'crouch', 'left', 'right', 'jump', 'slide']) {
  rider.setPose(pose);
  for (let i = 0; i < 90; i++) rider.update(1/60, i/60);
  rider.root.updateMatrixWorld(true);
  rider.root.traverse(object => {
    assert(object.matrixWorld.elements.every(Number.isFinite), `Non-finite transform in ${pose}`);
    if (object.isMesh) assert(object.geometry.attributes.position.array.every(Number.isFinite));
  });
  const lean = rider.root.getObjectByName('motion').rotation.z;
  if (pose === 'left') assert(lean < -.3, 'Left lean must point left from rear camera');
  if (pose === 'right') assert(lean > .3, 'Right lean must point right from rear camera');
  if (pose === 'ride' || pose === 'slide' || pose === 'crouch') {
    rider.root.traverse(object => {
      if (object.name === 'ankle') {
        const p = object.getWorldPosition(new THREE.Vector3());
        assert(Math.abs(p.y - .54) < .025, `Boot left the deck in ${pose}: ${p.y}`);
      }
    });
  }
}
rider.setPose('jump');
for(let i=0;i<35;i++) rider.update(1/60,i/60);
assert(rider.root.getObjectByName('motion').position.y>.65, 'Jump must lift board and character');
console.log('PASS: six poses, finite mesh/rig data, turn directions, boot contact and jump height.', stats);
