export interface Session {
  id: string
  nomeSessione: string
  clusterPartecipanti: number
  teamPartecipanti: number
  utentiPartecipanti: number
  regoleApplicate: number
  feedbackGenerati: number
  stato: 'In preparazione' | 'In corso' | 'Conclusa' | 'Content'
  dataInizio?: string
  dataFine?: string
  clusters: string[]
  regole: string[]
  generatedRules?: string[]
}

export interface SessionFormData {
  nomeSessione: string
  dataInizio?: string
  dataFine?: string
  clusters?: string[]
  regole?: string[]
}

export interface SessionEditData {
  nomeSessione: string
  dataInizio?: string
  dataFine?: string
}

export type SessionStatus = 'preparation' | 'in_progress' | 'completed' 