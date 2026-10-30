import * as THREE from 'three';

/** Con đường tham quan (mặt đất y = 0), từ bến xe buýt tới Quảng Trường Huy Hiệu. */
export const PATH = new THREE.CatmullRomCurve3(
  [
    [0, 0, 0],
    [3, 0, -20],
    [-3, 0, -40],
    [3, 0, -60],
    [-3, 0, -80],
    [2, 0, -100],
    [0, 0, -118],
    [0, 0, -132],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z)),
);
