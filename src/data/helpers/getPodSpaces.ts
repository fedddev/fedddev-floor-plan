import { PodSpace } from "@models/podSpace";

export async function getPodSpaces(
  facilityName: string
): Promise<PodSpace[]> {
  try {
    return (await import(`@data/${facilityName}/podSpaces.json`).then(
      (data) => data.default
    )) as PodSpace[];
  } catch (error) {
    console.log(
      "The file podSpaces.json does not exist. Run scripts/generate-facilities.mjs to generate the facility:",
      facilityName
    );
    return [];
  }
}
