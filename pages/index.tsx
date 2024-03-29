// csvtojson/index.d.ts file
import * as React from 'react'
import Head from 'next/head'
import { GetStaticProps } from 'next'
import { RiSyringeLine } from 'react-icons/ri'
import * as topojson from 'topojson-client'
import ReactTooltip from 'react-tooltip'
import csv from 'csvtojson'
import { scaleThreshold } from '@visx/scale'
import { LegendItem, LegendLabel, LegendThreshold } from '@visx/legend'

import Map from '../components/Map'
import Footer from '../components/Footer'
import topology from '../public/germany-topo.json'

export const getStaticProps: GetStaticProps<Props> = async () => {
  // eslint-disable-next-line no-console
  console.log('REVALIDATE')
  const res = await fetch(
    `https://raw.githubusercontent.com/mathiasbynens/covid-19-vaccinations-germany/main/data/data.csv`
  )

  const text = await res.text()

  if (res.status !== 200) {
    console.error(text)
    throw new Error('Failed to fetch API')
  }

  const data: VaccineData[] = await csv().fromString(text)
  // eslint-disable-next-line no-console
  console.log(data[data.length - 1])

  return {
    props: { data },
    // revalidate every ten minutes
    revalidate: 600,
  }
}

const threshold = scaleThreshold({
  domain: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
  range: [
    '#D1D5DB',
    '#9CA3AF',
    '#6B7280',
    '#4B5563',
    '#374151',
    '#6EE7B7',
    '#34D399',
    '#10B981',
    '#059669',
    '#047857',
  ],
})

export type VaccineData = {
  date: string
  pubDate: string
  state: string
  totalDosesCumulative: string
  initialDosesCumulative: string
  initialDosesCumulativeBioNTech: string
  initialDosesCumulativeModerna: string
  initialDosesCumulativeAstraZeneca: string
  finalDosesCumulative: string
  finalDosesCumulativeBioNTech: string
  finalDosesCumulativeModerna: string
  finalDosesCumulativeAstraZeneca: string
  finalDosesCumulativeJohnsonAndJohnson: string
  boosterDosesCumulative: string
  boosterDosesCumulativeBioNTech: string
  boosterDosesCumulativeModerna: string
  boosterDosesCumulativeJohnsonAndJohnson: string
  onlyPartiallyVaccinatedCumulative: string
  onlyPartiallyVaccinatedPercent: string
  onlyPartiallyVaccinatedCumulativeBioNTech: string
  onlyPartiallyVaccinatedCumulativeModerna: string
  onlyPartiallyVaccinatedCumulativeAstraZeneca: string
  atLeastPartiallyVaccinatedCumulative: string
  atLeastPartiallyVaccinatedPercent: string
  atLeastPartiallyVaccinatedCumulativeBioNTech: string
  atLeastPartiallyVaccinatedCumulativeModerna: string
  atLeastPartiallyVaccinatedCumulativeAstraZeneca: string
  atLeastPartiallyVaccinatedCumulativeJohnsonAndJohnson: string
  fullyVaccinatedCumulative: string
  fullyVaccinatedPercent: string
  fullyVaccinatedCumulativeBioNTech: string
  fullyVaccinatedCumulativeModerna: string
  fullyVaccinatedCumulativeAstraZeneca: string
  fullyVaccinatedCumulativeJohnsonAndJohnson: string
}

type FeatureShape = {
  type: string
  id: string
  properties: Record<string, any>
  geometry: Record<string, any>
}

type Props = {
  data: VaccineData[]
}

const TOTAL_GERMAN_POPULATION = 88000000

const germanStatePopulation = [
  {
    name: 'Baden-Württemberg',
    population: 11070000,
  },
  {
    name: 'Bayern',
    population: 13077000,
  },
  {
    name: 'Brandenburg',
    population: 3645000,
  },
  {
    name: 'Bremen',
    population: 683000,
  },
  {
    name: 'Hamburg',
    population: 1841000,
  },
  {
    name: 'Hessen',
    population: 6266000,
  },
  {
    name: 'Mecklenburg-Vorpommern',
    population: 1610000,
  },
  {
    name: 'Niedersachsen',
    population: 7982000,
  },
  {
    name: 'Nordrhein-Westfalen',
    population: 17933000,
  },
  {
    name: 'Rheinland-Pfalz',
    population: 4085000,
  },
  {
    name: 'Saarland',
    population: 991000,
  },
  {
    name: 'Sachsen',
    population: 4078000,
  },
  {
    name: 'Sachsen-Anhalt',
    population: 2208000,
  },
  {
    name: 'Schleswig-Holstein',
    population: 2897000,
  },
  {
    name: 'Thüringen',
    population: 2143000,
  },
  {
    name: 'Berlin',
    population: 3669491,
  },
]

const germany = topojson.feature(topology, topology.objects.states) as {
  type: 'FeatureCollection'
  features: FeatureShape[]
}

/**
 *
 * @param german
 */
const mergePopulationDataWithGermanMap = (
  dataWithPopulation: VaccineData[],
  germany: {
    type: 'FeatureCollection'
    features: FeatureShape[]
  }
) => {
  return germany.features.map((feature) => {
    const data = dataWithPopulation.filter((row) => {
      if (row.state === feature.properties.name) {
        return { ...row }
      }
    })
    return {
      ...feature,
      properties: {
        ...feature.properties,
        vaccineData: data.map((row) => {
          return { ...row }
        }),
      },
    }
  })
}

const mergeVaccineDataWithPopulation = () => {
  const germanyTopoJsonWithPopulation = {
    ...germany,
    features: germany.features.map((row) => {
      row['population'] = germanStatePopulation.find((state) => {
        if (row.properties.name === state.name) {
          return state.population
        }
      })
      return { ...row }
    }),
  }
  return germanyTopoJsonWithPopulation
}

const getVaccineDataSample = (
  vaccineData: VaccineData[],
  from: number,
  to: number
): VaccineData[] => {
  const sortedBasedOnDate = [
    ...vaccineData.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }),
  ]

  return sortedBasedOnDate.slice(from, to)
}

export const Home = (props: Props): JSX.Element => {
  const [isTooltipVisible, setTooltipVisibility] = React.useState(false)
  React.useEffect(() => {
    setTooltipVisibility(true)
  }, [])

  const dataVaccineWithPopulation = mergeVaccineDataWithPopulation()

  const dataWithGermanMap = mergePopulationDataWithGermanMap(
    props.data,
    dataVaccineWithPopulation
  )

  const overalVaccinations = getVaccineDataSample(props.data, 0, 16).reduce(
    (prev, curr) => {
      return prev + parseInt(curr.atLeastPartiallyVaccinatedCumulative)
    },
    0
  )
  const lastTimeUpdated = getVaccineDataSample(props.data, 0, 16)[0].date

  const secondDoseVaccinations = getVaccineDataSample(props.data, 0, 16).reduce(
    (prev, curr) => {
      return prev + parseInt(curr.fullyVaccinatedCumulative)
    },
    0
  )
  const moreThenYesterVaccinationsday = Math.round(
    Math.abs(
      (getVaccineDataSample(props.data, 16, 32).reduce((prev, curr) => {
        return prev + parseInt(curr.atLeastPartiallyVaccinatedCumulative)
      }, 0) /
        overalVaccinations) *
        100 -
        100
    )
  )
  const moreThenSecondDoseVaccionationsYesterday = Math.round(
    Math.abs(
      (getVaccineDataSample(props.data, 16, 32).reduce((prev, curr) => {
        return prev + parseInt(curr.fullyVaccinatedCumulative)
      }, 0) /
        secondDoseVaccinations) *
        100 -
        100
    )
  )
  const boosterVaccinations = getVaccineDataSample(props.data, 0, 16).reduce(
    (prev, curr) => {
      return prev + parseInt(curr.boosterDosesCumulative)
    },
    0
  )
  const moreThenYesterBoosterday = Math.round(
    Math.abs(
      (getVaccineDataSample(props.data, 16, 32).reduce((prev, curr) => {
        return prev + parseInt(curr.atLeastPartiallyVaccinatedCumulative)
      }, 0) /
        overalVaccinations) *
        100 -
        100
    )
  )

  return (
    <div className="container mx-auto px-4 max-w-3xl">
      <Head>
        <title>💉 Deutschland COVID-19 Impfstatus Dashboard?</title>
        <meta
          name="description"
          content="A dashboard which shows an overview vaccine status in germany."
        ></meta>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col justify-items-center py-12 content-center">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
            💉🇩🇪 COVID-19 IMPFSTATUS Deutschland
          </h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Ist Deutschland schon geimpft?
          </p>

          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto text-left	">
            Das Dashboard zeigt eine Übersicht über die Anzahl an Menschen in
            Deutschland, die eine COVID-19 💉 Impfung erhalten haben. Die Daten
            werden vom{' '}
            <a
              className="text-indigo-500"
              href="https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Daten/Impfquoten-Tab.html"
            >
              RKI{' '}
            </a>{' '}
            abgerufen, welche zuerst von einem{' '}
            <a
              className="text-indigo-500"
              href="https://github.com/mathiasbynens/covid-19-vaccinations-germany"
            >
              Open-Source-Projekt
            </a>{' '}
            in das CSV Format{' '}
            <a
              className="text-indigo-500"
              href="https://raw.githubusercontent.com/mathiasbynens/covid-19-vaccinations-germany/main/data/data.csv"
            >
              hier
            </a>{' '}
            abgelegt werden. Die Karte zeigt beim hovern, die Anzahl der
            geimpften Personen pro Einwohnerinnen und Einwohner im jeweiligen
            Bundesland. Derzeit haben{' '}
            <b>
              {' '}
              {Intl.NumberFormat('de-DE').format(
                (overalVaccinations / TOTAL_GERMAN_POPULATION) * 100
              )}
              {'%'}
            </b>{' '}
            der Gesamtbevölkerung eine Erstimpfung und{' '}
            <b>
              {Intl.NumberFormat('de-DE').format(
                (secondDoseVaccinations / TOTAL_GERMAN_POPULATION) * 100
              )}
              {'%'}
            </b>{' '}
            eine Zweitimpfung erhalten.
          </p>
          <p className="mt-4">
            letztes Datenupdate vom:{' '}
            {Intl.DateTimeFormat('de-DE').format(new Date(lastTimeUpdated))}
          </p>
        </div>
        <section className="text-gray-600 body-font">
          <div className="container px-5 py-12 mx-auto">
            <div className="flex flex-wrap -m-4 text-center">
              <div className="p-1 md:w-2/4 sm:w-1/2 w-full">
                <div className="relative flex border-2 border-gray-200 px-4 py-12 rounded-lg">
                  <RiSyringeLine
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-500 w-12 h-12 mb-3 inline-block"
                  ></RiSyringeLine>
                  <div className="px-2">
                    <p className="leading-relaxed text-xs text-left">
                      Durchgeführte Erstimpfungen
                    </p>
                    <div className="flex items-baseline">
                      <h2 className="title-font font-medium text-3xl text-gray-900">
                        {Intl.NumberFormat('de-DE', {
                          notation: 'compact',
                        }).format(overalVaccinations)}{' '}
                      </h2>{' '}
                      <span className="text-gray-500 text-xs mx-0.5">
                        {'   '}
                        von 88 Mio.
                      </span>
                      <span
                        data-tip
                        data-for="React-tooltip"
                        className="p-1 bg-green-100 rounded-xl flex items-center space-x-4 text-base font-light text-green-800 absolute bottom-2 right-2"
                      >
                        {' '}
                        ↑ {moreThenYesterVaccinationsday} %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-1 md:w-2/4 sm:w-1/2 w-full">
                <div className="relative flex border-2 border-gray-200 px-4 py-12 rounded-lg">
                  <RiSyringeLine
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-500 w-12 h-12 mb-3 inline-block"
                  ></RiSyringeLine>
                  <div className="px-2">
                    <p className="text-xs leading-relaxed text-left">
                      Durchgeführte Zweitimpfungen
                    </p>
                    <div className="flex items-baseline">
                      <h2 className="title-font font-medium text-3xl text-gray-900">
                        {Intl.NumberFormat('de-DE', {
                          notation: 'compact',
                        }).format(secondDoseVaccinations)}{' '}
                      </h2>{' '}
                      <span className="text-gray-500 text-xs mx-0.5">
                        von 88 Mio.{' '}
                      </span>
                      <span
                        data-tip
                        data-for="React-tooltip"
                        className="p-1 bg-green-100 rounded-xl flex items-center space-x-4 text-base font-light text-green-800 absolute bottom-2 right-2"
                      >
                        {' '}
                        ↑ {moreThenSecondDoseVaccionationsYesterday} %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-1 md:w-2/4 sm:w-1/2 w-full">
                <div className="relative flex border-2 border-gray-200 px-4 py-12 rounded-lg">
                  <RiSyringeLine
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-indigo-500 w-12 h-12 mb-3 inline-block"
                  ></RiSyringeLine>
                  <div className="px-2">
                    <p className="leading-relaxed text-xs text-left">
                      Durchgeführte BoosterImpfung
                    </p>
                    <div className="flex items-baseline">
                      <h2 className="title-font font-medium text-3xl text-gray-900">
                        {Intl.NumberFormat('de-DE', {
                          notation: 'compact',
                        }).format(boosterVaccinations)}{' '}
                      </h2>{' '}
                      <span className="text-gray-500 text-xs mx-0.5">
                        {'   '}
                        von 88 Mio.
                      </span>
                      <span
                        data-tip
                        data-for="React-tooltip"
                        className="p-1 bg-green-100 rounded-xl flex items-center space-x-4 text-base font-light text-green-800 absolute bottom-2 right-2"
                      >
                        {' '}
                        ↑ {moreThenYesterBoosterday} %
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 place-items-center">
          <div className="border-2 border-gray-200 px-4 py-4 rounded-lg">
            <p className="leading-relaxed text-xs text-left text-gray-900 font-semibold">
              Legende
            </p>{' '}
            <p className="leading-relaxed text-xs text-left">
              Zweitimpfung
              <br></br>erhalten
            </p>
            <LegendThreshold scale={threshold}>
              {(labels) =>
                labels.map((label, i) => (
                  <LegendItem key={`legend-quantile-${i}`} margin="1px 0">
                    <LegendLabel align="left" margin="2px 10px 0 0">
                      {i === 0 ? `0 %` : `${label.datum} %`}
                    </LegendLabel>
                    <svg width={15} height={15}>
                      <rect fill={label.value} width={15} height={15} />
                    </svg>
                  </LegendItem>
                ))
              }
            </LegendThreshold>
          </div>
          <Map topology={{ features: dataWithGermanMap }}></Map>
        </div>

        <div className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      BioNTech/Pfizer
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Wurde am 21.12.2020 in Deutschland zugelassen und wird
                      geimpft. Mindestens 60 Millionen Dosen über die EU sowie
                      eine gesicherte Option auf weitere 30 Millionen Dosen
                      national.
                    </dd>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      Moderna
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Wurde am 06.01.2021 in Deutschland zugelassen und wird
                      geimpft. Es wurden 50,5 Millionen Dosen über die EU
                      bestellt, zusätzlich wird hier über zusätzliche Dosen
                      national verhandelt.
                    </dd>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      AstraZeneca
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Wurde am 29.01.2020 zugelassen. Es wurden 56,2 Millionen
                      Dosen über die EU bestellt.
                    </dd>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      CureVac
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Wurde noch nicht zugelassen. Es wurden mindestens 42
                      Millionen Dosen über die EU sowie eine Option auf 20
                      Millionen Dosen national geordert.
                    </dd>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-yellow-500 text-white">
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <dt className="text-lg leading-6 font-medium text-gray-900">
                      Johnson&Johnson
                    </dt>
                    <dd className="mt-2 text-base text-gray-500">
                      Wurde noch nicht zugelassen. Es wurden 37 Millionen Dosen
                      über die EU bestellt.
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
      {isTooltipVisible && (
        <ReactTooltip id="React-tooltip" type="dark" uuid="more">
          Mehr als am Vortag
        </ReactTooltip>
      )}

      <Footer />
    </div>
  )
}

export default Home
