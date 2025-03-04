import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const Colors = React.lazy(() => import('./views/theme/colors/Colors'))
const Typography = React.lazy(() => import('./views/theme/typography/Typography'))

// TAB QUẢN TRỊ

const AdminInfo = React.lazy(() => import('./views/admin/AdminInfo'))
const AdminList = React.lazy(() => import('./views/admin/AdminList'))
const AdminLog = React.lazy(() => import('./views/admin/AdminLog'))

// const AdminGroup = React.lazy(() => import('./views/admin/AdminGroup'))
// permission group
// const PermissionGroup = React.lazy(() => import('./views/admin/PermissionGroup'))
// const EditPermission = React.lazy(() => import('./views/admin/EditPermissions'))

// TAB BÀI THI
const ExamsList = React.lazy(() => import('./views/exam/ExamsList'))
const AddExam = React.lazy(() => import('./views/exam/AddExam'))
const EditExam = React.lazy(() => import('./views/exam/EditExam'))

const routes = [
  { path: '/', exact: true, name: 'Home' },

  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/theme', name: 'Theme', element: Colors, exact: true },
  { path: '/theme/colors', name: 'Colors', element: Colors },
  { path: '/theme/typography', name: 'Typography', element: Typography },

  { path: '/admin', name: 'Admin', element: AdminInfo, exact: true },
  { path: '/admin/information', name: 'AdminInfo', element: AdminInfo },
  { path: '/admin/adminList', name: 'AdminList', element: AdminList },
  { path: '/admin/log', name: 'AdminLog', element: AdminLog },

  { path: '/exams/examsList', name: 'AddExam', element: ExamsList, exact: true },
  { path: '/exams/add', name: 'AddExam', element: AddExam, exact: true },
  { path: '/exams/edit', name: 'AddExam', element: EditExam, exact: true },
]

export default routes
