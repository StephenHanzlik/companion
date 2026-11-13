import { PlanningForm, normalizePlanningForm } from './planForm'

// Plan drafts are kept in this browser until the plan data model is agreed
// and wired to the API. One entry per trip.

export interface PlanDraft {
  form: PlanningForm
  savedAt: string | null
  signedOffAt: string | null
}

const key = (tripId: string) => `companion.plan.v1.${tripId}`

export function loadPlanDraft(tripId: string): PlanDraft {
  try {
    const raw = localStorage.getItem(key(tripId))
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PlanDraft>
      return {
        form: normalizePlanningForm(parsed.form),
        savedAt: parsed.savedAt ?? null,
        signedOffAt: parsed.signedOffAt ?? null,
      }
    }
  } catch {
    // Unreadable or blocked storage: start a fresh draft.
  }
  return { form: normalizePlanningForm(null), savedAt: null, signedOffAt: null }
}

export function savePlanDraft(tripId: string, draft: PlanDraft): boolean {
  try {
    localStorage.setItem(key(tripId), JSON.stringify(draft))
    return true
  } catch {
    return false
  }
}

export function hasPlanDraft(tripId: string): boolean {
  try {
    return localStorage.getItem(key(tripId)) !== null
  } catch {
    return false
  }
}
