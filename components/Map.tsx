import * as React from 'react'
import { CustomProjection } from '@visx/geo'
import { geoMercator } from 'd3-geo'
import { scaleQuantize } from '@visx/scale'
import ReactTooltip from 'react-tooltip'
import { VaccineData } from '../pages/index'

type NonEmptyArray<T> = [T, ...T[]]

interface FeatureShape {
  type: 'Feature'
  id: string
  geometry: { coordinates: [number, number][][]; type: 'Polygon' }
  properties: { name: string; vaccineData: NonEmptyArray<VaccineData> }
  population: {
    population: number
  }
  centroid: [number, number]
}

export const background = '#f9f7e8'

const generateColors = (topology) => {
  const colors = [
    ...topology.features.map((f) => {
      return {
        [f.properties.name]: scaleQuantize({
          domain: [Math.min(0), Math.min(parseInt(f.population.population))],
          range: [
            '#D3D3De',
            '#BDBDBD',
            '#9E9E9E',
            '#7D7D7D',
            '#696969',
            '#C5E8B7',
            '#ABE098',
            '#83D475',
            '#57C84D',
            '#2EB62C',
          ],
        }),
      }
    }),
  ]
  return colors
}

const findColorScaleBasedOnState = (colors, state) => {
  return colors.find((color) => {
    if (color[state]) {
      return color
    }
  })
}

export const Map = ({ topology }: { topology: any }) => {
  const width = 800
  const height = 550

  const translate: [number, number] = [width / 15, height * 4.3]
  const scale = 2000
  const colors = generateColors(topology)

  return (
    <div>
      <svg width={width} height={height}>
        <CustomProjection<FeatureShape>
          projection={geoMercator}
          data={topology.features}
          scale={scale}
          translate={translate}
        >
          {(customProjection) => (
            <g>
              {customProjection.features.map(
                (
                  {
                    feature,
                    path,
                  }: {
                    feature: FeatureShape
                    path: string
                  },
                  i
                ) => {
                  const color = findColorScaleBasedOnState(
                    colors,
                    feature.properties.name
                  )[feature.properties.name]

                  return (
                    <g key={`map-feature-${i}`}>
                      <path
                        data-tip={`
                  <b>${feature.properties.name}</b>
                  <br />
                  <b>Erstimpfungen:</b> ${
                    feature.properties.vaccineData[0].firstDosesCumulative
                  }
                  <b>Zweitimpfungen:</b> ${
                    feature.properties.vaccineData[0].secondDosesCumulative
                  }
                  <br />
                  von ${Intl.NumberFormat('de-DE', {
                    notation: 'compact',
                  }).format(feature.population.population)} Einwohnern
                  `}
                        data-for="svgTooltip2"
                        key={`map-feature-${i}`}
                        d={path || ''}
                        fill={color(
                          parseInt(
                            feature.properties.vaccineData[0]
                              .secondDosesCumulative
                          )
                        )}
                        stroke={background}
                        strokeWidth={0.5}
                      ></path>
                    </g>
                  )
                }
              )}
            </g>
          )}
        </CustomProjection>
      </svg>

      <ReactTooltip
        html={true}
        id="svgTooltip2"
        type="warning"
        getContent={(dataTip) => `${dataTip}
        `}
      ></ReactTooltip>
    </div>
  )
}

export default Map
