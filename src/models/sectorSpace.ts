import {Bounds} from './bounds'

export interface SectorSpace {
  id: number
  name: string
  fqln: string
  metricArea: number
  bounds?: Bounds
}