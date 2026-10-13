import type { Catalog } from '../types'
import { ChartView } from './chart'
import { AlertView, BadgeView, HeadingView, SeparatorView, TextView } from './content'
import { KeyValueView, ListView, MetricView, ProgressView, TableView, TimelineView } from './data'
import { ButtonView, CheckboxView, InputView, SelectView, SwitchView, TextareaView } from './form'
import { CardView, GridView, StackView, TabsView } from './layout'

/**
 * Maps every catalog `type` in shared/ui-spec.ts to its React implementation.
 * The mapped type makes TypeScript fail if the schema gains a component that
 * has no renderer here.
 */
export const catalog: Catalog = {
  Stack: StackView,
  Grid: GridView,
  Card: CardView,
  Tabs: TabsView,
  Heading: HeadingView,
  Text: TextView,
  Badge: BadgeView,
  Alert: AlertView,
  Separator: SeparatorView,
  Metric: MetricView,
  Chart: ChartView,
  Table: TableView,
  Progress: ProgressView,
  List: ListView,
  KeyValue: KeyValueView,
  Timeline: TimelineView,
  Input: InputView,
  Textarea: TextareaView,
  Select: SelectView,
  Checkbox: CheckboxView,
  Switch: SwitchView,
  Button: ButtonView,
}
