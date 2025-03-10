import React, { useEffect, useRef, useState } from 'react'
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
  CTable,
} from '@coreui/react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Search from '../../components/search/Search'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'

function GiftsCategories() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const [dataGift, setDataGift] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // checkbox selected
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)
  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  const initialValues = {
    title: '',
    description: '',
    rewardPoint: '',
    visible: 0,
  }

  const validationSchema = Yup.object({
    title: Yup.string().required('Tiêu đề là bắt buộc.'),
    rewardPoint: Yup.string().required('Cấu hình điểm thưởng nhận quà là bắt buộc.'),
    description: Yup.string().required('Mô tả là bắt buộc.'),
    visible: Yup.number()
      .required('Hiển thị là bắt buộc')
      .oneOf([0, 1], 'Hiển thị phải là 0 hoặc 1'),
  })

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

  useEffect(() => {
    if (sub === 'add') {
      setIsEditing(false)
      if (inputRef.current) {
        inputRef.current.focus()
      }
    } else if (sub === 'edit' && id) {
      setIsEditing(true)
    }
  }, [location.search])

  const fetchDataGifts = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`/gift?data=${dataSearch}&page=${pageNumber}`)
      if (response.data.status === true) {
        setDataGift(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data lesson categories error', error)
    }
  }

  useEffect(() => {
    fetchDataGifts()
  }, [pageNumber])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`/gift/${id}/edit`)
      const data = response.data.data
      if (data) {
        setValues({
          title: data?.title,
          description: data?.description,
          rewardPoint: data?.reward_point,
          visible: data?.display,
        })
        setSelectedFile(data?.picture)
      } else {
        console.error('No data found for the given ID.')
      }
    } catch (error) {
      console.error('Fetch data id gift category error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`/gift/${id}`, {
          title: values.title,
          description: values.description,
          reward_point: values.rewardPoint,
          picture: selectedFile,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật danh mục thành công')
          resetForm()
          navigate('/gifts/category')
          setIsEditing(false)
          fetchDataGifts()
        } else {
          console.error('No data found for the given ID.')
        }
      } catch (error) {
        console.error('Put data id lesson category error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      //call api post new data
      try {
        setIsLoading(true)
        const response = await axiosClient.post('/gift', {
          title: values.title,
          description: values.description,
          reward_point: values.rewardPoint,
          picture: selectedFile,
          display: values.visible,
        })

        if (response.data.status === true) {
          toast.success('Thêm mới danh mục thành công!')
          resetForm()
          navigate('/gifts/category?sub=add')
          fetchDataGifts()
        }
      } catch (error) {
        console.error('Post data lesson category is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/gifts/category?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/gifts/category?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/gift/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataGifts()
      }
    } catch (error) {
      console.error('Delete lesson category id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  // pagination data
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1
    if (newPage < 2) {
      setPageNumber(newPage)
      window.scrollTo(0, 0)
      return
    }
    window.scrollTo(0, 0)
    setPageNumber(newPage)
  }

  // search Data
  const handleSearch = (keyword) => {
    fetchDataGifts(keyword)
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`/gifts/delete`, {
        _method: 'DELETE',
        ids: selectedCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa tất cả danh mục thành công!')
        fetchDataGifts()
        setSelectedCheckbox([])
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  const items =
    dataGift && dataGift?.length > 0
      ? dataGift.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id}
              aria-label="Default select example"
              defaultChecked={item?.id}
              id={`flexCheckDefault_${item?.id}`}
              value={item?.id}
              checked={selectedCheckbox.includes(item?.id)}
              onChange={(e) => {
                const categoriesId = item?.id
                const isChecked = e.target.checked
                if (isChecked) {
                  setSelectedCheckbox([...selectedCheckbox, categoriesId])
                } else {
                  setSelectedCheckbox(selectedCheckbox.filter((id) => id !== categoriesId))
                }
              }}
            />
          ),
          title: item?.title,
          picture: (
            <CImage src={`${imageBaseUrl}/uploads/${item.picture}`} width={100} alt={item.id} />
          ),
          rewardPoints: item.reward_point,
          actions: (
            <div className="d-flex align-items-center">
              <CButton
                onClick={() => handleEditClick(item.id)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </CButton>
              <CButton
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id)
                }}
                className="button-action bg-danger"
              >
                <CIcon icon={cilTrash} className="text-white" />
              </CButton>
            </div>
          ),
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

  const columns = [
    {
      key: 'id',
      label: (
        <CFormCheck
          aria-label="Select all"
          checked={isAllCheckbox}
          onChange={(e) => {
            const isChecked = e.target.checked
            setIsAllCheckbox(isChecked)
            if (isChecked) {
              const allIds = dataGift?.map((item) => item.id) || []
              setSelectedCheckbox(allIds)
            } else {
              setSelectedCheckbox([])
            }
          }}
        />
      ),
    },
    {
      key: 'title',
      label: 'Tiêu đề',
      _props: { scope: 'col' },
    },

    {
      key: 'picture',
      label: 'Hình ảnh',
      _props: { scope: 'col' },
    },

    {
      key: 'rewardPoints',
      label: 'Điểm thưởng',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col' },
    },
  ]

  return (
    <CContainer>
      <>
        <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />
        <CRow className="mb-3">
          <CCol md={6}>
            <h2>DANH MỤC QUÀ TẶNG</h2>
          </CCol>
          <CCol md={6}>
            <div className="d-flex justify-content-end">
              <Link to={'/gifts/category'}>
                <CButton color="primary" type="submit" size="sm">
                  Danh sách
                </CButton>
              </Link>
            </div>
          </CCol>
        </CRow>

        <CRow>
          <CCol md={4}>
            <h6>{!isEditing ? 'Thêm danh mục mới' : 'Cập nhật danh mục'}</h6>
            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, setValues }) => {
                useEffect(() => {
                  fetchDataById(setValues)
                }, [setValues, id])
                return (
                  <Form>
                    <CCol md={12}>
                      <label htmlFor="title-input">Tiêu đề </label>
                      <Field name="title">
                        {({ field }) => (
                          <CFormInput
                            {...field}
                            type="text"
                            id="title-input"
                            ref={inputRef}
                            text="Tên riêng sẽ hiển thị lên trang web của bạn."
                          />
                        )}
                      </Field>
                      <ErrorMessage name="title" component="div" className="text-danger" />
                    </CCol>
                    <br />

                    <CCol md={12}>
                      <label htmlFor="desc-input">Mô tả</label>
                      <Field
                        style={{ height: '100px' }}
                        name="description"
                        type="text"
                        as={CFormTextarea}
                        id="desc-input"
                        text="Mô tả bình thường không được sử dụng trong giao diện, tuy nhiên có vài giao diện hiện thị mô tả này."
                      />
                      <ErrorMessage name="description" component="div" className="text-danger" />
                    </CCol>
                    <br />

                    <CCol md={12}>
                      <label htmlFor="rewardPoint-input">Điểm thưởng nhận quà</label>
                      <Field
                        name="rewardPoint"
                        type="number"
                        as={CFormInput}
                        id="rewardPoint-input"
                        text="Điểm thưởng cấu hình để nhận quà."
                      />
                      <ErrorMessage name="rewardPoint" component="div" className="text-danger" />
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

                      <div>
                        {file.length == 0 ? (
                          <div>
                            <CImage
                              className="border"
                              src={`${imageBaseUrl}/uploads/${selectedFile}`}
                              fluid
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          file.map((item, index) => (
                            <CImage
                              className="border"
                              key={index}
                              src={item}
                              fluid
                              loading="lazy"
                            />
                          ))
                        )}
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
                        ) : isEditing ? (
                          'Cập nhật'
                        ) : (
                          'Thêm mới'
                        )}
                      </CButton>
                    </CCol>
                  </Form>
                )
              }}
            </Formik>
          </CCol>

          <CCol>
            <Search count={dataGift?.length} onSearchData={handleSearch} />
            <CCol md={12} className="mt-3">
              <CButton onClick={handleDeleteAll} color="primary" size="sm">
                Xóa mục đã chọn
              </CButton>
            </CCol>
            <CTable className="mt-2 border" columns={columns} items={items} />

            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataGift?.length / 10)}
                pageRangeDisplayed={3}
                marginPagesDisplayed={1}
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                breakLabel="..."
                breakClassName="page-item"
                breakLinkClassName="page-link"
                onPageChange={handlePageChange}
                containerClassName={'pagination'}
                activeClassName={'active'}
                previousLabel={'<<'}
                nextLabel={'>>'}
              />
            </div>
          </CCol>
        </CRow>
      </>
    </CContainer>
  )
}

export default GiftsCategories
