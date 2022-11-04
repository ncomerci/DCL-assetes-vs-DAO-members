import fetch from 'node-fetch'
import BigNumber from 'bignumber.js'
import { writeFileSync } from 'fs'
import { Holder, HolderResponse } from './interfaces/Holder'

const GRAPHQL_ENDPOINTS = [
  {
    network: 'ethereum',
    url: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-ethereum-mainnet',
  },
  {
    network: 'polygon',
    url: 'https://api.thegraph.com/subgraphs/name/decentraland/mana-matic-mainnet',
  },
]

const MANA_DECIMALS = 18

function sortByMana(a: Holder, b: Holder) {
  return b.amount - a.amount
}

async function fetchManaHolders(url: string, first?: number) {
  let hasNext = true
  first = first || 1000
  const query = `
  query get($first: Int!, $id: String!) {
    accounts(first: $first, skip: $skip, orderBy: "id", orderDirection: asc, where: { id_gt: $id }) {
      id mana
    }
  }
  `

  const elements: HolderResponse[] = []
  while (hasNext) {
    const id = elements.length ? elements[elements.length - 1].id : '0x0'
    console.log('id', id)
    const response = await fetch(url, {
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        operationName: 'get',
        query,
        variables: { first, id },
      }),
      method: 'POST',
    })

    const json = await response.json()

    if (json.errors) {
      throw Error('GraphQL Fetch Error ' + JSON.stringify(json.errors))
    }

    const currentElements = json?.data?.accounts || []
    elements.push(...currentElements)

    if (currentElements.length < first) {
      hasNext = false
    }
    console.log('elements', elements.length)
  }

  return elements
}

async function manaFetch() {
  for (const { network, url } of GRAPHQL_ENDPOINTS) {
    console.log('network', network)
    const holdersResponse = await fetchManaHolders(url)
    console.log('holders', holdersResponse.length)
    const holders = holdersResponse.map<Holder>((holder) => {
      const amount = new BigNumber(holder.mana)
        .dividedBy(10 ** MANA_DECIMALS)
        .toNumber()
      return { address: holder.id.toLowerCase(), amount }
    })
    writeFileSync(
      `./data/${network}-mana.json`,
      JSON.stringify(holders.sort(sortByMana), null, 2)
    )
  }
}

manaFetch()
