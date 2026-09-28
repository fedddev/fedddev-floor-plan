//@ts-ignore
import { CabinetSpace } from "@models/cabinetSpace.ts";

export async function getCabinetSpaces(
  facilityName: string
): Promise<CabinetSpace[]> {
  return (await import(`../${facilityName}/cabinetSpaces.json`).then(
    (data) => data.default
  )) as CabinetSpace[];
}
