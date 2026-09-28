import { RowSpace } from "@models/rowSpace.ts";
import { CabinetSpace } from "@models/cabinetSpace.ts";
import { MetricDimensions } from "@models/metricDimensions.ts";

export async function setRowSpaceDimensionsAndCabinetTranslations(
  rows: RowSpace[],
  cabinets: CabinetSpace[]
): Promise<{
  updatedRows: RowSpace[];
  updatedCabinets: CabinetSpace[];
}> {
  let updatedRows: RowSpace[] = [];
  let updatedCabinets: CabinetSpace[] = [];
  try {
    // get dimensions for all cabinets within this RowSpace
    updatedRows = await Promise.all(
      rows.map(async (row: RowSpace) => {
        let metricWidth: number = 0,
          metricHeight: number = 0,
          metricDepth: number = 0;

        let rowCabinetSpaces: CabinetSpace[] = cabinets.filter(
          (cs: CabinetSpace) => cs.fqln.includes(row.fqln)
        );
        let rowRotation = row.name.includes("01") ? -90 : 90;
        // handle rowCabinetSpaces depending on ASC or DESC row.positionOrder
        if (row.positionOrder === "DESC") {
          rowCabinetSpaces.sort((a: CabinetSpace, b: CabinetSpace) => {
            return a.name > b.name ? 1 : -1;
          });
          // if positionOrder is ASC
        } else {
          rowCabinetSpaces.sort((a: CabinetSpace, b: CabinetSpace) => {
            return a.name > b.name ? -1 : 1;
          });
        }
        for (let rcs of rowCabinetSpaces) {
          // add cabinet width to rowWidth + add 5cm spacing to all but the first cabinet
          metricWidth += ((rcs.type.metricDimensions?.width
            ? (rcs.type.metricDimensions?.width as number)
            : 0) + (rowCabinetSpaces.indexOf(rcs) === 0 ? 0 : 0.05)) as number;
          metricHeight =
            metricHeight > rcs.type.metricDimensions?.height
              ? metricHeight
              : (rcs.type.metricDimensions?.height as number);
          metricDepth =
            metricDepth > rcs.type.metricDimensions?.depth
              ? metricDepth
              : (rcs.type.metricDimensions?.depth as number);
          rcs.translation = row.translation // TODO: ROW03s do not have a translation - fix later
            ? [
                row.translation[0] as number,
                row.translation[1] as number,
                (row.translation[2] + metricWidth) as number,
              ]
            : [0, 0, metricWidth];
          rcs.rotationDegrees = rowRotation;
          updatedCabinets.push(rcs as CabinetSpace);
        }
        // Add up the widths of all the cabinets and the space intervals between them: this is the RowSpace Width
        // Take the tallest cabinet height in the RowSpace: this is the RowSpace Height
        // Take the deepest cabinet depth in the RowSpace: this is the RowSpace Depth
        // console.log(row.fqln + '\'s cabinets length: ', rowCabinetSpaces.length)
        row.metricDimensions = {
          width: metricWidth,
          height: metricHeight,
          depth: metricDepth,
        } as MetricDimensions;
        return row;
      })
    );
    return { updatedRows, updatedCabinets };
  } catch (error) {
    console.log("Error in setRowSpaceDimensionsAndCabinetTranslation: ", error);
    return { updatedRows, updatedCabinets };
  }
}
