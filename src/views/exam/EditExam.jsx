import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CImage,
  CRow,
  CSpinner,
} from '@coreui/react'
import React, { useEffect, useRef, useState } from 'react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

import { toast } from 'react-toastify'
import { CKEditor } from 'ckeditor4-react'

import './style/addExam.scss'
import CIcon from '@coreui/icons-react'
import { cilLibraryAdd } from '@coreui/icons'
import { duration } from 'moment'

const topicCategories = [
  { id: 1, name: 'DELL' },
  { id: 2, name: 'ASUS' },
  { id: 3, name: 'HP' },
  { id: 4, name: 'Microsoft' },
]

function EditExam() {
  const [dataExam, setDataExam] = useState([])

  const [questions, setQuestions] = useState([
    {
      question_text: '',
      explanation: '',
      answers: [{ option_letter: 'A', option_text: '', is_correct: false }],
    },
  ])

  const [menuOpen, setMenuOpen] = useState({})
  const menuRef = useRef(null)

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    friendlyUrl: '',
    pageTitle: '',
    metaKeyword: '',
    metaDesc: '',
    topicCategory: '',
    duration: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Tiêu đề là bắt buộc')
      .max(100, 'Tiêu đề không được vượt quá 100 ký tự'),
    friendlyUrl: Yup.string()
      .required('Chuỗi đường dẫn là bắt buộc')
      .matches(
        /^[a-z0-9-]+$/,
        'Chuỗi đường dẫn chỉ bao gồm chữ cái thường, số và dấu gạch ngang (-)',
      ),
    pageTitle: Yup.string()
      .required('Tiêu đề trang là bắt buộc')
      .max(60, 'Tiêu đề trang không được vượt quá 100 ký tự'),
    metaKeyword: Yup.string()
      .required('Meta keywords là bắt buộc')
      .min(100, 'Meta keywords phải có ít nhất 100 ký tự')
      .max(150, 'Meta keywords không được vượt quá 150 ký tự'),
    metaDesc: Yup.string()
      .required('Meta description là bắt buộc')
      .max(200, 'Meta description không được vượt quá 200 ký tự'),
    topicCategory: Yup.string().required('Danh mục bài thi là bắt buộc'),
    duration: Yup.number()
      .required('Thời gian làm bài là bắt buộc')
      .positive('Thời gian làm bài phải là số dương')
      .integer('Thời gian làm bài phải là số nguyên'),
    visible: Yup.number()
      .required('Hiển thị là bắt buộc')
      .oneOf([0, 1], 'Hiển thị phải là 0 hoặc 1'),
  })
  const fetchDataTopicCategory = async () => {
    try {
      const response = await axiosClient.get(`admin/news-category`)
      if (response.data.status === true) {
        setDataExam(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data news is error', error)
    }
  }

  useEffect(() => {
    fetchDataTopicCategory()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  const toggleMenu = (qIndex, aIndex) => {
    setMenuOpen((prev) => ({
      ...prev,
      [qIndex]: prev[qIndex] === aIndex ? null : aIndex,
    }))
  }
  const closeMenu = () => {
    setMenuOpen({})
  }

  // Thêm câu hỏi
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        explanation: '',
        answers: [{ option_letter: 'A', option_text: '', is_correct: false }],
      },
    ])
  }

  // Xử lý nhập text câu hỏi
  const handleQuestionTextChange = (qIndex, value) => {
    setQuestions((prev) => {
      const newQs = [...prev]
      newQs[qIndex].question_text = value
      return newQs
    })
  }

  // Thêm đáp án
  const handleAddAnswer = (qIndex) => {
    setQuestions((prev) => {
      const newQs = [...prev]
      const currentAnswers = newQs[qIndex].answers
      const nextLetter = String.fromCharCode(65 + currentAnswers.length) // auto: A->B->C...
      currentAnswers.push({
        option_letter: nextLetter,
        option_text: '',
        is_correct: false,
      })
      return newQs
    })
  }

  // Xoá đáp án (nếu cần)
  const handleRemoveAnswer = (qIndex, aIndex) => {
    setQuestions((prev) => {
      const newQs = [...prev]
      newQs[qIndex].answers.splice(aIndex, 1)
      return newQs
    })
  }

  // Xử lý nhập text cho đáp án
  const handleAnswerTextChange = (qIndex, aIndex, value) => {
    setQuestions((prev) => {
      const newQs = [...prev]
      newQs[qIndex].answers[aIndex].option_text = value
      return newQs
    })
  }

  // Chọn đáp án đúng (nhiều đáp án)
  const handleCheckCorrect = (qIndex, aIndex) => {
    setQuestions((prev) => {
      const newQs = [...prev]
      newQs[qIndex].answers = newQs[qIndex].answers.map((ans, i) => ({
        ...ans,
        is_correct: i === aIndex, // Đánh dấu chỉ 1 câu đúng
      }))
      return newQs
    })
  }

  const handleSubmit = async (values) => {
    console.log('>>>>check values: ', values)

    questions.forEach((q, qIndex) => {
      if (q.question_text.trim() === '') {
        toast.error(`Câu hỏi số ${qIndex + 1} không được để trống`)
        hasError = true
      }

      q.answers.forEach((ans, aIndex) => {
        if (ans.option_text.trim() === '') {
          toast.error(
            `Đáp án ${ans.option_letter} của câu hỏi số ${qIndex + 1} không được để trống`,
          )
          hasError = true
        }
      })

      if (!q.answers.some((ans) => ans.is_correct === true)) {
        toast.error(`Câu hỏi số ${qIndex + 1} chưa chọn đáp án đúng`)
        hasError = true
      }
    })

    if (hasError) {
      return
    }

    try {
      setIsLoading(true)
      const response = await axiosClient.post('admin/exam', {
        title: values.title,
        friendly_url: values.friendlyUrl,
        friendly_title: values.pageTitle,
        metakey: values.metaKeyword,
        metadesc: values.metaDesc,
        questionArr: selectedCateCheckbox,
        duration: values.duration,
        picture: selectedFile,
        display: values.visible,
      })
      if (response.data.status === true) {
        toast.success('Bài thi đã được thêm mới!')
      }
      if (response.data.status === false && response.data.mess == 'no permission') {
        toast.warn('Bạn không có quyền thực hiện tác vụ này!')
      }
    } catch (error) {
      console.error('Post data exam is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    } finally {
      setIsLoading(false)
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

  return (
    <CContainer>
      <CRow className="mb-3">
        <CCol>
          <h2>THÊM MỚI BÀI THI</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/exams/add'}>
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
            {({ setValues }) => {
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
                        <div className="border p-2 rounded bg-white">
                          {questions.map((q, qIndex) => (
                            <div key={qIndex} className="exam">
                              <h6 className="mt-3">Câu hỏi {qIndex + 1}:</h6>
                              <CKEditor
                                config={{
                                  height: 70,
                                  versionCheck: false,
                                }}
                                data={q.question_text}
                                onChange={(event) => {
                                  const data = event.editor.getData()
                                  handleQuestionTextChange(qIndex, data)
                                }}
                              />

                              <h6 className="mt-3">Đáp án:</h6>
                              {q.answers.map((ans, aIndex) => (
                                <div
                                  className="answer mt-3"
                                  key={aIndex}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    position: 'relative',
                                    padding: '8px',
                                    border: ans.is_correct ? '2px solid green' : '1px solid #ccc',
                                    borderRadius: '5px',
                                  }}
                                >
                                  {ans.is_correct && (
                                    <span
                                      style={{
                                        color: 'green',
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                      }}
                                    >
                                      ✅
                                    </span>
                                  )}
                                  <div className="answer__option-letter">
                                    <strong
                                      style={{
                                        fontSize: 16,
                                      }}
                                    >
                                      {ans.option_letter}
                                    </strong>
                                  </div>
                                  <div className="answer__option-text">
                                    <CFormTextarea
                                      className="w-100"
                                      type="text"
                                      value={ans.option_text}
                                      onChange={(e) =>
                                        handleAnswerTextChange(qIndex, aIndex, e.target.value)
                                      }
                                      placeholder="Nhập nội dung đáp án"
                                    />
                                  </div>
                                  <div style={{ position: 'relative' }}>
                                    <CButton
                                      type="button"
                                      style={{
                                        background: 'transparent',
                                        border: 'none',
                                        fontSize: '18px',
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => toggleMenu(qIndex, aIndex)}
                                    >
                                      ⋮
                                    </CButton>

                                    {menuOpen[qIndex] === aIndex && (
                                      <div ref={menuRef} className="answer__modal">
                                        <CButton
                                          type="button"
                                          className="answer__modal-btn"
                                          onClick={() => {
                                            handleRemoveAnswer(qIndex, aIndex)
                                            closeMenu()
                                          }}
                                        >
                                          ❌ Xóa
                                        </CButton>
                                        <CButton
                                          className="answer__modal-btn"
                                          type="button"
                                          onClick={() => {
                                            handleCheckCorrect(qIndex, aIndex)
                                            closeMenu()
                                          }}
                                        >
                                          ✅ Chọn đúng
                                        </CButton>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                              <CButton
                                className="mt-3"
                                color="primary"
                                size="sm"
                                type="button"
                                onClick={() => handleAddAnswer(qIndex)}
                              >
                                <CIcon
                                  style={{
                                    color: 'white',
                                  }}
                                  icon={cilLibraryAdd}
                                  className="me-1"
                                />
                                Thêm đáp án
                              </CButton>
                            </div>
                          ))}
                        </div>

                        <CButton
                          className="mt-3 text-white"
                          color="danger"
                          size="sm"
                          type="button"
                          onClick={handleAddQuestion}
                        >
                          <CIcon
                            icon={cilLibraryAdd}
                            style={{
                              color: 'white',
                            }}
                            className="me-1"
                          />
                          Thêm câu hỏi
                        </CButton>
                      </CCol>
                      <br />

                      <div className="bg-white p-3 border rounded">
                        <h6>Search Engine Optimization</h6>
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
                          <label htmlFor="pageTitle-input">Tiêu đề trang</label>
                          <Field
                            name="pageTitle"
                            type="text"
                            as={CFormInput}
                            id="pageTitle-input"
                            text="Độ dài của tiêu đề trang tối đa 60 ký tự."
                          />
                          <ErrorMessage name="pageTitle" component="div" className="text-danger" />
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
                        className="border bg-white rounded p-2 overflow-scroll"
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
                          Danh mục bài thi
                        </label>

                        <Field
                          className="component-size"
                          name="topicCategory"
                          as={CFormSelect}
                          id="topicCategory-select"
                          text="Lựa chọn danh mục sẽ hiển thị bài thi ngoài trang chủ."
                          options={
                            topicCategories &&
                            topicCategories.length > 0 &&
                            topicCategories.map((cate) => ({
                              label: cate.name,
                              value: cate.id,
                            }))
                          }
                        />
                        <ErrorMessage
                          name="topicCategory"
                          component="div"
                          className="text-danger"
                        />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="duration-input">Thời gian làm bài</label>
                        <Field
                          name="duration"
                          type="number"
                          as={CFormInput}
                          id="duration-input"
                          text="Thời gian làm bài nên được đặt chẵn."
                        />
                        <ErrorMessage name="duration" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <CFormInput
                          name="avatar"
                          type="file"
                          id="formFile"
                          label="Ảnh đại diện"
                          // size="sm"
                          onChange={(e) => onFileChange(e)}
                        />
                        <br />
                        <ErrorMessage name="avatar" component="div" className="text-danger" />

                        <div>
                          {Array.isArray(file) &&
                            file.length > 0 &&
                            file.map((item, index) => (
                              <CImage className="border w-100" key={index} src={item} />
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
                            { label: 'Không', value: '0' },
                            { label: 'Có', value: '1' },
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

export default EditExam
