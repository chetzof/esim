import map from '@amcharts/amcharts4-geodata/worldLow'
import { Miller } from '@amcharts/amcharts4/.internal/charts/map/projections'
import { color, create } from '@amcharts/amcharts4/core'
import {
  MapArcSeries,
  MapChart,
  MapPolygonSeries,
} from '@amcharts/amcharts4/maps'
import { getCssVar } from 'quasar'
import { watch, Ref } from 'vue'

import {
  getCountryISOUppercase,
  getCountryObjectSeries,
} from '@/utils/country-list'

import type { Color } from '@amcharts/amcharts4/core'
import type { MapArc, MapPolygon } from '@amcharts/amcharts4/maps'

type SeriesItem = {
  id: string
  name?: string
  fill: Color
  status: string
}

export function createChart(
  domElement: HTMLElement,
  restrictions: Ref<any[]>,
): MapChart {
  const chart = createAndConfigureChart(domElement)

  const polygonSeries = createAndConfiguredPolygonSeries(
    chart,
    'md',
    getCountryObjectSeries().map((item) => ({
      id: item.iso,
      name: item.name,
      fill: color('red'),
      status: 'a',
    })),
  )
  //
  watch(restrictions, () => {
    polygonSeries.data = getCountryObjectSeries().map((item) => ({
      id: item.iso,
      name: item.name,
      fill: color('red'),
      status: 'a',
    }))
    chart.invalidateData()
  })

  const polygonTemplate = polygonSeries.mapPolygons.template

  configurePolygonTemplate(polygonTemplate)
  //
  // chart.events.once('inited', () => {
  //   polygonSeries.mapPolygons.each((polygon) => {
  //     setTimeout(() => {
  //       polygon.show();
  //     }, random(500, 1000));
  //   });
  // });

  // configureTooltip(polygonSeries);

  // addHitHandler(polygonTemplate, originCode);
  // addHoverHandler(chart, polygonTemplate, polygonSeries, originCode);
  //
  // addHoverState(polygonTemplate);

  return chart
}

export function createAndConfigureChart(domElement: HTMLElement): MapChart {
  const chart = create(domElement, MapChart)
  chart.showOnInit = true
  chart.geodata = map
  chart.projection = new Miller()
  chart.chartContainer.wheelable = false
  chart.maxZoomLevel = 1
  chart.deltaLongitude = -10
  chart.seriesContainer.resizable = false
  chart.seriesContainer.draggable = false
  return chart
}

export function createAndConfiguredPolygonSeries(
  chart: MapChart,
  originCode: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: SeriesItem[],
): MapPolygonSeries {
  originCode = originCode.toUpperCase()
  const polygonSeries = chart.series.push(new MapPolygonSeries())
  polygonSeries.useGeodata = true
  polygonSeries.data = data

  polygonSeries.calculateVisualCenter = true

  polygonSeries.exclude = ['AQ']
  polygonSeries.include = getCountryISOUppercase()
  // polygonSeries.defaultState.transitionDuration = 2000

  polygonSeries.events.on('ready', () => {
    const originPolygon = polygonSeries.getPolygonById(originCode)
    originPolygon.interactionsEnabled = false
    originPolygon.fill = color(getCssVar('primary') as string)
  })

  return polygonSeries
}

export function addHitHandler(
  polygonTemplate: MapPolygon,
  originCode: string,
): void {
  polygonTemplate.events.on('hit', (event) => {
    const dataContext = event.target.dataItem.dataContext as SeriesItem
    const destinationCode = dataContext.id.toLowerCase()

    if (originCode === destinationCode) {
      return
    }

    // void goToDestination({ destinationSlug: destinationCode });
  })
}

export function addHoverHandler(
  chart: MapChart,
  polygonTemplate: MapPolygon,
  polygonSeries: MapPolygonSeries,
  originCode: string,
): void {
  const lineSeries = chart.series.push(new MapArcSeries())
  const lineTemplate = lineSeries.mapLines.template

  configureLine(lineTemplate)
  configureArrow(lineTemplate)

  originCode = originCode.toUpperCase()

  polygonTemplate.events.on('over', (event) => {
    const originPolygon = polygonSeries.getPolygonById(originCode)
    const destinationPolygon = event.target
    lineSeries.data = [
      {
        multiGeoLine: [
          [
            {
              latitude: originPolygon.visualLatitude,
              longitude: originPolygon.visualLongitude,
            },
            {
              latitude: destinationPolygon.visualLatitude,
              longitude: destinationPolygon.visualLongitude,
            },
          ],
        ],
      },
    ]

    event.target.events.once('out', () => {
      lineSeries.removeChildren()
    })
  })
}

export function addHoverState(template: MapPolygon): void {
  const hoverState = template.states.create('hover')
  hoverState.properties.opacity = 0.5
}

function configureArrow(line: MapArc): void {
  const arrow = line.arrow
  arrow.position = 1
  arrow.height = 15
  arrow.width = 15
  arrow.strokeLinecap = 'round'
  arrow.strokeLinejoin = 'round'
  arrow.strokeWidth = 0
  arrow.fillOpacity = 1
  arrow.interactionsEnabled = false
  arrow.fill = color('white')
}

function configureTooltip(series: MapPolygonSeries) {
  if (series.tooltip) {
    series.tooltip.background.cornerRadius = 4
    series.tooltip.background.strokeOpacity = 1
    series.tooltip.background.strokeWidth = 2

    series.tooltip.pointerOrientation = 'vertical'
    series.tooltip.label.minWidth = 40
    series.tooltip.label.minHeight = 40
    series.tooltip.label.textAlign = 'middle'
  }

  const polygonTemplate = series.mapPolygons.template
  polygonTemplate.tooltipText =
    '[text-align: right font-size: 18px]{name}[/]\n[bold]{status}[/]\n\nClick to read more'
}

function configureLine(lineTemplate: MapArc): void {
  lineTemplate.shortestDistance = false
  lineTemplate.interactionsEnabled = false
  lineTemplate.line.controlPointDistance = 0.1
  lineTemplate.line.stroke = color('red')
  lineTemplate.line.strokeDasharray = '4,6'
  lineTemplate.line.strokeWidth = 2
  lineTemplate.line.strokeLinecap = 'round'
}

export function configurePolygonTemplate(template: MapPolygon): void {
  template.fill = color('red')
  template.stroke = color('#272f56')
  template.strokeWidth = 1
  template.propertyFields.fill = 'fill'
  // template.defaultState.transitionDuration = 500
  // template.hidden = true
}

function transformData(restrictions: []): SeriesItem[] {
  // const { t } = useVueI18n();
  return [
    {
      id: 'md',
      fill: color('#272f56'),
      status: 'dawdwa',
    },
  ]

  // return restrictions.map((restriction) => ({
  //   id: restriction.outgoing.destination.countryCode.toUpperCase(),
  //   fill: color(getCssVar(statColor[restriction.outgoing.newStatus]) as string),
  //   status: t(`misc.stats.categories.${restriction.outgoing.newStatus}.title`),
  // }));
}
