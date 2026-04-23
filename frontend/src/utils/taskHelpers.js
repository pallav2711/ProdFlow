/**
 * Shared task/sprint helper maps — defined once, imported everywhere.
 * Eliminates the identical getStatusColor / getWorkTypeColor functions
 * that were copy-pasted across Dashboard, MyTasks, AllTeamTasks, SprintHistory.
 */

export const STATUS_COLORS = {
  'To Do':          'bg-gray-100 text-gray-700',
  'In Progress':    'bg-blue-100 text-blue-700',
  'Pending Review': 'bg-yellow-100 text-yellow-700',
  'Completed':      'bg-green-100 text-green-700',
  'Blocked':        'bg-red-100 text-red-700',
  'Planning':       'bg-blue-100 text-blue-700',
  'Active':         'bg-indigo-100 text-indigo-700',
}

export const WORK_TYPE_COLORS = {
  'Frontend':    'bg-purple-100 text-purple-700',
  'Backend':     'bg-blue-100 text-blue-700',
  'Database':    'bg-cyan-100 text-cyan-700',
  'UI/UX Design':'bg-pink-100 text-pink-700',
  'DevOps':      'bg-orange-100 text-orange-700',
  'Testing':     'bg-teal-100 text-teal-700',
  'Full Stack':  'bg-indigo-100 text-indigo-700',
}

export const getStatusColor   = (s) => STATUS_COLORS[s]   ?? 'bg-gray-100 text-gray-700'
export const getWorkTypeColor = (w) => WORK_TYPE_COLORS[w] ?? 'bg-gray-100 text-gray-700'
