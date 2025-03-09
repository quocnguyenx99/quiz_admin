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
import { Link } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import { toast } from 'react-toastify'

function AddAdvertisesList() {
  // ckeditor state

  const [dataPositionCate, setDataPositionCate] = useState([])
  // const [selectedCateCheckbox, setSelectedCateCheckbox] = useState([])

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    desc: '',
    positionCate: '',
    width: 0,
    height: 0,
    friendlyUrl: '',
    visible: 0,
  }

  const validationSchema = Yup.object().shape({
    // title: Yup.string().required('Tiêu đề là bắt buộc.'),
    // desc: Yup.string().required('Mô tả ngắn là bắt buộc.'),
    // friendlyUrl: Yup.string().required('Friendly URL là bắt buộc.'),
    // metaKeyword: Yup.string().required('Meta keyword là bắt buộc.'),
    // metaDesc: Yup.string().required('Meta description là bắt buộc.'),
    // visible: Yup.number()
    //   .oneOf([0, 1], 'Hiển thị phải có giá trị là 0 hoặc 1')
    //   .required('Hiển thị là bắt buộc'),
  })

  const fetchDataPositionCate = async () => {
    try {
      const response = await axiosClient.get(`/admin/ad-pos`)
      if (response.data.status === true) {
        setDataPositionCate(response.data.list.data)
      }
    } catch (error) {
      console.error('Fetch data banner categories error', error)
    }
  }

  useEffect(() => {
    fetchDataPositionCate()
  }, [])

  // upload image and show image
  const [selectedFile, setSelectedFile] = useState('')
  const [file, setFile] = useState([])

  //set img avatar
  function onFileChange(e) {
    const files = e.target.files
    const selectedFiles = []
    const fileUrls = []

    Array.from(files).forEach((file) => {
      // Create a URL for the file
      fileUrls.push(URL.createObjectURL(file))

      // Read the file as base64
      const fileReader = new FileReader()
      fileReader.readAsDataURL(file)

      fileReader.onload = (event) => {
        selectedFiles.push(event.target.result)
        // Set base64 data after all files have been read
        if (selectedFiles.length === files.length) {
          setSelectedFile(selectedFiles)
        }
      }
    })

    // Set file URLs for immediate preview
    setFile(fileUrls)
  }

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true)
      const response = await axiosClient.post('/admin/advertise', {
        title: values.title,
        description: values.desc,
        width: values.width,
        height: values.height,
        link: values.friendlyUrl,
        id_pos: values.positionCate,
        picture: selectedFile,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Thêm banner thành công!')
      }
    } catch (error) {
      console.error('Post data banner error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CContainer>
      <CRow className="mb-3">
        <CCol>
          <h2>THÊM MỚI BANNER</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/banners/bannersList'}>
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
              return (
                <Form>
                  <CRow>
                    <CCol md={8}>
                      <CCol md={12}>
                        <label htmlFor="title-input">Tiêu đề </label>
                        <Field name="title">
                          {({ field }) => (
                            <CFormInput
                              {...field}
                              size="lg"
                              type="text"
                              id="title-input"
                              text="Tên riêng sẽ hiển thị lên trang web của bạn."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="avatar"
                          type="file"
                          id="formFile"
                          label="Ảnh đại diện"
                          size="sm"
                          onChange={(e) => onFileChange(e)}
                        />
                        <br />
                        <ErrorMessage name="avatar" component="div" className="text-danger" />

                        <div>
                          {Array.isArray(file) &&
                            file.length > 0 &&
                            file.map((item, index) => (
                              <CImage className="border" key={index} src={item} fluid />
                            ))}
                        </div>
                      </CCol>
                      <br />

                      <CCol md={12} className="border bg-white p-2 rounded">
                        <label className="pb-2 mb-2 w-100" htmlFor="positionCate-select">
                          Danh mục vị trí
                        </label>

                        <Field name="positionCate">
                          {({ field }) => (
                            <CFormSelect
                              {...field}
                              id="positionCate-select"
                              onChange={(e) => {
                                const selectedId = e.target.value
                                setFieldValue('positionCate', selectedId)

                                const selectedCate = dataPositionCate.find(
                                  (cate) => cate.id_pos == selectedId,
                                )
                                if (selectedCate) {
                                  setFieldValue('width', selectedCate.width || '')
                                  setFieldValue('height', selectedCate.height || '')
                                }
                              }}
                            >
                              <option value="" disabled>
                                Chọn danh mục
                              </option>
                              {dataPositionCate.map((cate) => (
                                <option key={cate.id_pos} value={cate.id_pos}>
                                  {cate.title}
                                </option>
                              ))}
                            </CFormSelect>
                          )}
                        </Field>
                        <ErrorMessage name="positionCate" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="width-input">Chiều rộng</label>
                        <Field name="width">
                          {({ field }) => (
                            <CFormInput {...field} type="number" id="width-input" readOnly />
                          )}
                        </Field>
                        <ErrorMessage name="width" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="height-input">Chiều dài</label>
                        <Field name="height">
                          {({ field }) => (
                            <CFormInput {...field} type="number" id="height-input" readOnly />
                          )}
                        </Field>
                        <ErrorMessage name="height" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="friendlyUrl-input">Đường dẫn liên kết</label>
                        <Field
                          name="friendlyUrl"
                          type="text"
                          as={CFormInput}
                          id="friendlyUrl-input"
                          text="Đường dẫn liên kết đến các page chỉ định trong trang web của bạn."
                        />
                        <ErrorMessage name="friendlyUrl" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="desc-input">Mô tả ngắn</label>
                        <Field
                          name="desc"
                          type="text"
                          text="Là đoạn mô tả ngắn của bài học. Nó sẽ hiển thị trên trang web của bạn."
                          as={CFormTextarea}
                          id="desc-input"
                          style={{ height: 80 }}
                        />
                        <ErrorMessage name="desc" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="visible-select">Hiển thị</label>
                        <Field
                          name="visible"
                          as={CFormSelect}
                          id="visible-select"
                          options={[
                            { label: 'Không', value: 0 },
                            { label: 'Có', value: 1 },
                          ]}
                        />
                        <ErrorMessage name="visible" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol xs={12}>
                        <CButton color="primary" type="submit" size="sm" disabled={isLoading}>
                          {isLoading ? (
                            <>
                              <CSpinner size="sm"></CSpinner> Đang cập nhật...
                            </>
                          ) : (
                            'Thêm mới'
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

export default AddAdvertisesList
