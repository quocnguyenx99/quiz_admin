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
const ResultsList = React.lazy(() => import('./views/exam/UserResult'))

// TAB BÀI HỌC
const LessonCategories = React.lazy(() => import('./views/lesson/category/LessonCategories'))
const AddLesson = React.lazy(() => import('./views/lesson/list/AddLesson'))
const EditLesson = React.lazy(() => import('./views/lesson/list/EditLesson'))
const LessonsList = React.lazy(() => import('./views/lesson/list/LessonsList'))

// TAB THÀNH VIÊN
const EditMembers = React.lazy(() => import('./views/member/EditMember'))
const MembersList = React.lazy(() => import('./views/member/MembersList'))

// TAB QUÀ TẶNG
const Gift = React.lazy(() => import('./views/gift/GiftsCategories'))
const RewardHistory = React.lazy(() => import('./views/gift/UserGotGift'))
const RewardDetail = React.lazy(() => import('./views/gift/GotGiftDetail'))

// TAB BANNERS
const AdvertisesCategories = React.lazy(
  () => import('./views/advertise/category/AdvertisesCategories'),
)
const AddAdvertise = React.lazy(() => import('./views/advertise/list/AddAdvertisesList'))
const EditAdvertise = React.lazy(() => import('./views/advertise/list/EditAdvertisesList'))
const AdvertisesList = React.lazy(() => import('./views/advertise/list/AdvertisesList'))

// TAB SẢN PHẨM
const ProductsList = React.lazy(() => import('./views/products/ProductsList'))
const AddProduct = React.lazy(() => import('./views/products/AddProduct'))
const EditProduct = React.lazy(() => import('./views/products/EditProduct'))

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

  { path: '/exams/examsList', name: 'ExamsList', element: ExamsList, exact: true },
  { path: '/exams/add', name: 'AddExam', element: AddExam, exact: true },
  { path: '/exams/edit', name: 'EditExam', element: EditExam, exact: true },
  { path: '/exams/resultsList', name: 'ResultsList', element: ResultsList, exact: true },

  { path: '/lessons/category', name: 'LessonCategories', element: LessonCategories, exact: true },
  { path: '/lessons/add', name: 'AddLesson', element: AddLesson, exact: true },
  { path: '/lessons/edit', name: 'EditLesson', element: EditLesson, exact: true },
  { path: '/lessons/lessonsList', name: 'LessonsList', element: LessonsList, exact: true },

  { path: '/members/edit', name: 'EditMembers', element: EditMembers, exact: true },
  { path: '/members/membersList', name: 'MembersList', element: MembersList, exact: true },

  {
    path: '/banners/category',
    name: 'AdvertisesCategories',
    element: AdvertisesCategories,
    exact: true,
  },

  {
    path: '/banners/add',
    name: 'AddAdvertise',
    element: AddAdvertise,
    exact: true,
  },

  {
    path: '/banners/edit',
    name: 'EditAdvertise',
    element: EditAdvertise,
    exact: true,
  },

  {
    path: '/banners/bannersList',
    name: 'AdvertisesList',
    element: AdvertisesList,
    exact: true,
  },

  {
    path: '/gifts/category',
    name: 'Gift',
    element: Gift,
    exact: true,
  },

  {
    path: '/gifts/reward-history',
    name: 'RewardHistory',
    element: RewardHistory,
    exact: true,
  },

  {
    path: '/gifts/reward-detail',
    name: 'RewardDetail',
    element: RewardDetail,
    exact: true,
  },

  { path: '/products/add', name: 'AddProduct', element: AddProduct, exact: true },
  { path: '/products/edit', name: 'EditProduct', element: EditProduct, exact: true },
  { path: '/products/productsList', name: 'ProductsList', element: ProductsList, exact: true },
]

export default routes
