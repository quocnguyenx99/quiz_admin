import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CImage,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

import Logo from '../../../assets/images/logo/question-logo.png'

import { axiosClient } from '../../../axiosConfig'
import { toast } from 'react-toastify'

const Login = () => {
  const [username, setUserName] = useState('')
  const [password, setPassWord] = useState('')
  const navigate = useNavigate()

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  const handleLogin = async () => {
    try {
      const res = await axiosClient.post('/admin/login', {
        username,
        password,
      })

      const errorMessages = {
        'The username field is required.': 'Tên đăng nhập không được để trống!',
        'The password field is required.': 'Mật khẩu đăng nhập không được để trống!',
      }

      if (res.data && res.data.status === true) {
        localStorage.setItem('quizToken', res.data.token)
        localStorage.setItem('username', res.data.display_name)
        navigate('/')
      } else if (res.data && res.data.status === false && res.data.message) {
        toast.error(errorMessages[res.data.message] || 'Đã xảy ra lỗi. Vui lòng thử lại!')
      } else {
        toast.error('Phản hồi từ máy chủ không hợp lệ. Vui lòng thử lại!')
      }
    } catch (error) {
      console.error('Post login data is error', error)
      handleLoginError(error)
    }
  }

  const handleLoginError = (error) => {
    if (error.response) {
      const { status, data } = error.response
      if (status === 404) {
        toast.error('Tài khoản không tồn tại! Vui lòng kiểm tra lại!')
      } else if (status === 401) {
        toast.error('Mật khẩu không đúng! Vui lòng nhập lại!')
      } else {
        toast.error('Đã xảy ra lỗi. Vui lòng kiểm tra lại thông tin!')
      }
    } else if (error.request) {
      toast.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau!')
    } else {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
    console.error('Post login data is error', error)
  }

  return (
    <>
      <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
        <CContainer>
          <CRow className="justify-content-center">
            <CCol md={4}>
              <CCardGroup>
                <CCard className="p-4">
                  <CCardBody>
                    <CForm onKeyDown={handleKeyDown}>
                      <div style={{ width: '100%' }}>
                        <CImage align="center" rounded src={Logo} width={150} />
                      </div>
                      <div
                        style={{
                          textAlign: 'center',
                          fontWeight: 500,
                          marginBottom: 10,
                          textTransform: 'uppercase',
                        }}
                      >
                        <p>Nguyên Kim Trắc nghiệm</p>
                      </div>
                      <CInputGroup className="mb-3">
                        <CInputGroupText>
                          <CIcon icon={cilUser} />
                        </CInputGroupText>
                        <CFormInput
                          placeholder="Tài khoản"
                          autoComplete="username"
                          value={username}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </CInputGroup>
                      <CInputGroup className="mb-4">
                        <CInputGroupText>
                          <CIcon icon={cilLockLocked} />
                        </CInputGroupText>
                        <CFormInput
                          type="password"
                          placeholder="Mật khẩu"
                          autoComplete="current-password"
                          value={password}
                          onChange={(e) => setPassWord(e.target.value)}
                        />
                      </CInputGroup>
                      <CRow className="justify-content-md-center">
                        <CCol xs={12}>
                          <CButton
                            onKeyDown={handleKeyDown}
                            onClick={handleLogin}
                            color="primary"
                            className="px-4 w-100"
                          >
                            Đăng nhập
                          </CButton>
                        </CCol>
                      </CRow>
                    </CForm>
                  </CCardBody>
                </CCard>
              </CCardGroup>
            </CCol>
          </CRow>
        </CContainer>
      </div>
    </>
  )
}

export default Login
