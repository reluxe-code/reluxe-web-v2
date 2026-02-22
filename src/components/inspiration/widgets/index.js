import dynamic from 'next/dynamic'

const widgetMap = {
  BeforeAfterSlider: dynamic(() => import('./BeforeAfterSlider'), { ssr: false }),
  CostCalculator: dynamic(() => import('./CostCalculator'), { ssr: false }),
  QuizAssessment: dynamic(() => import('./QuizAssessment'), { ssr: false }),
  ComparisonTable: dynamic(() => import('./ComparisonTable'), { ssr: false }),
  ProgressTimeline: dynamic(() => import('./ProgressTimeline'), { ssr: false }),
  Checklist: dynamic(() => import('./Checklist'), { ssr: false }),
  TreatmentPicker: dynamic(() => import('./TreatmentPicker'), { ssr: false }),
  CountdownPlanner: dynamic(() => import('./CountdownPlanner'), { ssr: false }),
  PriceToggle: dynamic(() => import('./PriceToggle'), { ssr: false }),
  DecayChart: dynamic(() => import('./DecayChart'), { ssr: false }),
  DayGallery: dynamic(() => import('./DayGallery'), { ssr: false }),
  HotspotDiagram: dynamic(() => import('./HotspotDiagram'), { ssr: false }),
  SyringeVisualizer: dynamic(() => import('./SyringeVisualizer'), { ssr: false }),
  BookingCta: dynamic(() => import('./BookingCta'), { ssr: false }),
  InterestSave: dynamic(() => import('./InterestSave'), { ssr: false }),
  ReminderButton: dynamic(() => import('./ReminderButton'), { ssr: false }),
}

export default function WidgetRenderer({ componentName, config, articleSlug }) {
  const Component = widgetMap[componentName]
  if (!Component) return null
  return <Component config={config} articleSlug={articleSlug} />
}

export { widgetMap }
