import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CTooltip,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import ReactPaginate from 'react-paginate'
import moment from 'moment'
import { toast } from 'react-toastify'

import Loading from '../../components/loading/Loading'
import { axiosClient } from '../../axiosConfig'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilColorBorder, cilTrash } from '@coreui/icons'
import useDebounce from '../../helper/debounce'
import ConfirmModal from '../../components/deletedModal/ConfirmModal'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import '../gift/styles/userGotGift.scss'

function UserGotGift() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dataReward, setDataReward] = useState([])

  const initialPage = Number(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(initialPage)

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

  // convert string to timestamp
  const convertStringToTimeStamp = (dateString) => {
    if (dateString == '') {
      return ''
    } else {
      const dateMoment = moment(dateString, 'ddd MMM DD YYYY HH:mm:ss GMTZ')
      return dateMoment.unix()
    }
  }

  // validate for date start - date end
  const validateDates = (start, end) => {
    const newErrors = { startDate: '', endDate: '' }
    if (start && end && start > end) {
      newErrors.startDate = 'Ngày bắt đầu không được sau ngày kết thúc'
      newErrors.endDate = 'Ngày kết thúc không được trước ngày bắt đầu'
    }
    setErrors(newErrors)
  }

  const handleStartDateChange = (date) => {
    setStartDate(date)
    validateDates(date, endDate)
  }

  const handleEndDateChange = (date) => {
    setEndDate(date)
    validateDates(startDate, date)
  }

  //loading
  const [isLoading, setIsLoading] = useState(false)

  //checkbox for selected delete items
  const [isAllUnDealCheckbox, setIsAllUnDealCheckbox] = useState(false)
  const [selectedUnDealCheckbox, setSelectedUnDealCheckbox] = useState([])

  // show deleted Modal
  const [visible, setVisible] = useState(false)
  const [confirmId, setConfirmId] = useState(null)

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

  const fetchDataRewardHistory = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `/gift-history?page=${pageNumber}&data=${dataSearch}&start_time=${startDate !== null ? convertStringToTimeStamp(startDate) : ''}&end_time=${endDate !== null ? convertStringToTimeStamp(endDate) : ''}`,
      )
      if (response.data.status === true) {
        setDataReward(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data reward list error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataRewardHistory()
  }, [pageNumber, debouncedSearchTerm])

  // handle toggle filter table
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchDataRewardHistory(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/gifts/reward-detail?id=${id}`)
  }

  return (
    <CContainer>
      <CRow className="my-3">
        <CCol>
          <h3>LỊCH SỬ ĐỔI QUÀ</h3>
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
                  <td className="total-count">{dataReward?.pagination?.total}</td>
                </tr>
                <tr>
                  <td>Theo ngày</td>
                  <td>
                    <div className="custom-datepicker-wrapper">
                      <DatePicker
                        className="custom-datepicker"
                        dateFormat={'dd-MM-yyyy'}
                        showIcon
                        selected={startDate}
                        onChange={handleStartDateChange}
                      />
                      <p className="datepicker-label">{'đến ngày'}</p>
                      <DatePicker
                        className="custom-datepicker"
                        dateFormat={'dd-MM-yyyy'}
                        showIcon
                        selected={endDate}
                        onChange={handleEndDateChange}
                      />
                    </div>
                    {errors.startDate && <p className="text-danger">{errors.startDate}</p>}
                    {errors.endDate && <p className="text-danger">{errors.endDate}</p>}
                  </td>
                </tr>
                <tr>
                  <td>Tìm kiếm</td>
                  <td>
                    <strong>Tìm kiếm từ khóa theo USERNAME, EMAIL, SỐ ĐIỆN THOẠI</strong>
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

      {/* <CRow>
        <CCol className="my-2" md={4}>
          <CButton color="primary" size="sm" onClick={handleDeleteAll}>
            Xóa mục đã chọn
          </CButton>
        </CCol>
      </CRow> */}

      {isLoading ? (
        <Loading />
      ) : (
        <CRow className="mt-2">
          <CCol>
            <CTable style={{ fontSize: 13 }} className="border" hover>
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
                          const allIds = dataReward?.map((item) => item.id) || []
                          setSelectedUnDealCheckbox(allIds)
                        } else {
                          setSelectedUnDealCheckbox([])
                        }
                      }}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Username
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Thông tin user
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Quà chọn
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Điểm đổi
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    T/g đổi quà
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Trạng thái quà tặng
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {dataReward?.list &&
                  dataReward?.list?.length > 0 &&
                  dataReward?.list?.map((item) => (
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
                        <div className="blue-txt">{item?.member.username}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>
                          <span>Họ tên: </span>
                          <span style={{ fontWeight: 500 }}>{item?.member.full_name}</span>
                        </div>
                        <div>
                          <div>
                            <span>Số điện thoại: </span>
                            <span style={{ fontWeight: 500 }}>{item?.member?.phone}</span>
                          </div>
                        </div>
                        <div>
                          <div>
                            <span>Email: </span>
                            <span style={{ fontWeight: 500 }}>{item?.member?.email}</span>
                          </div>
                        </div>
                        <div>
                          <span>Công ty: </span>
                          <span style={{ fontWeight: 500 }}>{item?.member?.nameCompany}</span>
                        </div>
                      </CTableDataCell>

                      <CTableDataCell className="gift-title-cell">
                        <CTooltip content={item?.gift?.title}>
                          <div className="orange-txt">{item?.gift?.title}</div>
                        </CTooltip>
                      </CTableDataCell>

                      <CTableDataCell>
                        <div
                          style={{
                            fontWeight: 600,
                          }}
                        >
                          {item?.gift?.reward_point}
                        </div>
                      </CTableDataCell>

                      <CTableDataCell>{item?.confirm_at}</CTableDataCell>

                      <CTableDataCell>
                        {item?.status == 'Đã xác nhận' ? (
                          <span
                            style={{
                              color: 'green',
                              fontWeight: 500,
                            }}
                          >
                            Đã xác nhận
                          </span>
                        ) : (
                          <span
                            style={{
                              color: 'red',
                              fontWeight: 500,
                            }}
                          >
                            Chưa xác nhận
                          </span>
                        )}
                      </CTableDataCell>

                      <CTableDataCell>
                        <div className="d-flex align-items-center">
                          <CButton
                            onClick={() => handleEditClick(item.id)}
                            className="button-action mr-2 bg-info"
                          >
                            <CIcon icon={cilColorBorder} className="text-white" />
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
            pageCount={Math.ceil(dataReward?.pagination?.total / dataReward?.pagination?.per_page)}
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

export default UserGotGift
