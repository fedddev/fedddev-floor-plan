import {MetricDimensions} from './metricDimensions'

export interface CabinetType {
  "id": number
  "name": string
  "description": string
  "metricDimensions": MetricDimensions
}