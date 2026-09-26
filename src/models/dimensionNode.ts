//@ts-ignore
import { MetricDimensions } from "./metricDimensions.ts"

export interface DimensionNode {
  name: string
  metricDimensions: MetricDimensions
}