import { CubeTextureLoader } from "three";
import { publicUrl } from "@/utilities/publicUrl";

export default function useEnvironmentMap() {
  // * ENVIRONMENT MAP (Textures) * //
  const cubeTextureLoader = new CubeTextureLoader();
  const environmentMap = cubeTextureLoader.load([
    publicUrl("textures/environmentMaps/0/px.jpg"),
    publicUrl("textures/environmentMaps/0/nx.jpg"),
    publicUrl("textures/environmentMaps/0/py.jpg"),
    publicUrl("textures/environmentMaps/0/ny.jpg"),
    publicUrl("textures/environmentMaps/0/pz.jpg"),
    publicUrl("textures/environmentMaps/0/nz.jpg"),
  ]);
  // const environmentMap = cubeTextureLoader.load([
  //   "./textures/environmentMaps/1/px.png",
  //   "./textures/environmentMaps/1/nx.png",
  //   "./textures/environmentMaps/1/py.png",
  //   "./textures/environmentMaps/1/ny.png",
  //   "./textures/environmentMaps/1/pz.png",
  //   "./textures/environmentMaps/1/nz.png",
  // ]);

  return environmentMap;
}
