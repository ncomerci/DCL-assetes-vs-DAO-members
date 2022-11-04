export interface Member {
  address: string
  avatarPreview: string
  totalVP: number
  manaVP: number
  landVP: number
  namesVP: number
  delegatedVP: number
  hasDelegated: boolean
  hasDelegators: boolean
  delegate?: string
  delegatorsAmount: number
  delegators?: string[]
}