import React from 'react'
import '../css/loadingPage.css'
import { Link } from 'react-router-dom'

function LoadingPage() {
  const username = localStorage.getItem('username')

  return (
    <div className="loading-container">
      <div className="title">ĐANG THỰC HIỆN ĐĂNG NHẬP</div>
      <div className="subtitle">CHÀO MỪNG BẠN ĐẾN VỚI ADMIN CHÍNH NHÂN</div>
      <div className="logo"></div>
      <div className="processing">
        (Đang xử lý. Xin vui lòng đợi hoặc click{' '}
        <Link style={{ fontWeight: 600 }} to={'http://web.chinhnhan.net/'}>
          vào đây
        </Link>{' '}
        để trở về trang web Chính Nhân .)
      </div>
      <div className="footer">.:| Thiết kế web NKC_IT_GROUPS |:.</div>
    </div>
  )
}

export default LoadingPage
