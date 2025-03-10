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
import { Link, useLocation } from 'react-router-dom'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

import { toast } from 'react-toastify'
import { CKEditor } from 'ckeditor4-react'

import './style/addExam.scss'
import CIcon from '@coreui/icons-react'
import { cilLibraryAdd } from '@coreui/icons'
import { duration } from 'moment'

function EditExam() {
  const [dataTopicCategories, setDataTopicCategories] = useState([])

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const id = searchParams.get('id')

  const [questions, setQuestions] = useState([])

  const [menuOpen, setMenuOpen] = useState({})
  const menuRef = useRef(null)

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const initialValues = {
    title: '',
    friendlyUrl: '',
    topicCategory: '',
    exam: '',
    duration: '',
    pointAward: '',
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
    duration: Yup.number()
      .required('Thời gian làm bài là bắt buộc')
      .positive('Thời gian làm bài phải là số dương')
      .integer('Thời gian làm bài phải là số nguyên'),

    pointAward: Yup.number()
      .required('Thời gian làm bài là bắt buộc')
      .positive('Thời gian làm bài phải là số dương')
      .integer('Thời gian làm bài phải là số nguyên'),

    visible: Yup.number()
      .required('Hiển thị là bắt buộc')
      .oneOf([0, 1], 'Hiển thị phải là 0 hoặc 1'),
  })

  const fetchDataTopicCategory = async () => {
    try {
      const response = await axiosClient.get(`theory-categories/show`)
      if (response.data.status === true) {
        setDataTopicCategories(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data news is error', error)
    }
  }

  useEffect(() => {
    fetchDataTopicCategory()
  }, [])

  const transformData = (data) => {
    return data.map((q) => ({
      question_text: q.description,
      question_type: q.question_type,
      explanation: '',
      answers: q.answer.map((ans) => ({
        option_letter: ans.letter,
        option_text: ans.description,
        is_correct: ans.correct_answer === 1,
      })),
    }))
  }

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`admin/quiz/${id}/edit`)

      if (response.data && response.data.status === true) {
        const data = response.data.data
        const questions = response.data.data.question

        setValues({
          title: data?.name,
          friendlyUrl: data?.friendly_url,
          duration: data?.time,
          pointAward: data?.pointAward,
          topicCategory: data?.cat_id,
          exam: data?.theory_id,
          visible: data?.display,
        })
        setQuestions(transformData(questions))
      } else {
        console.error('No data found for the given ID.')
      }
    } catch (error) {
      console.error('Fetch data id news is error', error.message)
    }
  }

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

  const handleRemoveQuestion = (qIndex) => {
    setQuestions((prevQuestions) => prevQuestions.filter((_, index) => index !== qIndex))
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

  // Xoá đáp án
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

  const handleCheckCorrect = (qIndex, aIndex, questionType) => {
    setQuestions((prev) => {
      const newQs = [...prev]

      if (questionType === 'single-choice') {
        // Nếu chỉ chọn 1 đáp án đúng, set tất cả về false trừ cái đang chọn
        newQs[qIndex].answers = newQs[qIndex].answers.map((ans, i) => ({
          ...ans,
          is_correct: i === aIndex,
        }))
      } else {
        // Nếu chọn nhiều đáp án, toggle trạng thái
        newQs[qIndex].answers[aIndex].is_correct = !newQs[qIndex].answers[aIndex].is_correct
      }

      return newQs
    })
  }

  const handleQuestionTypeChange = (qIndex, type) => {
    setQuestions((prev) => {
      const newQs = [...prev]
      newQs[qIndex].question_type = type

      // Nếu đổi sang câu hỏi chọn 1 đáp án đúng thì chỉ giữ lại 1 đáp án đúng duy nhất
      if (type === 'single-choice') {
        let firstCorrectIndex = newQs[qIndex].answers.findIndex((ans) => ans.is_correct)
        newQs[qIndex].answers = newQs[qIndex].answers.map((ans, i) => ({
          ...ans,
          is_correct: i === firstCorrectIndex,
        }))
      }

      return newQs
    })
  }

  const handleSubmit = async (values) => {
    let hasError = false
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
      const response = await axiosClient.put(`admin/quiz/${id}`, {
        title: values.title,
        friendlyUrl: values.friendlyUrl,
        questions: questions,
        duration: values.duration,
        pointAward: values.pointAward,
        cat_id: values.topicCategory,
        theory_id: values.exam,
        visible: values.visible,
      })
      if (response.data.status === true) {
        toast.success('Bài thi đã được cập nhật!')
      }
    } catch (error) {
      console.error('Put data exam is error', error)
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
          <h2>CHỈNH SỬA BÀI THI</h2>
        </CCol>
        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/exams/examsList'}>
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
            {({ setValues, values, setFieldValue }) => {
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
                              type="text"
                              id="title-input"
                              text="Tên riêng sẽ hiển thị lên trang web của bạn."
                            />
                          )}
                        </Field>
                        <ErrorMessage name="title" component="div" className="text-danger" />
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
                      </div>
                      <br />

                      <CCol md={12}>
                        <div className="border p-2 rounded bg-white">
                          {questions.map((q, qIndex) => (
                            <div key={qIndex} className="exam">
                              {/* Tiêu đề câu hỏi */}
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="mt-3">Câu hỏi {qIndex + 1}:</h6>
                                <CButton
                                  style={{
                                    color: 'white',
                                  }}
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleRemoveQuestion(qIndex)}
                                >
                                  ❌ Xóa câu hỏi
                                </CButton>
                              </div>

                              {/* CKEditor nhập câu hỏi */}
                              <CKEditor
                                config={{
                                  height: 70,
                                  versionCheck: false,
                                  extraPlugins: 'image2',
                                }}
                                initData={q.question_text}
                                onChange={(event) => {
                                  const data = event.editor.getData()
                                  handleQuestionTextChange(qIndex, data)
                                }}
                              />

                              {/* Chọn loại câu hỏi */}
                              <div className="mt-3">
                                <h6>Chọn loại câu hỏi:</h6>
                                <label>
                                  <input
                                    type="radio"
                                    name={`questionType-${qIndex}`}
                                    value={'single-choice'}
                                    checked={q.question_type === 'single-choice'}
                                    onChange={() =>
                                      handleQuestionTypeChange(qIndex, 'single-choice')
                                    }
                                  />{' '}
                                  Chọn một đáp án đúng
                                </label>
                                <label className="ms-3">
                                  <input
                                    type="radio"
                                    name={`questionType-${qIndex}`}
                                    value={'multiple-choice'}
                                    checked={q.question_type === 'multiple-choice'}
                                    onChange={() =>
                                      handleQuestionTypeChange(qIndex, 'multiple-choice')
                                    }
                                  />{' '}
                                  Chọn nhiều đáp án đúng
                                </label>
                              </div>

                              {/* Danh sách đáp án */}
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
                                    <strong style={{ fontSize: 16 }}>{ans.option_letter}</strong>
                                  </div>
                                  <div className="answer__option-text">
                                    <CFormTextarea
                                      style={{ fontSize: 14 }}
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
                                            handleCheckCorrect(qIndex, aIndex, q.question_type)
                                            closeMenu()
                                          }}
                                        >
                                          {ans.is_correct ? '❌ Bỏ chọn' : '✅ Chọn đúng'}
                                        </CButton>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}

                              {/* Nút thêm đáp án */}
                              <CButton
                                className="mt-3"
                                color="primary"
                                size="sm"
                                type="button"
                                onClick={() => handleAddAnswer(qIndex)}
                              >
                                <CIcon
                                  style={{ color: 'white' }}
                                  icon={cilLibraryAdd}
                                  className="me-1"
                                />
                                Thêm đáp án
                              </CButton>
                            </div>
                          ))}
                        </div>

                        {/* Nút thêm câu hỏi */}
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
                    </CCol>
                    <br />

                    <CCol md={4}>
                      <CCol
                        md={12}
                        className="border bg-white rounded p-2"
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
                          text="Lựa chọn danh mục sẽ hiển thị bài thi ngoài trang chủ."
                          options={
                            dataTopicCategories &&
                            dataTopicCategories.length > 0 &&
                            dataTopicCategories.map((cate) => ({
                              label: cate.title,
                              value: cate.cat_id,
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

                      {values.topicCategory && (
                        <CCol
                          md={12}
                          className="border bg-white rounded p-2"
                          style={{ height: 'auto' }}
                        >
                          <label
                            className="pb-2 mb-2 w-100"
                            style={{
                              fontWeight: 500,
                              fontSize: 16,
                              borderBottom: '1px solid #ddd',
                            }}
                            htmlFor="exam-select"
                          >
                            Bài học
                          </label>

                          <Field
                            className="component-size"
                            name="exam"
                            as={CFormSelect}
                            id="exam-select"
                            text="Lựa chọn bài thi."
                          >
                            <option value="">Chọn bài thi</option>
                            {dataTopicCategories
                              .filter((topic) => topic.cat_id == values.topicCategory)[0]
                              ?.theories?.map((exam) => (
                                <option key={exam.theory_id} value={exam.theory_id}>
                                  {exam.title}
                                </option>
                              ))}
                          </Field>
                          <ErrorMessage name="exam" component="div" className="text-danger" />
                        </CCol>
                      )}
                      <br />

                      <CCol md={12}>
                        <label htmlFor="duration-input">Thời gian làm bài</label>
                        <Field
                          name="duration"
                          type="number"
                          as={CFormInput}
                          id="duration-input"
                          text="Thời gian làm bài nên được đặt chẵn. Đơn vị phút."
                        />
                        <ErrorMessage name="duration" component="div" className="text-danger" />
                      </CCol>
                      <br />

                      <CCol md={12}>
                        <label htmlFor="pointAward-input">Điểm thưởng</label>
                        <Field
                          name="pointAward"
                          type="number"
                          as={CFormInput}
                          id="pointAward-input"
                          text="Điểm thưởng nên được đặt chẵn."
                        />
                        <ErrorMessage name="pointAward" component="div" className="text-danger" />
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

export default EditExam
