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
import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import ReactPaginate from 'react-paginate'
import moment, { duration } from 'moment'
import { toast } from 'react-toastify'

import Loading from '../../components/loading/Loading'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import CIcon from '@coreui/icons-react'
import { cilColorBorder, cilTrash } from '@coreui/icons'
import DeletedModal from '../../components/deletedModal/DeletedModal'
import useDebounce from '../../helper/debounce'

const topicCategoriesData = [
  {
    id: 1,
    name: 'DELL',
    theories: [
      { id: 101, name: 'Bài thi 1 - DELL' },
      { id: 102, name: 'Bài thi 2 - DELL' },
      { id: 103, name: 'Bài thi 3 - DELL' },
    ],
  },
  {
    id: 2,
    name: 'ASUS',
    theories: [
      { id: 201, name: 'Bài thi 1 - ASUS' },
      { id: 202, name: 'Bài thi 2 - ASUS' },
      { id: 203, name: 'Bài thi 3 - ASUS' },
    ],
  },
  {
    id: 3,
    name: 'HP',
    theories: [
      { id: 301, name: 'Bài thi 1 - HP' },
      { id: 302, name: 'Bài thi 2 - HP' },
      { id: 303, name: 'Bài thi 3 - HP' },
    ],
  },
  {
    id: 4,
    name: 'Microsoft',
    children: [
      { id: 401, name: 'Bài thi 1 - Microsoft' },
      { id: 402, name: 'Bài thi 2 - Microsoft' },
      { id: 403, name: 'Bài thi 3 - Microsoft' },
    ],
  },
]

function ExamsList() {
  // check permission state
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dataExamsList, setDataExamsList] = useState([])
  const [topicCategories, setTopicCategories] = useState(topicCategoriesData)
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

  // sort filter table
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  // pagination
  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1

    setPageNumber(newPage)
    setSearchParams({ page: newPage })
    window.scrollTo(0, 0)
  }

  // handle sort table
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })

    const sortedData = [...dataExamsList].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1
      return 0
    })

    setDataExamsList(sortedData)
  }

  const fetchDataTopicCategories = async () => {
    try {
      const response = await axiosClient.get(`admin/exam-category`)
      if (response.data.status === true) {
        setTopicCategories(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data topic categories error', error)
    }
  }

  useEffect(() => {
    fetchDataTopicCategories()
  }, [])

  const fetchDataExamsList = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `/admin/quiz?page=${pageNumber}&data=${dataSearch}&categroy=${selectedTopicCategory}`,
      )
      if (response.data.status === true) {
        setDataExamsList(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data exams list is error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataExamsList()
  }, [pageNumber, debouncedSearchTerm, selectedTopicCategory])

  // handle toggle filter table
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchDataExamsList(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/exams/edit?id=${id}`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/admin/information/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataExamsList()
      }
    } catch (error) {
      console.error('Delete admin id is error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  const handleDeleteAll = async () => {
    try {
      const response = await axiosClient.post(`admin/delete-all-hot `, {
        data: selectedUnDealCheckbox,
      })

      if (response.data.status === true) {
        toast.success('Xóa các mục đã chọn thành công!')
        fetchDataExamsList()
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
          <h2>DANH SÁCH BÀI THI</h2>
        </CCol>
        <CCol md={{ span: 4, offset: 4 }}>
          <div className="d-flex justify-content-end gap-3">
            <Link to={`/exams/add`}>
              <CButton color="primary" type="submit" size="sm">
                Thêm mới
              </CButton>
            </Link>
            <Link to={`/exams/examsList`}>
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
                  <td className="total-count">{dataExamsList?.total}</td>
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
                          ...(topicCategories && topicCategories.length > 0
                            ? topicCategories.map((topic) => ({
                                label: topic.name,
                                value: topic.id,
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
                    <strong>Tìm kiếm theo TIÊU ĐỀ BÀI THI, DANH MỤC BÀI THI</strong>
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
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell scope="col">
                    <CFormCheck
                      aria-label="Select all"
                      checked={isAllUnDealCheckbox}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        setIsAllUnDealCheckbox(isChecked)
                        if (isChecked) {
                          const allIds = dataExamsList?.map((item) => item.id) || []
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
                    Tiêu đề{' '}
                    {sortConfig.key === 'title'
                      ? sortConfig.direction === 'asc'
                        ? '🔼'
                        : '🔽'
                      : ''}
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('category.name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Danh mục{' '}
                    {sortConfig.key === 'category.name'
                      ? sortConfig.direction === 'asc'
                        ? '🔼'
                        : '🔽'
                      : ''}
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('category.name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Bài thi{' '}
                    {sortConfig.key === 'category.name'
                      ? sortConfig.direction === 'asc'
                        ? '🔼'
                        : '🔽'
                      : ''}
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('time')}
                    style={{ cursor: 'pointer' }}
                  >
                    Thời gian{' '}
                    {sortConfig.key === 'time'
                      ? sortConfig.direction === 'asc'
                        ? '🔼'
                        : '🔽'
                      : ''}
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('time')}
                    style={{ cursor: 'pointer' }}
                  >
                    Điểm thưởng{' '}
                    {sortConfig.key === 'time'
                      ? sortConfig.direction === 'asc'
                        ? '🔼'
                        : '🔽'
                      : ''}
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('updateTime')}
                    style={{ cursor: 'pointer' }}
                  >
                    Update Time{' '}
                    {sortConfig.key === 'updateTime'
                      ? sortConfig.direction === 'asc'
                        ? '🔼'
                        : '🔽'
                      : ''}
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {dataExamsList?.data &&
                  dataExamsList?.data.length > 0 &&
                  dataExamsList?.data?.map((item) => (
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
                        <Link to={`/exams/edit?id=${item?.id}`}>{item.name}</Link>
                      </CTableDataCell>
                      <CTableDataCell>{item?.category?.name}</CTableDataCell>
                      <CTableDataCell>{item?.category?.theory?.lesson_name}</CTableDataCell>
                      <CTableDataCell>{item?.time}</CTableDataCell>
                      <CTableDataCell>{item?.pointAward}</CTableDataCell>
                      <CTableDataCell>
                        {moment(item?.updated_at).format('DD-MM-YYYY, hh:mm:ss A')}
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
            pageCount={Math.ceil(dataExamsList.total / dataExamsList.per_page)}
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

export default ExamsList
