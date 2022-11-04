import { Holder } from './interfaces/Holder';
import fetch from 'node-fetch'
import ESTATE_HOLDER from './data/estate.json'
import LAND_HOLDER from './data/land.json'
import MANA_ETH from './data/ethereum-mana.json'
import MANA_POLYGON from './data/polygon-mana.json'
import { Member } from './interfaces/Member'

const DAO_VESTING = '0x7a3abf8897f31b56f09c6f69d074a393a905c1ac'
const MEMBERS_URL = 'https://data.decentraland.vote/members.json'

async function getMembers() {
  const response = await fetch(MEMBERS_URL)
  const json = await response.json()
  return json as Member[]
}

function getRatio(a: number, b: number) {
  return (a / b) * 100
}

async function calculate() {
  const members = await getMembers()
  const landHolders = new Set([...(LAND_HOLDER as Holder[]).map(holder => holder.address), ...(ESTATE_HOLDER as Holder[]).map(holder => holder.address)])
  const manaHolders = new Set([...(MANA_ETH as Holder[]).map(holder => holder.address), ...(MANA_POLYGON as Holder[]).map(holder => holder.address)])

  manaHolders.delete(DAO_VESTING)

  console.log('Mana holders', manaHolders.size)
  console.log('Land holders', landHolders.size)
  console.log('DAO Members', members.length)

  let manaCounter = 0
  let landCounter = 0

  for (const member of members) {
    const address = member.address.toLowerCase()

    if (manaHolders.has(address)) {
      manaCounter++
    }
    if (landHolders.has(address)) {
      landCounter++
    }

    if (!manaHolders.has(address) && !landHolders.has(address)) {
      console.error('Address not found', address)
    }
  }

  console.log('DAO members vs Mana holders ratio', getRatio(manaCounter, manaHolders.size))
  console.log('DAO members vs Land holders ratio', getRatio(landCounter, landHolders.size))
}

calculate()