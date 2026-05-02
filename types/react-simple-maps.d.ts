declare module "react-simple-maps" {
  import type * as React from "react"

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    projection?: string | ((...args: unknown[]) => unknown)
    projectionConfig?: {
      scale?: number
      center?: [number, number]
      rotate?: [number, number, number]
      parallels?: [number, number]
    }
    width?: number
    height?: number
    children?: React.ReactNode
  }
  export const ComposableMap: React.FC<ComposableMapProps>

  export interface ZoomableGroupProps extends React.SVGProps<SVGGElement> {
    zoom?: number
    minZoom?: number
    maxZoom?: number
    center?: [number, number]
    onMoveEnd?: (position: { coordinates: [number, number]; zoom: number }) => void
    children?: React.ReactNode
  }
  export const ZoomableGroup: React.FC<ZoomableGroupProps>

  export interface GeographiesProps {
    geography: string | object
    parseGeographies?: (
      features: unknown[],
    ) => Array<{
      rsmKey: string
      properties: Record<string, unknown>
      geometry: unknown
    }>
    children: (args: {
      geographies: Array<{
        rsmKey: string
        properties: Record<string, unknown>
        geometry: unknown
      }>
      projection: unknown
      path: unknown
    }) => React.ReactNode
  }
  export const Geographies: React.FC<GeographiesProps>

  export interface GeographyProps extends React.SVGProps<SVGPathElement> {
    geography: {
      rsmKey: string
      properties: Record<string, unknown>
      geometry: unknown
    }
    style?: {
      default?: React.CSSProperties
      hover?: React.CSSProperties
      pressed?: React.CSSProperties
    }
  }
  export const Geography: React.FC<GeographyProps>

  export const Marker: React.FC<
    React.SVGProps<SVGGElement> & { coordinates: [number, number] }
  >
  export const Annotation: React.FC<
    React.SVGProps<SVGGElement> & {
      subject: [number, number]
      dx?: number
      dy?: number
    }
  >
  export const Sphere: React.FC<React.SVGProps<SVGPathElement>>
  export const Graticule: React.FC<React.SVGProps<SVGPathElement>>
}
