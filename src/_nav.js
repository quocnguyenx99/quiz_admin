import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBook,
  cilClipboard,
  cilCog,
  cilDescription,
  cilFile,
  cilGift,
  cilImage,
  cilListRich,
  cilNotes,
  cilSpeedometer,
  cilUser,
  cilUserPlus,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'BẢNG ĐIỀU KHIỂN',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },

  {
    component: CNavGroup,
    name: 'THÔNG TIN QUẢN TRỊ',
    to: '/admin',
    icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Thông tin admin',
        to: '/admin/information',
      },

      {
        component: CNavItem,
        name: 'Quản lý tài khoản admin',
        to: '/admin/adminList',
      },
      {
        component: CNavItem,
        name: 'Lịch sử hoạt động admin',
        to: '/admin/log',
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'QUẢN LÝ BÀI HỌC',
    to: '/lessons',
    icon: <CIcon icon={cilBook} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Quản lý danh mục bài học',
        to: '/lessons/category',
      },

      {
        component: CNavItem,
        name: 'Quản lý bài học',
        to: '/lessons/lessonsList',
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'QUẢN LÝ BÀI THI',
    to: '/exams',
    icon: <CIcon icon={cilNotes} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Cấu hình chung bài thi',
        to: '/exams/config',
      },
      {
        component: CNavItem,
        name: 'Danh sách bài thi',
        to: '/exams/examsList',
      },

      {
        component: CNavItem,
        name: 'Thêm mới bài thi',
        to: '/exams/add',
      },

      {
        component: CNavItem,
        name: 'Quản lý kết quả thi',
        to: '/exams/resultsList',
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'QUẢN LÝ THÀNH VIÊN',
    to: '/members',
    icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh sách thành viên',
        to: '/members/membersList',
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'QUẢN LÝ QUÀ TẶNG',
    to: '/gifts',
    icon: <CIcon icon={cilGift} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh mục quà tặng',
        to: '/gifts/category',
      },
      {
        component: CNavItem,
        name: 'Danh sách nhận quà',
        to: '/gifts/giftsList',
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'QUẢN LÝ BANNER',
    to: '/banners',
    icon: <CIcon icon={cilImage} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Danh mục banner',
        to: '/banners/category',
      },
      {
        component: CNavItem,
        name: 'Danh sách banner',
        to: '/banners/bannersList',
      },
    ],
  },

  {
    component: CNavGroup,
    name: 'QUẢN LÝ HỆ THỐNG',
    to: '/system',
    icon: <CIcon icon={cilCog} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Quản lý nội dung',
        to: '/system/content',
      },
      {
        component: CNavItem,
        name: 'Quản lý email',
        to: '/system/email',
      },
    ],
  },

  ///////////////////////////////////////////////////////////////////////////////////////

  // {
  //   component: CNavGroup,
  //   name: 'Pages',
  //   icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  //   items: [
  //     {
  //       component: CNavItem,
  //       name: 'Login',
  //       to: '/login',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Register',
  //       to: '/register',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Error 404',
  //       to: '/404',
  //     },
  //     {
  //       component: CNavItem,
  //       name: 'Error 500',
  //       to: '/500',
  //     },
  //   ],
  // },
  // {
  //   component: CNavItem,
  //   name: 'Docs',
  //   href: 'https://coreui.io/react/docs/templates/installation/',
  //   icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
  // },
]

export default _nav
