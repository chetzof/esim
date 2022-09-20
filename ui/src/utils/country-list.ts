import { countries } from 'i18n-iso-countries/langs/en.json'

export type CountryList = Record<string, string>
export type CountrySeries = Array<{ iso: string; name: string }>

export function getCountryPairs(): CountryList {
  return convertCountryListResponseToCountryLabelMap(
    countries as unknown as CountryList,
  )
}

export function getCountryObjectSeries(): CountrySeries {
  const series: CountrySeries = []
  for (const [countryCode, countryName] of Object.entries(countries)) {
    series.push({
      name: getFirstLabel(countryName),
      iso: countryCode.toLowerCase(),
    })
  }

  return series
}

export function getCountryISOListLowercase(): Array<keyof CountryList> {
  return Object.keys(getCountryPairs())
}

export function getCountryISOUppercase(): Array<keyof CountryList> {
  return Object.keys(getCountryPairs()).map((iso) => iso.toUpperCase())
}

export function convertCountryListResponseToCountryLabelMap(
  countries: CountryList,
): Record<string, string> {
  const countryMap: CountryList = {}
  for (const [countryCode, countryName] of Object.entries(countries)) {
    countryMap[countryCode.toLowerCase()] = getFirstLabel(countryName)
  }

  return countryMap
}

function getFirstLabel(label: string | string[]): string {
  if (Array.isArray(label)) {
    ;[label] = label
  }

  return label
}
