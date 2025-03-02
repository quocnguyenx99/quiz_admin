import React, { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { CButton, CCol, CContainer, CFormCheck, CFormSelect, CRow, CTable } from '@coreui/react'
import ReactPaginate from 'react-paginate'
import { axiosClient } from '../../axiosConfig'
import moment from 'moment/moment'
import './css/adminLog.css'

import { Link } from 'react-router-dom'

function AdminLog() {
  const [isCollapse, setIsCollapse] = useState(false)

  // check permission state
  const [isPermissionCheck, setIsPermissionCheck] = useState(true)

  const [selectedCheckbox, setSelectedCheckbox] = useState([])

  const [adminLogData, setAdminLogData] = useState([])
  const [userNameData, setUserNameData] = useState([])
  const [selectedUsername, setSelectedUsername] = useState('')

  // search input
  const [dataSearch, setDataSearch] = useState('')

  //pagination state
  const [pageNumber, setPageNumber] = useState(1)

  // date picker
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const convertStringToTimeStamp = (dateString) => {
    if (dateString == '') {
      return ''
    } else {
      const dateMoment = moment(dateString, 'ddd MMM DD YYYY HH:mm:ss GMTZ')
      return dateMoment.unix()
    }
  }

  const fetchAdminLogData = async (dataSearch = '') => {
    try {
      const response = await axiosClient.get(
        `admin/admin-log?page=${pageNumber}&data=${dataSearch}&username=${selectedUsername}&fromDate=${startDate !== null ? convertStringToTimeStamp(startDate) : ''}&toDate=${endDate !== null ? convertStringToTimeStamp(endDate) : ''}`,
      )

      if (response.data.status === true) {
        setAdminLogData(response.data.listLog)
      }

      if (response.data.status === false && response.data.mess == 'no permission') {
        setIsPermissionCheck(false)
      }
    } catch (error) {
      console.error('Fetch admin log data is error', error)
    }
  }

  useEffect(() => {
    fetchAdminLogData()
  }, [pageNumber, selectedUsername, startDate, endDate])

  const fetchUserNameData = async () => {
    try {
      const response = await axiosClient.get('admin/select-name-admin')
      if (response.data.status === true) {
        setUserNameData(response.data.data)
      }
    } catch (error) {
      console.error('Fetch username data is error', error)
    }
  }

  useEffect(() => {
    fetchUserNameData()
  }, [])

  const columns = [
    {
      key: 'id',
      label: '#',
      _props: { scope: 'col' },
    },
    {
      key: 'username',
      label: 'Username',
      _props: { scope: 'col' },
    },
    {
      key: 'page',
      label: 'Page',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Action',
      _props: { scope: 'col' },
    },
    {
      key: 'nameID',
      label: 'Name/ID',
      _props: { scope: 'col' },
    },

    {
      key: 'time',
      label: 'Time',
      _props: { scope: 'col' },
    },
    {
      key: 'ip',
      label: 'IP',
      _props: { scope: 'col' },
    },
  ]

  const items =
    adminLogData?.data && adminLogData?.data.length > 0
      ? adminLogData?.data.map((log) => ({
          id: <CFormCheck id="flexCheckDefault" />,
          username: <div className="fw-bold">{log?.username}</div>,
          page: log?.cat,
          actions: log?.action,
          nameID: log?.display_name,
          time: moment.unix(log?.time).format('DD-MM-YYYY, hh:mm:ss A'),
          ip: log?.ip,
          _cellProps: { id: { scope: 'row' } },
        }))
      : []

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
    console.log('keyword:', keyword)
    fetchAdminLogData(keyword)
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
          <CRow className="mb-3">
            <CCol md={6}>
              <h2>LỊCH SỬ HOẠT ĐỘNG ADMIN</h2>
            </CCol>
          </CRow>
          <CRow>
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
                    <td className="total-count">{adminLogData?.total}</td>
                  </tr>
                  <tr>
                    <td>Lọc</td>
                    <td>
                      <CFormSelect
                        className="component-size w-25"
                        aria-label="Chọn yêu cầu lọc"
                        value={selectedUsername}
                        onChange={(e) => setSelectedUsername(e.target.value)}
                        options={[
                          { label: 'Tất cả username', value: '' },
                          ...(userNameData && userNameData?.length > 0
                            ? userNameData?.map((item) => ({
                                label: item.username,
                                value: item.username,
                              }))
                            : []),
                        ]}
                      />
                    </td>
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
                      <div className="mt-2">
                        <strong>
                          <em>Tìm kiếm theo tên Page đã truy cập</em>
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
                      </div>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </CRow>

          <CRow>
            <CCol className="my-2" md={4}>
              <CButton color="primary" size="sm">
                Xóa vĩnh viễn
              </CButton>
            </CCol>
          </CRow>

          <CRow>
            <CTable className="mt-2" columns={columns} items={items} />
            <div className="d-flex justify-content-end">
              <ReactPaginate
                pageCount={Math.ceil(adminLogData?.total / adminLogData?.per_page)}
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

export default AdminLog
