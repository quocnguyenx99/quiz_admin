import { CCol, CContainer, CFormCheck, CRow, CTable } from '@coreui/react'
import React, { useCallback, useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import { toast, ToastContainer } from 'react-toastify'
import 'react-datepicker/dist/react-datepicker.css'
import { axiosClient } from '../../axiosConfig'
import axios from 'axios'
import ReactPaginate from 'react-paginate'
import { Link } from 'react-router-dom'
import moment from 'moment/moment'
import Loading from '../../components/loading/Loading'

function userLog() {
  const [isCollapse, setIsCollapse] = useState(false)
  const [dataSearch, setDataSearch] = useState('')
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })
  const [paginate, setPaginate] = useState(false)
  const [memberLog, setMemberLog] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const validateDates = (start, end) => {
    const newErrors = { startDate: '', endDate: '' }
    if (start && end && start > end) {
      newErrors.startDate = 'Ngày bắt đầu không được sau ngày kết thúc'
      newErrors.endDate = 'Ngày kết thúc không được trước ngày bắt đầu'
    }
    setErrors(newErrors)
  }

  const convertStringToTimeStamp = (dateString) => {
    if (dateString == '') {
      return ''
    } else {
      const dateMoment = moment(dateString, 'ddd MMM DD YYYY HH:mm:ss GMTZ')
      return dateMoment.unix()
    }
  }

  const fetchMemberLog = async () => {
    try {
      setIsLoading(true)
      const startTimestamp = startDate ? convertStringToTimeStamp(startDate) : ''
      let endTimestamp = endDate ? convertStringToTimeStamp(endDate) : ''

      if (startTimestamp && !endTimestamp) {
        endTimestamp = startTimestamp
      }

      const url = `http://192.168.245.190:8085/api/admin/member_log?page=${pageNumber}&data=${dataSearch}&start_time=${startTimestamp}&end_time=${endTimestamp}`

      const res = await axios(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('quizToken')}`,
        },
      })

      if (res.data.status === true) {
        setMemberLog(res.data.member_log.data)
        setPaginate(res.data.member_log.pagination)
      }
      if (res.data.status === false && res.data.mess === 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      toast.error('Lỗi lấy danh sách truy cập')
      console.error('Fetch failed: ', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMemberLog()
  }, [pageNumber, startDate, endDate])

  const items =
    memberLog && memberLog.length > 0
      ? memberLog?.map((log) => ({
          user: <div className="fw-bold">{log.member.username}</div>,
          link: <div style={{ minWidth: '100px' }}>{log.friendly_url}</div>,
          module: <div>{log.module}</div>,
          action: <div>{log.action}</div>,
          date: <div>{moment(log.created_at).format('DD-MM-YYYY, hh:mm:ss A')}</div>,
          ip: <div>{log.ip_address}</div>,
        }))
      : []

  const columns = [
    {
      key: 'user',
      label: 'Khách hàng',
      _props: { scope: 'col', style: { textAlign: 'center' } },
    },

    {
      key: 'link',
      label: 'Link',
      _props: { scope: 'col', style: { textAlign: 'center', width: '30%' } },
    },

    {
      key: 'module',
      label: 'Module',
      _props: { scope: 'col', style: { textAlign: 'center' } },
    },

    {
      key: 'action',
      label: 'Action',
      _props: { scope: 'col', style: { textAlign: 'center' } },
    },
    {
      key: 'date',
      label: 'Ngày truy cập',
      _props: { scope: 'col', style: { textAlign: 'center' } },
    },
    {
      key: 'ip',
      label: 'Địa chỉ IP',
      _props: { scope: 'col', style: { textAlign: 'center' } },
    },
  ]

  const handlePageChange = ({ selected }) => {
    setCurrentPage(selected)
    const newPage = selected + 1
    setPageNumber(newPage)
    window.scrollTo(0, 0)
  }

  const resetPagination = () => {
    setPageNumber(1)
    setCurrentPage(0)
  }

  const handleSearch = (keyword) => {
    fetchMemberLog(keyword)
    resetPagination()
  }

  const handleStartDateChange = (date) => {
    setStartDate(date)
    validateDates(date, endDate)
    resetPagination()
  }

  const handleEndDateChange = (date) => {
    setEndDate(date)
    validateDates(startDate, date)
    resetPagination()
  }

  return (
    <CContainer>
      {!isPermissionCheck ? (
        <h5>
          <div>Bạn không đủ quyền để thao tác trên danh mục quản trị này.</div>
          <div className="mt-4">
            Vui lòng quay lại trang chủ <Link to={'/dashboard'}>(Nhấn vào để quay lại)</Link>
          </div>
        </h5>
      ) : (
        <>
          <ToastContainer />
          <CRow className="my-3">
            <CCol md={6}>
              <h3>DANH SÁCH TRUY CẬP</h3>
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
                      <td className="total-count">{paginate?.total ? paginate.total : 0}</td>
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
                        <strong>Tìm kiếm từ khóa theo: Khách hàng</strong>
                        <input
                          type="text"
                          className="search-input"
                          value={dataSearch}
                          onChange={(e) => setDataSearch(e.target.value)}
                        />
                        <button
                          onClick={() => {
                            handleSearch(dataSearch)
                          }}
                          className="submit-btn"
                        >
                          Submit
                        </button>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </CCol>
          </CRow>
          <CRow className="mt-2">
            {isLoading ? <Loading /> : <CTable columns={columns} items={items} />}
            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={paginate.total_pages}
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
          </CRow>
        </>
      )}
    </CContainer>
  )
}

export default userLog
