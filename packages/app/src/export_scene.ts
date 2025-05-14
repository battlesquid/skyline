import { Scene, InstancedMesh } from "three";
import { SceneUtils, STLExporter } from "three-stdlib";

export const exportScene = (scene: Scene | null, name: string) => {
    if (scene === null) {
        return;
    }
    const clone = scene.clone();
    const instanceParent = clone.getObjectByName("instances_container");
    const instances = clone.getObjectByName("instances") as InstancedMesh;
    const meshes = SceneUtils.createMeshesFromInstancedMesh(instances);

    meshes.position.set(0, meshes.position.y, 0);
    meshes.updateMatrix()
    instanceParent?.add(meshes);

    clone.rotation.set(Math.PI / 2, 0, 0);
    clone.updateMatrixWorld();
    const exporter = new STLExporter();
    const data = exporter.parse(clone, { binary: false });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([data], { type: "text/plain" }));
    link.download = `${name}.stl`;
    link.click();
}