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
import './login.css'

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
      const res = await axiosClient.post('/admin-login', {
        username,
        password,
      })

      const errorMessages = {
        username: 'Tên đăng nhập không chính xác!',
        pass: 'Mật khẩu đăng nhập không chính xác!',
      }

      if (res.data && res.data.status === true) {
        localStorage.setItem('quizToken', res.data.token)
        localStorage.setItem('username', res.data.username)
        navigate('/')
      } else if (res.data && res.data.status === false && res.data.mess) {
        toast.error(errorMessages[res.data.mess] || 'Đã xảy ra lỗi. Vui lòng thử lại!')
      } else {
        toast.error('Phản hồi từ máy chủ không hợp lệ. Vui lòng thử lại!')
      }
    } catch (error) {
      console.error('Post login data is error', error)
    }
  }

  return (
    <>
      <div className="login-container bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
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
                          fontWeight: 600,
                          marginBottom: 10,
                          marginTop: 10,
                          textTransform: 'uppercase',
                          fontFamily: 'Tahoma',
                          fontSize: 18,
                        }}
                      >
                        <p>Nguyên Kim e-learning</p>
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
