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

import Loading from '../../components/loading/Loading'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilTrash } from '@coreui/icons'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import useDebounce from '../../helper/debounce'

function MemberList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dataMemberList, setDataMemberList] = useState([])

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

  // sort filter table
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // pagination
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1

    setPageNumber(newPage)
    setSearchParams({ page: newPage })
    window.scrollTo(0, 0)
  }

  const fetchDataMemberList = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(`/admin/member?page=${pageNumber}&data=${dataSearch}`)
      if (response.data.status === true) {
        setDataMemberList(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data member list error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataMemberList()
  }, [pageNumber, debouncedSearchTerm])

  // handle toggle filter table
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchDataMemberList(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/members/edit?id=${id}`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/admin/member/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataMemberList()
      }
    } catch (error) {
      console.error('Delete member id error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteAll = async () => {
    alert('Đang phát triển ...')
    // try {
    //   const response = await axiosClient.post(`admin/delete-all-hot `, {
    //     data: selectedUnDealCheckbox,
    //   })
    //   if (response.data.status === true) {
    //     toast.success('Xóa các mục đã chọn thành công!')
    //     fetchDataExamsList()
    //     setSelectedUnDealCheckbox([])
    //   }
    // } catch (error) {
    //   console.error('Post set delete all is error', error)
    //   toast.error('Đã xảy ra lỗi. Vui lòng thử lại!')
    // }
  }

  return (
    <CContainer>
      <DeletedModal visible={visible} setVisible={setVisible} onDelete={handleDelete} />

      <CRow className="my-3">
        <CCol>
          <h3>DANH SÁCH THÀNH VIÊN</h3>
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
                  <td className="total-count">{dataMemberList?.total}</td>
                </tr>
                <tr>
                  <td>Tìm kiếm</td>
                  <td>
                    <strong>
                      Tìm kiếm từ khóa theo USERNAME, EMAIL, TÊN KHÁCH HÀNG, MÃ SỐ THUẾ, TÊN CÔNG TY
                    </strong>
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
            <CTable className="border" hover>
              <CTableHead style={{ fontSize: 13 }} color="primary">
                <CTableRow>
                  <CTableHeaderCell scope="col">
                    <CFormCheck
                      aria-label="Select all"
                      checked={isAllUnDealCheckbox}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        setIsAllUnDealCheckbox(isChecked)
                        if (isChecked) {
                          const allIds = dataMemberList?.map((item) => item.id) || []
                          setSelectedUnDealCheckbox(allIds)
                        } else {
                          setSelectedUnDealCheckbox([])
                        }
                      }}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('title')}
                    style={{ cursor: 'pointer' }}
                  >
                    Username
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('category.name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Thông tin thành viên
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('category.name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Bài học pass
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('updateTime')}
                    style={{ cursor: 'pointer' }}
                  >
                    Ngày đăng ký
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('updateTime')}
                    style={{ cursor: 'pointer' }}
                  >
                    Ngày phê duyệt
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('updateTime')}
                    style={{ cursor: 'pointer' }}
                  >
                    Trạng thái tài khoản
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {dataMemberList?.data &&
                  dataMemberList?.data?.length > 0 &&
                  dataMemberList?.data?.map((item) => (
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
                        <div className="blue-txt">{item.username}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>
                          <span>Họ tên: </span>
                          <span style={{ fontWeight: 500 }}>{item?.full_name}</span>
                        </div>
                        <div>
                          <div>
                            <span>Điểm tích lũy: </span>
                            <span style={{ fontWeight: 500 }}>{item?.points}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span>Điểm sử dụng: </span>
                            <span style={{ fontWeight: 500 }}>{item?.used_points}</span>
                          </div>
                        </div>
                        <div>
                          <span>Công ty: </span>
                          <span style={{ fontWeight: 500 }}>{item?.nameCompany}</span>
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="orange-txt">{item?.number_passes}</div>
                      </CTableDataCell>

                      <CTableDataCell>
                        {moment(item?.created_at).format('DD-MM-YYYY, hh:mm:ss A')}
                      </CTableDataCell>

                      <CTableDataCell>
                        {moment(item?.updated_at).format('DD-MM-YYYY, hh:mm:ss A')}
                      </CTableDataCell>
                      <CTableDataCell>
                        {item.m_status === 0 ? (
                          <span className="orange-txt">Chưa kích hoạt</span>
                        ) : (
                          <span style={{ color: 'green', fontWeight: 600 }}>Đã kích hoạt</span>
                        )}
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
            pageCount={Math.ceil(dataMemberList.total / dataMemberList.per_page)}
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

export default MemberList
