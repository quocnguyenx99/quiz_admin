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
import CKedtiorCustom from '../../../components/customEditor/ckEditorCustom'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import { toast } from 'react-toastify'

const topicCategoriesData = [
  {
    id: 1,
    name: 'DELL',
    theories: [
      { id: 101, name: 'Bài thi 1 - DELL' },
      { id: 102, name: 'Bài thi 2 - DELL' },
      { id: 103, name: 'Bài thi 3 - DELL' },
    ],
  },
  {
    id: 2,
    name: 'ASUS',
    theories: [
      { id: 201, name: 'Bài thi 1 - ASUS' },
      { id: 202, name: 'Bài thi 2 - ASUS' },
      { id: 203, name: 'Bài thi 3 - ASUS' },
    ],
  },
  {
    id: 3,
    name: 'HP',
    theories: [
      { id: 301, name: 'Bài thi 1 - HP' },
      { id: 302, name: 'Bài thi 2 - HP' },
      { id: 303, name: 'Bài thi 3 - HP' },
    ],
  },
  {
    id: 4,
    name: 'Microsoft',
    children: [
      { id: 401, name: 'Bài thi 1 - Microsoft' },
      { id: 402, name: 'Bài thi 2 - Microsoft' },
      { id: 403, name: 'Bài thi 3 - Microsoft' },
    ],
  },
]

function EditLesson() {
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  // ckeditor state
  const [editorData, setEditorData] = useState('')
  const [dataTopicCategories, setDataTopicCategories] = useState([])

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    desc: '',
    friendlyUrl: '',
    metaKeyword: '',
    metaDesc: '',
    topicCategory: '',
    visible: 0,
  }

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    desc: Yup.string().required('Mô tả ngắn là bắt buộc.'),
    friendlyUrl: Yup.string().required('Friendly URL là bắt buộc.'),
    metaKeyword: Yup.string().required('Meta keyword là bắt buộc.'),
    metaDesc: Yup.string().required('Meta description là bắt buộc.'),
    visible: Yup.number()
      .oneOf([0, 1], 'Hiển thị phải có giá trị là 0 hoặc 1')
      .required('Hiển thị là bắt buộc'),
  })

  const fetchDataTopicCategories = async () => {
    try {
      const response = await axiosClient.get(`/theory-category`)
      if (response.data.status === true) {
        setDataTopicCategories(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data topic categories error', error)
    }
  }

  useEffect(() => {
    fetchDataTopicCategories()
  }, [])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`/theory/${id}/edit`)

      if (response.data && response.data.status === true) {
        const data = response.data.data
        setValues({
          title: data?.title,
          desc: data?.short_description,
          friendlyUrl: data?.friendly_url,
          metaKeyword: data?.meta_keywords,
          metaDesc: data?.meta_description,
          topicCategory: data?.theory_id,
          visible: data?.display,
        })
        setSelectedFile(data?.picture)
        setEditorData(data?.description)
      } else {
        console.error('No data found for the given ID.')
      }
    } catch (error) {
      console.error('Fetch data by id is error', error)
    }
  }

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
    console.log('>>>>check values', values)

    try {
      setIsLoading(true)
      const response = await axiosClient.put(`admin/lesson/${id}`, {
        title: values.title,
        description: editorData,
        short_description: values.desc,
        friendly_url: values.friendlyUrl,
        friendly_title: values.pageTitle,
        metakey: values.metaKeyword,
        metadesc: values.metaDesc,
        cat_id: values.topicCategory,
        picture: selectedFile,
        display: values.visible,
      })

      if (response.data.status === true) {
        toast.success('Cập nhật bài học thành công!')
      }
    } catch (error) {
      console.error('Put data lesson error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <CContainer>
      <CRow className="mb-3">
        <CCol>
          <h2>CHỈNH SỬA BÀI HỌC</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/lessons/lessonsList'}>
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
                        <label htmlFor="visible-select">Nội dung bài học</label>
                        <CKedtiorCustom
                          data={editorData}
                          onChangeData={(data) => setEditorData(data)}
                        />
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
                          style={{ height: 100 }}
                        />
                        <ErrorMessage name="desc" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <div className="bg-white border p-3 rounded">
                        <h6>Search Engine Optimization</h6>
                        <br />
                        <CCol md={12}>
                          <label htmlFor="url-input">Chuỗi đường dẫn</label>
                          <Field
                            name="friendlyUrl"
                            type="text"
                            as={CFormInput}
                            id="url-input"
                            text="Chuỗi dẫn tĩnh là phiên bản của tên hợp chuẩn với Đường dẫn (URL). Chuỗi này bao gồm chữ cái thường, số và dấu gạch ngang (-). VD: vi-tinh-nguyen-kim-to-chuc-su-kien-tri-an-dip-20-nam-thanh-lap"
                          />
                          <ErrorMessage
                            name="friendlyUrl"
                            component="div"
                            className="text-danger"
                          />
                        </CCol>
                        <br />

                        <CCol md={12}>
                          <label htmlFor="metaKeyword-input">Meta keywords</label>
                          <Field
                            name="metaKeyword"
                            type="text"
                            as={CFormTextarea}
                            id="metaKeyword-input"
                            text="Độ dài của meta keywords chuẩn là từ 100 đến 150 ký tự, trong đó có ít nhất 4 dấu phẩy (,)."
                          />
                          <ErrorMessage
                            name="metaKeyword"
                            component="div"
                            className="text-danger"
                          />
                        </CCol>
                        <br />
                        <CCol md={12}>
                          <label htmlFor="metaDesc-input">Meta description</label>
                          <Field
                            name="metaDesc"
                            type="text"
                            as={CFormTextarea}
                            id="metaDesc-input"
                            text="Thẻ meta description chỉ nên dài khoảng 140 kí tự để có thể hiển thị hết được trên Google. Tối đa 200 ký tự."
                          />
                          <ErrorMessage name="metaDesc" component="div" className="text-danger" />
                        </CCol>
                        <br />
                      </div>
                    </CCol>

                    <CCol md={4}>
                      <CCol
                        md={12}
                        className="border bg-white p-2 rounded"
                        style={{ height: 'auto' }}
                      >
                        <label
                          className="pb-2 mb-2 w-100"
                          style={{
                            fontWeight: 500,
                            fontSize: 16,
                            borderBottom: '1px solid #ddd',
                          }}
                          htmlFor="visible-input"
                        >
                          Danh mục bài học
                        </label>

                        <Field
                          className="component-size"
                          name="topicCategory"
                          as={CFormSelect}
                          id="topicCategory-select"
                          text="Lựa chọn danh mục sẽ hiển thị bài học ngoài trang chủ."
                          options={[
                            { label: 'Chọn danh mục', value: '', disabled: true },
                            ...(dataTopicCategories && dataTopicCategories.length > 0
                              ? dataTopicCategories.map((cate) => ({
                                  label: cate.title,
                                  value: cate.cat_id,
                                }))
                              : []),
                          ]}
                        />
                        <ErrorMessage
                          name="topicCategory"
                          component="div"
                          className="text-danger"
                        />
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
                              <CImage className="border" key={index} src={item} width={250} />
                            ))}
                        </div>
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

export default EditLesson
