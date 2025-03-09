import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CImage,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import ReactPaginate from 'react-paginate'
import moment from 'moment'
import { toast } from 'react-toastify'

import Loading from '../../../components/loading/Loading'
import { axiosClient, imageBaseUrl } from '../../../axiosConfig'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilTrash } from '@coreui/icons'
import DeletedModal from '../../../components/deletedModal/DeletedModal'
import useDebounce from '../../../helper/debounce'

function AdvertisesList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dataBannersList, setDataBannersList] = useState([])
  const [bannerCategories, setBannerCategories] = useState([])
  const [selectedTopicCategory, setSelectedTopicCategory] = useState([])

  const initialPage = Number(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(initialPage)

  //loading
  const [isLoading, setIsLoading] = useState(false)

  //checkbox for selected delete items
  const [isAllUnDealCheckbox, setIsAllUnDealCheckbox] = useState(false)
  const [selectedUnDealCheckbox, setSelectedUnDealCheckbox] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [deletedId, setDeletedId] = useState(null)

  // toggel table
  const [isCollapse, setIsCollapse] = useState(false)

  // search input
  const [dataSearch, setDataSearch] = useState('')
  const debouncedSearchTerm = useDebounce(dataSearch, 1000)

  // pagination
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1

    setPageNumber(newPage)
    setSearchParams({ page: newPage })
    window.scrollTo(0, 0)
  }

  const fetchDataBannerCategories = async () => {
    try {
      const response = await axiosClient.get(`/admin/ad-pos`)
      if (response.data.status === true) {
        setBannerCategories(response.data.list.data)
      }
    } catch (error) {
      console.error('Fetch data topic categories error', error)
    }
  }

  useEffect(() => {
    fetchDataBannerCategories()
  }, [])

  const fetchDataBannersList = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `/admin/advertise?page=${pageNumber}&data=${dataSearch}&id_pos=${selectedTopicCategory}`,
      )
      if (response.data.status === true) {
        setDataBannersList(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data lesson list error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataBannersList()
  }, [pageNumber, debouncedSearchTerm, selectedTopicCategory])

  // handle toggle filter table
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchDataBannersList(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/banners/edit?id=${id}`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/admin/advertise/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataBannersList()
      }
    } catch (error) {
      console.error('Delete banner id error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`admin/delete-all-advertise `, {
        data: selectedUnDealCheckbox,
      })
      if (response.data.status === true) {
        toast.success('Xóa các mục đã chọn thành công!')
        fetchDataBannersList()
        setSelectedUnDealCheckbox([])
      }
    } catch (error) {
      console.error('Post set delete all is error', error)
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    }
  }

  return (
    <CContainer>
      <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

      <CRow className="my-3">
        <CCol>
          <h3>DANH SÁCH BANNER</h3>
        </CCol>
        <CCol md={{ span: 4, offset: 4 }}>
          <div className="d-flex justify-content-end gap-2">
            <Link to={`/banners/add`}>
              <CButton color="primary" type="submit" size="sm">
                Thêm mới
              </CButton>
            </Link>
            <Link to={`/banners/bannersList`}>
              <CButton color="primary" type="submit" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>

      <CRow>
        <CCol md={12}>
          <table className="filter-table">
            <thead>
              <tr>
                <th colSpan="2">
                  <div className="d-flex justify-content-between">
                    <span>Bộ lọc tìm kiếm</span>
                    <span className="toggle-pointer" onClick={handleToggleCollapse}>
                      {isCollapse ? '▼' : '▲'}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            {!isCollapse && (
              <tbody>
                <tr>
                  <td>Tổng cộng</td>
                  <td className="total-count">{dataBannersList?.total}</td>
                </tr>
                <tr>
                  <td>Lọc</td>
                  <td>
                    <label>Chọn danh mục</label>
                    <div
                      className="d-flex"
                      style={{
                        columnGap: 10,
                      }}
                    >
                      <CFormSelect
                        className="component-size w-25"
                        aria-label="Chọn danh mục"
                        value={selectedTopicCategory}
                        onChange={(e) => setSelectedTopicCategory(e.target.value)}
                        options={[
                          { label: 'Tất cả', value: '' },
                          ...(bannerCategories && bannerCategories.length > 0
                            ? bannerCategories.map((topic) => ({
                                label: topic.title,
                                value: topic.id_pos,
                              }))
                            : []),
                        ]}
                      />
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>Tìm kiếm</td>
                  <td>
                    <strong>Tìm kiếm từ khóa theo TIÊU ĐỀ BANNER</strong>
                    <input
                      type="text"
                      className="search-input"
                      value={dataSearch}
                      onChange={(e) => setDataSearch(e.target.value)}
                    />
                    <button onClick={() => handleSearch(dataSearch)} className="submit-btn">
                      Submit
                    </button>
                  </td>
                </tr>
              </tbody>
            )}
          </table>
        </CCol>
      </CRow>

      <CRow>
        <CCol className="my-2" md={4}>
          <CButton color="primary" size="sm" onClick={handleDeleteAll}>
            Xóa mục đã chọn
          </CButton>
        </CCol>
      </CRow>

      {isLoading ? (
        <Loading />
      ) : (
        <CRow className="mt-2">
          <CCol>
            <CTable className="border">
              <CTableHead color="primary">
                <CTableRow>
                  <CTableHeaderCell scope="col">
                    <CFormCheck
                      aria-label="Select all"
                      checked={isAllUnDealCheckbox}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        setIsAllUnDealCheckbox(isChecked)
                        if (isChecked) {
                          const allIds = dataBannersList?.map((item) => item.id) || []
                          setSelectedUnDealCheckbox(allIds)
                        } else {
                          setSelectedUnDealCheckbox([])
                        }
                      }}
                    />
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Hình ảnh
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Tiêu đề
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Danh mục
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {dataBannersList?.data &&
                  dataBannersList?.data?.length > 0 &&
                  dataBannersList?.data?.map((item, index) => (
                    <CTableRow key={item.id}>
                      <CTableHeaderCell scope="row">
                        <CFormCheck
                          key={item?.id}
                          aria-label="Default select example"
                          defaultChecked={item?.id}
                          id={`flexCheckDefault_${item?.id}`}
                          value={item?.id}
                          checked={selectedUnDealCheckbox.includes(item?.id)}
                          onChange={(e) => {
                            const undealId = item?.id
                            const isChecked = e.target.checked
                            if (isChecked) {
                              setSelectedUnDealCheckbox([...selectedUnDealCheckbox, undealId])
                            } else {
                              setSelectedUnDealCheckbox(
                                selectedUnDealCheckbox.filter((id) => id !== undealId),
                              )
                            }
                          }}
                        />
                      </CTableHeaderCell>

                      <CTableDataCell>
                        <CImage
                          src={`${imageBaseUrl}/uploads/${item.picture}`}
                          width={300}
                          alt={`Ảnh ${item.id}`}
                        />
                      </CTableDataCell>

                      <CTableDataCell>
                        <div>{item?.title}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div
                          className="blue-txt"
                          style={{
                            fontWeight: 400,
                          }}
                        >
                          {item?.adpos?.title}
                        </div>
                      </CTableDataCell>

                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-1">
                          <CButton
                            size="sm"
                            onClick={() => handleEditClick(item.id)}
                            className="button-action mr-2 bg-info"
                          >
                            <CIcon icon={cilColorBorder} className="text-white" />
                          </CButton>
                          <CButton
                            size="sm"
                            onClick={() => {
                              setVisible(true)
                              setDeletedId(item?.id)
                            }}
                            className="button-action bg-danger"
                          >
                            <CIcon icon={cilTrash} className="text-white" />
                          </CButton>
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
              </CTableBody>
            </CTable>
          </CCol>
        </CRow>
      )}

      <CRow className="mt-3">
        <div className="d-flex justify-content-end">
          <ReactPaginate
            pageCount={Math.ceil(dataBannersList.total / dataBannersList.per_page)}
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
            forcePage={pageNumber - 1}
          />
        </div>
      </CRow>
    </CContainer>
  )
}

export default AdvertisesList
