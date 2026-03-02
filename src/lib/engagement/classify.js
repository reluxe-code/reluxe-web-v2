// src/lib/engagement/classify.js
// Customer type classification: 7 types evaluated in priority order.

/**
 * Classify a client into a customer type based on engagement score and behavior data.
 *
 * @param {{ score_overall: number }} scores
 * @param {{ visit_count: number, total_spend: number, days_since_last_visit: number|null, days_since_first_visit: number|null }} visitData
 * @returns {string} One of: champion, loyal, new, promising, at_risk, hibernating, lost
 */
export function classifyCustomerType(scores, visitData) {
  const { score_overall } = scores
  const {
    visit_count = 0,
    total_spend = 0,
    days_since_last_visit,
    days_since_first_visit,
  } = visitData

  // 1. Champion: score≥80, visits≥6, last visit≤90d
  if (score_overall >= 80 && visit_count >= 6 && days_since_last_visit != null && days_since_last_visit <= 90) {
    return 'champion'
  }

  // 2. Loyal: score≥60, visits≥3, last visit≤120d
  if (score_overall >= 60 && visit_count >= 3 && days_since_last_visit != null && days_since_last_visit <= 120) {
    return 'loyal'
  }

  // 3. New: visits≤1, first visit≤60d ago (or no visits yet)
  if (visit_count <= 1) {
    if (days_since_first_visit == null || days_since_first_visit <= 60) {
      return 'new'
    }
  }

  // 4. Promising: score≥40, visits≥2, last visit≤90d
  if (score_overall >= 40 && visit_count >= 2 && days_since_last_visit != null && days_since_last_visit <= 90) {
    return 'promising'
  }

  // 5. At risk: (score≥25 AND last visit 60-270d, visits≥2) OR (spend≥$1k AND last visit 90-270d)
  if (days_since_last_visit != null && days_since_last_visit >= 60 && days_since_last_visit <= 270) {
    if ((score_overall >= 25 && visit_count >= 2) || total_spend >= 1000) {
      return 'at_risk'
    }
  }

  // 6. Hibernating: visits≥2, last visit 270-365d
  if (visit_count >= 2 && days_since_last_visit != null && days_since_last_visit > 270 && days_since_last_visit <= 365) {
    return 'hibernating'
  }

  // 7. Lost: last visit>365d OR (visits=1, last visit>90d)
  if (days_since_last_visit != null && days_since_last_visit > 365) {
    return 'lost'
  }
  if (visit_count === 1 && days_since_last_visit != null && days_since_last_visit > 90) {
    return 'lost'
  }

  // Fallback: new (insufficient data)
  return 'new'
}
