import { CabinetType } from "./cabinetType";

export interface CabinetSpace {
  id: number;
  name: string;
  fqln: string;
  status: string;
  type: CabinetType;
  rotationDegrees: number;
  translation: number[];
}
