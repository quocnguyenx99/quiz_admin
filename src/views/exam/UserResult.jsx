import {
  CButton,
  CCol,
  CContainer,
  CFormCheck,
  CFormSelect,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import ReactPaginate from 'react-paginate'
import moment from 'moment'
import { toast } from 'react-toastify'

import Loading from '../../components/loading/Loading'
import { axiosClient } from '../../axiosConfig'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import useDebounce from '../../helper/debounce'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

function UserResultList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dataUserResult, setDataUserResult] = useState([])
  const [topicCategories, setTopicCategories] = useState([])
  const [selectedTopicCategory, setSelectedTopicCategory] = useState([])

  const initialPage = Number(searchParams.get('page')) || 1
  const [pageNumber, setPageNumber] = useState(initialPage)

  // date picker
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [errors, setErrors] = useState({ startDate: '', endDate: '' })

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

  // pagination
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1

    setPageNumber(newPage)
    setSearchParams({ page: newPage })
    window.scrollTo(0, 0)
  }

  const fetchDataTopicCategories = async () => {
    try {
      const response = await axiosClient.get(`/theory-category`)
      if (response.data.status === true) {
        setTopicCategories(response.data.list)
      }
    } catch (error) {
      console.error('Fetch data topic categories error', error)
    }
  }

  useEffect(() => {
    fetchDataTopicCategories()
  }, [])

  const fetchDataUserResult = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `/admin/result-exams?page=${pageNumber}&data=${dataSearch}`,
      )
      if (response.data.status === true) {
        setDataUserResult(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data member list error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataUserResult()
  }, [pageNumber, debouncedSearchTerm])

  // handle toggle filter table
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchDataUserResult(keyword)
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
        fetchDataUserResult()
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
          <h3>DANH SÁCH KẾT QUẢ THI</h3>
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
                  <td className="total-count">{dataUserResult?.total}</td>
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
                    {errors.startDate && <span className="text-danger">{errors.startDate}</span>}
                    {errors.endDate && <span className="text-danger">{errors.endDate}</span>}
                  </td>
                </tr>
                <tr>
                  <td>Lọc theo</td>
                  <td>
                    <label>Chọn danh mục bài học</label>
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
                          ...(topicCategories && topicCategories.length > 0
                            ? topicCategories.map((topic) => ({
                                label: topic.title,
                                value: topic.theory_id,
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
                    <strong>Tìm kiếm từ khóa theo USERNAME, KẾT QUẢ</strong>
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
                          const allIds = dataUserResult?.map((item) => item.id) || []
                          setSelectedUnDealCheckbox(allIds)
                        } else {
                          setSelectedUnDealCheckbox([])
                        }
                      }}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Họ Tên
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Bài thi
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Số lần thi
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Kết quả
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Thời gian bắt đầu thi
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Thời gian nộp bài
                  </CTableHeaderCell>
                  {/* <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell> */}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {dataUserResult?.data &&
                  dataUserResult?.data?.length > 0 &&
                  dataUserResult?.data?.map((item) => (
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
                        <div className="blue-txt">{item?.member?.username}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div
                          className="blue-txt"
                          style={{
                            fontWeight: 400,
                          }}
                        >
                          {item?.quiz?.name}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{item?.times}</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>
                          {item?.is_finish === 0 ? (
                            <span className="orange-txt">Không đạt</span>
                          ) : (
                            <span
                              style={{
                                color: 'green',
                                fontWeight: 600,
                              }}
                            >
                              Pass
                            </span>
                          )}
                        </div>
                      </CTableDataCell>

                      <CTableDataCell>
                        {moment.unix(item?.time_start).format('DD-MM-YYYY')}
                      </CTableDataCell>

                      <CTableDataCell>{item?.time_end}</CTableDataCell>

                      {/* <CTableDataCell>
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
                      </CTableDataCell> */}
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
            pageCount={Math.ceil(dataUserResult.total / dataUserResult.per_page)}
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

export default UserResultList
