import { CCol, CContainer, CFormCheck, CRow } from '@coreui/react'
import React, { useState } from 'react'
import DatePicker from 'react-datepicker'
import { ToastContainer } from 'react-toastify'
import 'react-datepicker/dist/react-datepicker.css'

function userLog() {
  const [isCollapse, setIsCollapse] = useState(false)
  const [dataSearch, setDataSearch] = useState('')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })
  const [isAllCheckbox, setIsAllCheckbox] = useState(false)

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

  const handleStartDateChange = (date) => {
    setStartDate(date)
    validateDates(date, endDate)
  }

  const handleEndDateChange = (date) => {
    setEndDate(date)
    validateDates(startDate, date)
  }

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
      key: 'quantity',
      label: 'Số lượng',
      _props: { scope: 'col' },
    },
    {
      key: 'actions',
      label: 'Tác vụ',
      _props: { scope: 'col' },
    },
  ]

  return (
    <>
      <CContainer>
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
                    <td className="total-count"></td>
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
                      <button className="submit-btn">Submit</button>
                    </td>
                  </tr>
                </tbody>
              )}
            </table>
          </CCol>
        </CRow>
      </CContainer>
    </>
  )
}

export default userLog
