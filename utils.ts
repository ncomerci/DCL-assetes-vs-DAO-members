require('dotenv').config()
import { createObjectCsvWriter } from 'csv-writer'
import { ObjectStringifierHeader } from 'csv-writer/src/lib/record'
import { existsSync, mkdirSync } from 'fs'
import fetch from 'node-fetch'
import { Member } from './interfaces/Member'

const FETCH_HEADERS = {
  Authorization: `Bearer ${process.env.GH_TOKEN}`,
}

export function sum(array: number[]) {
  return array.reduce((a, b) => a + b, 0)
}

export function avg(numbers: number[]) {
  return numbers.reduce((acc, curr) => acc + curr, 0) / numbers.length
}

export async function fullFetch<T>(url: string): Promise<T[]> {
  let hasNext = true
  let page = 1
  let elements: T[] = []
  while (hasNext) {
    const response = await fetch(`${url}&page=${page}`, { method: 'GET', headers: FETCH_HEADERS })
    const data = await response.json()
    if (data.message) {
      throw Error('Fetch Error ' + JSON.stringify(data))
    }
    const currentElements = data || []

    if (currentElements.length > 0) {
      elements.push(...currentElements)
      page++
    } else {
      hasNext = false
    }
  }
  return elements
}

function getMembersJSONUrl(sha: string) {
  return `https://raw.githubusercontent.com/Decentraland-DAO/transparency/${sha}/members.json`
}

export async function fetchMembersData(sha: string, date: Date): Promise<{ data: Member[]; date: Date }> {
  const url = getMembersJSONUrl(sha)
  let fetchAgain = true
  do {
    const response = await fetch(url, { method: 'GET', headers: FETCH_HEADERS })

    if (response.status === 408) {
      console.log('Request timeout, retrying...')
    }
    else {
      try {
        const data: Member[] = await response.json()
        return { date, data }
      } catch (error) {
        if (response.status === 404) {
          return { date, data: [] }
        }
        console.log(response)
        throw new Error(`${error}`)
      }
    }
  } while (fetchAgain)

  throw new Error('Fetch error')
}

export async function saveToCSV(name: string, data: any, header: ObjectStringifierHeader) {
  if (!existsSync('./data')) mkdirSync('./data')
  const path = './data/' + name
  const csvWriter = createObjectCsvWriter({ path, header })
  await csvWriter.writeRecords(data)
  console.log('The CSV file has been saved.')
}