import * as THREE from 'three';

/**
 * Nhiều mô hình CC0 để mặc định metalness = 1, nên trông đen khi cảnh không có
 * ảnh môi trường. Hàm này tắt kim loại và bật đổ bóng cho cả cây đối tượng.
 */
export function prepareModel(root: THREE.Object3D, opts: { shadows?: boolean } = {}) {
  root.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    mesh.castShadow = opts.shadows ?? true;
    mesh.receiveShadow = opts.shadows ?? true;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const m of mats) {
      const std = m as THREE.MeshStandardMaterial;
      if (std.isMeshStandardMaterial && !std.metalnessMap) std.metalness = 0;
    }
  });
  return root;
}
