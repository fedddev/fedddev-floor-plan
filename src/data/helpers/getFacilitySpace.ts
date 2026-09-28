//@ts-ignore
import { FacilitySpace } from "@models/facilitySpace.ts";

export async function getFacilitySpace(
  facilityName: string
): Promise<FacilitySpace> {
  try {
    return (await import(
      `../${facilityName}/facilitySpace.json`
    )) as FacilitySpace;
  } catch (error) {
    console.error("error in getFacilitySpace");
    return {} as FacilitySpace;
  }
}
