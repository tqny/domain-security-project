import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from 'react'
import type {
  AppState,
  CaseStatus,
  Priority,
  ActionStatus,
  CaseNote,
  EnforcementNote,
  DomainActionLog,
  EnforcementAction,
  ActionType,
} from '../types'
import { defaultVendors } from './vendors'

// === Actions ===

type Action =
  | { type: 'UPDATE_CASE_STATUS'; caseId: string; status: CaseStatus }
  | { type: 'SET_CASE_OWNER'; caseId: string; owner: string }
  | { type: 'ADD_CASE_NOTE'; caseId: string; note: CaseNote }
  | { type: 'ESCALATE_CASE_PRIORITY'; caseId: string; priority: Priority }
  | { type: 'CREATE_ENFORCEMENT_ACTION'; action: EnforcementAction }
  | { type: 'UPDATE_ENFORCEMENT_STATUS'; actionId: string; status: ActionStatus }
  | { type: 'ADD_ENFORCEMENT_NOTE'; actionId: string; note: EnforcementNote }
  | { type: 'ADD_DOMAIN_ACTION_LOG'; domainId: string; entry: DomainActionLog }
  | { type: 'LOAD_SCAN_DATA'; payload: AppState }
  | { type: 'TRIAGE_AGREE'; caseId: string }
  | { type: 'TRIAGE_MANUAL_REVIEW'; caseId: string }
  | { type: 'RESET' }

// === Owners pool for auto-assignment ===

export const OWNERS = ['Sarah Chen', 'Marcus Johnson', 'Alex Rivera', 'Jordan Kim']

// === Empty state factory ===

function emptyState(): AppState {
  return {
    cases: [],
    evidence: [],
    domains: [],
    vendors: defaultVendors,
    enforcementActions: [],
  }
}

// === Reducer ===

function appReducer(state: AppState, action: Action): AppState {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'UPDATE_CASE_STATUS':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? {
                ...c,
                status: action.status,
                updatedAt: now,
                triagedAt: action.status === 'Triaged' && !c.triagedAt ? now : c.triagedAt,
                closedAt: action.status === 'Closed' ? now : c.closedAt,
              }
            : c
        ),
      }

    case 'SET_CASE_OWNER':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? { ...c, owner: action.owner, updatedAt: now }
            : c
        ),
      }

    case 'ADD_CASE_NOTE':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? { ...c, notes: [...c.notes, action.note], updatedAt: now }
            : c
        ),
      }

    case 'ESCALATE_CASE_PRIORITY':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? { ...c, priority: action.priority, updatedAt: now }
            : c
        ),
      }

    case 'CREATE_ENFORCEMENT_ACTION':
      return {
        ...state,
        enforcementActions: [...state.enforcementActions, action.action],
      }

    case 'UPDATE_ENFORCEMENT_STATUS':
      return {
        ...state,
        enforcementActions: state.enforcementActions.map((a) =>
          a.id === action.actionId
            ? {
                ...a,
                status: action.status,
                resolvedAt: action.status === 'Resolved' || action.status === 'Denied' ? now : a.resolvedAt,
              }
            : a
        ),
      }

    case 'ADD_ENFORCEMENT_NOTE':
      return {
        ...state,
        enforcementActions: state.enforcementActions.map((a) =>
          a.id === action.actionId
            ? { ...a, notes: [...a.notes, action.note] }
            : a
        ),
      }

    case 'ADD_DOMAIN_ACTION_LOG':
      return {
        ...state,
        domains: state.domains.map((d) =>
          d.id === action.domainId
            ? { ...d, actionLog: [...d.actionLog, action.entry] }
            : d
        ),
      }

    case 'LOAD_SCAN_DATA':
      return action.payload

    case 'TRIAGE_AGREE': {
      const targetCase = state.cases.find((c) => c.id === action.caseId)
      if (!targetCase) return state

      // Auto-assign owner
      const agreedCount = state.cases.filter((c) => c.triageStatus === 'agreed').length
      const owner = OWNERS[agreedCount % OWNERS.length]

      // Create enforcement action (Takedown Notice via primary vendor)
      const vendor = state.vendors[0] // BrandShield Global
      const eaId = `EA-T${String(state.enforcementActions.length + 1).padStart(3, '0')}`
      const dueAt = new Date(Date.now() + (vendor?.slaHours ?? 24) * 3600000).toISOString()
      const newAction: EnforcementAction = {
        id: eaId,
        caseId: action.caseId,
        vendorId: vendor?.id ?? 'VND-001',
        actionType: 'Takedown Notice',
        status: 'Queued',
        requestedAt: now,
        dueAt,
        resolvedAt: null,
        outcome: null,
        notes: [],
      }

      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? {
                ...c,
                triageStatus: 'agreed' as const,
                status: 'Enforcement' as const,
                owner,
                triagedAt: now,
                updatedAt: now,
              }
            : c
        ),
        enforcementActions: [...state.enforcementActions, newAction],
      }
    }

    case 'TRIAGE_MANUAL_REVIEW':
      return {
        ...state,
        cases: state.cases.map((c) =>
          c.id === action.caseId
            ? { ...c, triageStatus: 'manual-review' as const, updatedAt: now }
            : c
        ),
      }

    case 'RESET':
      return emptyState()
  }
}

// === Context ===

interface AppContextValue {
  state: AppState
  hasData: boolean
  updateCaseStatus: (caseId: string, status: CaseStatus) => void
  setCaseOwner: (caseId: string, owner: string) => void
  addCaseNote: (caseId: string, note: CaseNote) => void
  escalateCasePriority: (caseId: string, priority: Priority) => void
  createEnforcementAction: (action: Omit<EnforcementAction, 'id' | 'dueAt' | 'notes'> & { actionType: ActionType }) => void
  updateEnforcementStatus: (actionId: string, status: ActionStatus) => void
  addEnforcementNote: (actionId: string, note: EnforcementNote) => void
  addDomainActionLog: (domainId: string, entry: DomainActionLog) => void
  loadScanData: (newState: AppState) => void
  triageCaseAgree: (caseId: string) => void
  triageCaseManualReview: (caseId: string) => void
  resetData: () => void
}

const AppContext = createContext<AppContextValue | null>(null)

// === localStorage ===

const STORAGE_KEY = 'bpcc-state'

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      return JSON.parse(saved) as AppState
    }
  } catch {
    // Fall through to empty state
  }
  return emptyState()
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — silent fail
  }
}

// === Provider ===

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState)

  useEffect(() => {
    saveState(state)
  }, [state])

  const value: AppContextValue = {
    state,
    hasData: state.cases.length > 0,

    updateCaseStatus(caseId, status) {
      dispatch({ type: 'UPDATE_CASE_STATUS', caseId, status })
    },

    setCaseOwner(caseId, owner) {
      dispatch({ type: 'SET_CASE_OWNER', caseId, owner })
    },

    addCaseNote(caseId, note) {
      dispatch({ type: 'ADD_CASE_NOTE', caseId, note })
    },

    escalateCasePriority(caseId, priority) {
      dispatch({ type: 'ESCALATE_CASE_PRIORITY', caseId, priority })
    },

    createEnforcementAction(params) {
      const vendor = state.vendors.find((v) => v.id === params.vendorId)
      const slaHours = vendor?.slaHours ?? 48
      const requestedAt = params.requestedAt || new Date().toISOString()
      const dueAt = new Date(new Date(requestedAt).getTime() + slaHours * 3600000).toISOString()
      const id = `EA-${String(state.enforcementActions.length + 1).padStart(3, '0')}`

      dispatch({
        type: 'CREATE_ENFORCEMENT_ACTION',
        action: {
          id,
          caseId: params.caseId,
          vendorId: params.vendorId,
          actionType: params.actionType,
          status: params.status,
          requestedAt,
          dueAt,
          resolvedAt: params.resolvedAt,
          outcome: params.outcome,
          notes: [],
        },
      })
    },

    updateEnforcementStatus(actionId, status) {
      dispatch({ type: 'UPDATE_ENFORCEMENT_STATUS', actionId, status })
    },

    addEnforcementNote(actionId, note) {
      dispatch({ type: 'ADD_ENFORCEMENT_NOTE', actionId, note })
    },

    addDomainActionLog(domainId, entry) {
      dispatch({ type: 'ADD_DOMAIN_ACTION_LOG', domainId, entry })
    },

    loadScanData(newState) {
      dispatch({ type: 'LOAD_SCAN_DATA', payload: newState })
    },

    triageCaseAgree(caseId) {
      dispatch({ type: 'TRIAGE_AGREE', caseId })
    },

    triageCaseManualReview(caseId) {
      dispatch({ type: 'TRIAGE_MANUAL_REVIEW', caseId })
    },

    resetData() {
      dispatch({ type: 'RESET' })
    },
  }

  return <AppContext value={value}>{children}</AppContext>
}

// === Hook ===

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within AppProvider')
  }
  return context
}
