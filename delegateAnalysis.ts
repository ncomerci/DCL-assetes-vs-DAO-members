import { GithubAPIResponse } from './interfaces/GithubAPIResponse'
import { avg, fetchMembersData, fullFetch, saveToCSV, sum } from './utils'

const GITHUB_API_URL = 'https://api.github.com/repos/Decentraland-DAO/transparency/commits?sha=gh-pages&path=members.json'

async function main() {
  const data = await fullFetch<GithubAPIResponse>(GITHUB_API_URL)
  const parsedData = data.map((item) => ({ sha: item.sha, date: new Date(item.commit.author.date) })).sort((a, b) => a.date.getTime() - b.date.getTime())

  const membersData = await Promise.all(parsedData.map((item) => fetchMembersData(item.sha, item.date)))

  const mappedMembersData = membersData.map((item) => ({ date: item.date, vpInfo: { totalVP: sum(item.data.map(member => member.totalVP)), delegatedVP: sum(item.data.map(member => member.delegatedVP || 0)) } })).filter(item => item.vpInfo.totalVP > 0 && item.vpInfo.delegatedVP > 0)

  const dataMap: Record<string, { totalVP: number, delegatedVP: number }[]> = {}

  for (const item of mappedMembersData) {
    const dateKey = `${item.date.getMonth() + 1}-${item.date.getFullYear()}`
    if (!dataMap[dateKey]) {
      dataMap[dateKey] = []
    }
    dataMap[dateKey].push(item.vpInfo)
  }

  const processedDataData: { date: string, totalVP: number, delegatedVP: number }[] = []

  for (const key in dataMap) {
    const data = dataMap[key]
    const avgTotalVP = avg(data.map(item => item.totalVP))
    const avgDelegatedVP = avg(data.map(item => item.delegatedVP))
    processedDataData.push({ date: key, totalVP: avgTotalVP, delegatedVP: avgDelegatedVP })
  }

  saveToCSV('vp.csv', processedDataData, [
    { id: 'date', title: 'Date' },
    { id: 'totalVP', title: 'TOTAL VP' },
    { id: 'delegatedVP', title: 'DELEGATED VP' },
  ])
}

main()