//@ts-ignore
import { MetricDimensions } from "./metricDimensions.ts"

export interface FacilitySpace {
  id: number
  name: string
  fqln: string
  metricDimensions?: MetricDimensions
}