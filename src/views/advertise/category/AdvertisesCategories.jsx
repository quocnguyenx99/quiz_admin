import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CRow,
  CSpinner,
  CTable,
} from '@coreui/react'

import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Search from '../../../components/search/Search'

import CIcon from '@coreui/icons-react'
import { cilTrash, cilColorBorder } from '@coreui/icons'
import ReactPaginate from 'react-paginate'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import { toast } from 'react-toastify'
import { axiosClient } from '../../../axiosConfig'

function AdvertisesCategories() {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')
  const sub = params.get('sub')

  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef(null)

  // loading button
  const [isLoading, setIsLoading] = useState(false)

  const [dataBannerCategories, setDataBannerCategories] = useState([])

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
    name: '',
    width: '',
    height: '',
    description: '',
    visible: 0,
  }

  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Tiêu đề là bắt buộc'),
    name: Yup.string().required('Tên là bắt buộc'),
    width: Yup.number().required('Chiều rộng là bắt buộc').positive('Chiều rộng phải là số dương'),
    height: Yup.number().required('Chiều cao là bắt buộc').positive('Chiều cao phải là số dương'),
    description: Yup.string().required('Mô tả là bắt buộc'),
    visible: Yup.number()
      .required('Trạng thái hiển thị là bắt buộc')
      .oneOf([0, 1], 'Trạng thái hiển thị phải là 0 hoặc 1'),
  })

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

  const fetchDataBannerCategories = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(`/admin/ad-pos?data=${dataSearch}&page=${pageNumber}`)
      if (response.data.status === true) {
        setDataBannerCategories(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data banner categories error', error)
    }
  }

  useEffect(() => {
    fetchDataBannerCategories()
  }, [pageNumber])

  const fetchDataById = async (setValues) => {
    try {
      const response = await axiosClient.get(`/admin/ad-pos/${id}/edit`)
      const data = response.data.list
      if (data) {
        setValues({
          title: data?.title,
          name: data?.name,
          description: data?.description,
          width: data?.width,
          height: data?.height,
          visible: data?.display,
        })
      } else {
        console.error('No data found for the given ID.')
      }
    } catch (error) {
      console.error('Fetch data id banner category error', error.message)
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    if (isEditing) {
      //call api update data
      try {
        setIsLoading(true)
        const response = await axiosClient.put(`/admin/ad-pos/${id}`, {
          title: values.title,
          name: values.name,
          width: values.width,
          height: values.height,
          description: values.description,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Cập nhật danh mục thành công')
          resetForm()
          navigate('/banners/category')
          setIsEditing(false)
          fetchDataBannerCategories()
        } else {
          console.error('No data found for the given ID.')
        }
      } catch (error) {
        console.error('Put data id banner category error', error.message)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    } else {
      //call api post new data
      try {
        setIsLoading(true)
        const response = await axiosClient.post('/admin/ad-pos', {
          title: values.title,
          name: values.name,
          width: values.width,
          height: values.height,
          description: values.description,
          display: values.visible,
        })
        if (response.data.status === true) {
          toast.success('Thêm mới vị trí thành công!')
          resetForm()
          navigate('/banners/category?sub=add')
          fetchDataBannerCategories()
        }
      } catch (error) {
        console.error('Post data banner category is error', error)
        toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleAddNewClick = () => {
    navigate('/banners/category?sub=add')
  }

  const handleEditClick = (id) => {
    navigate(`/banners/category?id=${id}&sub=edit`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/admin/ad-pos/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataBannerCategories()
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
    fetchDataBannerCategories(keyword)
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`/admin/delete-all-ad-pos`, {
        data: selectedCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa tất cả danh mục thành công!')
        fetchDataBannerCategories()
        setSelectedCheckbox([])
      }
    } catch (error) {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  const items =
    dataBannerCategories?.data && dataBannerCategories?.data?.length > 0
      ? dataBannerCategories?.data.map((item) => ({
          id: (
            <CFormCheck
              key={item?.id_pos}
              aria-label="Default select example"
              defaultChecked={item?.id_pos}
              id={`flexCheckDefault_${item?.id_pos}`}
              value={item?.id_pos}
              checked={selectedCheckbox.includes(item?.id_pos)}
              onChange={(e) => {
                const categoriesId = item?.id_pos
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
          name: item?.name,
          actions: (
            <div className="d-flex align-items-center">
              <CButton
                onClick={() => handleEditClick(item.id_pos)}
                className="button-action mr-2 bg-info"
              >
                <CIcon icon={cilColorBorder} className="text-white" />
              </CButton>
              <CButton
                onClick={() => {
                  setVisible(true)
                  setDeletedId(item.id_pos)
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
              const allIds = dataBannerCategories?.data?.map((item) => item.id_pos) || []
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
      key: 'name',
      label: 'Name',
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
            <h2>DANH MỤC BANNER</h2>
          </CCol>
          <CCol md={6}>
            <div className="d-flex justify-content-end">
              <CButton
                onClick={handleAddNewClick}
                color="primary"
                type="submit"
                size="sm"
                className="button-add"
              >
                Thêm mới
              </CButton>
              <Link to={'/banners/category'}>
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
                      <label htmlFor="name-input">Name</label>
                      <Field name="name" type="text" as={CFormInput} id="name-input" />
                      <ErrorMessage name="name" component="div" className="text-danger" />
                    </CCol>
                    <br />

                    <CCol md={12}>
                      <label htmlFor="width-input">Chiều rộng</label>
                      <Field name="width" type="number" as={CFormInput} id="width-input" />
                      <ErrorMessage name="width" component="div" className="text-danger" />
                    </CCol>
                    <br />

                    <CCol md={12}>
                      <label htmlFor="height-input">Chiều dài</label>
                      <Field name="height" type="number" as={CFormInput} id="height-input" />
                      <ErrorMessage name="height" component="div" className="text-danger" />
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
            <Search count={dataBannerCategories?.total} onSearchData={handleSearch} />
            <CCol md={12} className="mt-3">
              <CButton onClick={handleDeleteAll} color="primary" size="sm">
                Xóa mục đã chọn
              </CButton>
            </CCol>
            <CTable className="mt-2 border" columns={columns} items={items} />

            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(dataBannerCategories?.total / dataBannerCategories?.per_page)}
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

export default AdvertisesCategories
