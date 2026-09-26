import { MetricDimensions } from "./metricDimensions"

export interface PodSpace {
  id: number
  name: string
  fqln: string
  translation?: number[]
  metricDimensions?: MetricDimensions
}