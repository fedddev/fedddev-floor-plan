import { RowSpace } from "@models/rowSpace.ts";

export async function getRowSpaces(facilityName: string): Promise<RowSpace[]> {
  return (await import(`../${facilityName}/rowSpaces.json`).then(
    (data) => data.default
  )) as RowSpace[];
}
