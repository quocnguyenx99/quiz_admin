import {
  CButton,
  CCol,
  CContainer,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation } from 'react-router-dom'
import { axiosClient } from '../../axiosConfig'
import { toast } from 'react-toastify'

function EditMember() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // ckeditor state
  const [editorData, setEditorData] = useState('')
  const [dataTopicCategories, setDataTopicCategories] = useState([])

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    fullName: '',
    companyName: '',
    taxCode: '',
    email: '',
    phone: '',
    username: '',
    password: '',
    point: 0,
    pointUsed: 0,
    m_status: 0,
  }

  const validationSchema = Yup.object().shape({
    fullName: Yup.string().required('Họ và tên là bắt buộc.'),
    companyName: Yup.string().required('Tên công ty là bắt buộc.'),
    taxCode: Yup.string().required('Mã số thuế là bắt buộc.'),
    email: Yup.string().email('Email address is invalid').required('Email là bắt buộc.'),
    phone: Yup.string()
      .matches(/^\d{10}$/, 'Số điện thoại không hợp lệ.')
      .required('Số điện thoại là bắt buộc'),
    // point: Yup.number()
    //   .min(0, 'Điểm thưởng ít nhất phải là 0')
    //   .required('Điểm thưởng là bắt buộc.'),
    // pointUsed: Yup.number()
    //   .min(0, 'Điểm thưởng đã sử dụng ít nhất phải là 0')
    //   .required('Điểm đã sử dụng là bắt buộc.'),
  })

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`/admin/member/${id}/edit`)

      if (response.data && response.data.status === true) {
        const data = response.data.data
        setValues({
          fullName: data?.full_name,
          companyName: data?.nameCompany,
          taxCode: data?.tax,
          email: data?.email,
          phone: data?.phone,
          username: data?.username,
          password: data?.password,
          m_status: data?.m_status,
          point: data?.points,
          pointUsed: data?.used_points,
        })
      } else {
        console.error('No data found for the given ID.')
      }
    } catch (error) {
      console.error('Fetch data by id is error', error)
    }
  }

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.put(`admin/member/${id}`, {
        email: values.email,
        fullname: values.fullName,
        nameCompany: values.companyName,
        tax: values.taxCode,
        phone: values.phone,
        points: values.point,
        used_points: values.pointUsed,
        m_status: values.m_status,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật thông tin thành viên thành công!')
      }
    } catch (error) {
      console.error('Put data member error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CContainer>
      <CRow className="mb-3">
        <CCol>
          <h2>THÔNG TIN THÀNH VIÊN</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/members/membersList'}>
              <CButton color="primary" type="button" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={12}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ setFieldValue, setValues, values }) => {
              useEffect(() => {
                fetchDataById(setValues)
              }, [setValues, id])

              return (
                <Form>
                  <CRow>
                    <CCol md={8}>
                      <CCol md={12}>
                        <label htmlFor="username-input">Tên đăng nhập</label>
                        <Field name="username">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              type="text"
                              id="username-input"
                              text="Tên riêng sẽ hiển thị lên trang web của bạn."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="username" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="password-input">Mật khẩu</label>
                        <Field
                          name="password"
                          disabled
                          type="password"
                          text="Không hiển thị do mã hóa."
                          as={CFormInput}
                          id="password-input"
                        />
                        <ErrorMessage name="password" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="fullName-input">Họ và tên</label>
                        <Field name="fullName" type="text" as={CFormInput} id="fullName-input" />
                        <ErrorMessage name="fullName" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="companyName-input">Tên công ty</label>
                        <Field
                          name="companyName"
                          type="text"
                          as={CFormInput}
                          id="companyName-input"
                        />
                        <ErrorMessage name="companyName" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="taxCode-input">Mã số thuế</label>
                        <Field name="taxCode" type="text" as={CFormInput} id="taxCode-input" />
                        <ErrorMessage name="taxCode" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="email-input">Email</label>
                        <Field name="email" type="email" as={CFormInput} id="email-input" />
                        <ErrorMessage name="email" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="phone-input">Số điện thoại</label>
                        <Field name="phone" type="tel" as={CFormInput} id="phone-input" />
                        <ErrorMessage name="phone" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="point-input">Điểm thưởng tích lũy</label>
                        <Field name="point" type="number" as={CFormInput} id="point-input" />
                        <ErrorMessage name="point" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="pointUsed-input">Điểm thưởng đã sử dụng</label>
                        <Field
                          name="pointUsed"
                          type="number"
                          as={CFormInput}
                          id="pointUsed-input"
                        />
                        <ErrorMessage name="pointUsed" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="m_status-select">Trạng thái tài khoản</label>
                        <Field
                          name="m_status"
                          as={CFormSelect}
                          id="m_status-select"
                          options={[
                            { label: 'Chờ phê duyệt', value: 0 },
                            { label: 'Đã kích hoạt', value: 1 },
                          ]}
                        />
                        <ErrorMessage name="m_status" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol xs={12}>
                        <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <CSpinner size="sm"></CSpinner> Đang cập nhật...
                            </>
                          ) : (
                            'Cập nhật'
                          )}
                        </CButton>
                      </CCol>
                    </CCol>
                  </CRow>
                </Form>
              )
            }}
          </Formik>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default EditMember
