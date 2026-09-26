import { MetricDimensions } from "./metricDimensions"

export interface RowSpace {
  id: number
  name: string
  fqln: string
  status: string
  positionOrder?: string
  translation?: number[]
  metricDimensions?: MetricDimensions
}