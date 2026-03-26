import {
  AlertCircle,
  Brush,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  Eye,
  FlaskConical,
  Layers,
  LayoutTemplate,
  Rocket,
  ServerCog,
  ShieldAlert,
  Zap
} from 'lucide-react'

const ICON_STROKE_WIDTH = 2.1

const iconClassesByVariant = {
  badge: 'w-3.5 h-3.5 inline-block mr-1.5 align-text-bottom shrink-0',
  compact: 'w-3.5 h-3.5 inline-block mr-1 align-text-bottom shrink-0',
  chip: 'w-4 h-4 inline-block mr-1.5 align-text-bottom shrink-0'
}

const renderIcon = (IconComponent, className) => (
  <IconComponent aria-hidden="true" strokeWidth={ICON_STROKE_WIDTH} className={className} />
)

export const StatusIcon = ({ status, className, variant = 'badge' }) => {
  const resolvedClassName = className || iconClassesByVariant[variant] || iconClassesByVariant.badge
  switch (status) {
    case 'To Do':
    case 'Planning':
      return renderIcon(Clock3, resolvedClassName)
    case 'In Progress':
    case 'Active':
      return renderIcon(Zap, resolvedClassName)
    case 'Pending Review':
      return renderIcon(Eye, resolvedClassName)
    case 'Completed':
      return renderIcon(CheckCircle2, resolvedClassName)
    case 'Blocked':
      return renderIcon(ShieldAlert, resolvedClassName)
    default:
      return renderIcon(AlertCircle, resolvedClassName)
  }
}

export const WorkTypeIcon = ({ workType, className, variant = 'badge' }) => {
  const resolvedClassName = className || iconClassesByVariant[variant] || iconClassesByVariant.badge
  switch (workType) {
    case 'Frontend':
      return renderIcon(LayoutTemplate, resolvedClassName)
    case 'Backend':
      return renderIcon(ServerCog, resolvedClassName)
    case 'Database':
      return renderIcon(Database, resolvedClassName)
    case 'UI/UX Design':
      return renderIcon(Brush, resolvedClassName)
    case 'DevOps':
      return renderIcon(Rocket, resolvedClassName)
    case 'Testing':
      return renderIcon(FlaskConical, resolvedClassName)
    case 'Full Stack':
      return renderIcon(Code2, resolvedClassName)
    default:
      return renderIcon(Layers, resolvedClassName)
  }
}
