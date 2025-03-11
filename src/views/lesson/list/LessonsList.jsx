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

function LessonList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dataLessonList, setDataLessonList] = useState([])
  const [lessonPagination, setLessonPagination] = useState({})
  const [topicCategories, setTopicCategories] = useState([])
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

  const fetchDataLessonList = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(
        `/theory?page=${pageNumber}&data=${dataSearch}&cat_id=${selectedTopicCategory}`,
      )
      if (response.data.status === true) {
        setDataLessonList(response.data.list)
        setLessonPagination(response.data.pagination)
      }
    } catch (error) {
      console.error('Fetch data lesson list error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataLessonList()
  }, [pageNumber, debouncedSearchTerm, selectedTopicCategory])

  // handle toggle filter table
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchDataLessonList(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/lessons/edit?id=${id}`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/theory/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataLessonList()
      }
    } catch (error) {
      console.error('Delete lesson id error', error)
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
          <h3>DANH SÁCH BÀI HỌC</h3>
        </CCol>
        <CCol md={{ span: 4, offset: 4 }}>
          <div className="d-flex justify-content-end gap-2">
            <Link to={`/lessons/add`}>
              <CButton color="primary" type="submit" size="sm">
                Thêm mới
              </CButton>
            </Link>
            <Link to={`/lessons/lessonsList`}>
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
                  <td className="total-count">{lessonPagination?.total}</td>
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
                                label: topic.title,
                                value: topic.cat_id,
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
                    <strong>Tìm kiếm từ khóa theo TIÊU ĐỀ BÀI HỌC</strong>
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
                          const allIds = dataLessonList?.map((item) => item.id) || []
                          setSelectedUnDealCheckbox(allIds)
                        } else {
                          setSelectedUnDealCheckbox([])
                        }
                      }}
                    />
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Tiêu đề
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Hình ảnh
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Danh mục
                  </CTableHeaderCell>

                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Create Time
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col" style={{ cursor: 'pointer' }}>
                    Update Time
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {dataLessonList &&
                  dataLessonList?.length > 0 &&
                  dataLessonList?.map((item, index) => (
                    <CTableRow key={item.theory_id}>
                      <CTableHeaderCell scope="row">
                        <CFormCheck
                          key={item?.theory_id}
                          aria-label="Default select example"
                          defaultChecked={item?.theory_id}
                          id={`flexCheckDefault_${item?.theory_id}`}
                          value={item?.theory_id}
                          checked={selectedUnDealCheckbox.includes(item?.theory_id)}
                          onChange={(e) => {
                            const undealId = item?.theory_id
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
                        <Link to={`/lessons/edit?id=${item?.theory_id}`}>
                          <div className="blue-txt">{item.title}</div>
                        </Link>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CImage
                          src={`${imageBaseUrl}/uploads/${item.picture}`}
                          width={120}
                          alt={`Ảnh ${item.theory_id}`}
                        />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div
                          className="blue-txt"
                          style={{
                            fontWeight: 400,
                          }}
                        >
                          {item?.category?.title}
                        </div>
                      </CTableDataCell>

                      <CTableDataCell>
                        {moment(item?.created_at).format('DD-MM-YYYY, hh:mm:ss A')}
                      </CTableDataCell>

                      <CTableDataCell>
                        {moment(item?.updated_at).format('DD-MM-YYYY, hh:mm:ss A')}
                      </CTableDataCell>

                      <CTableDataCell>
                        <div className="d-flex align-items-center gap-1">
                          <CButton
                            size="sm"
                            onClick={() => handleEditClick(item.theory_id)}
                            className="button-action mr-2 bg-info"
                          >
                            <CIcon icon={cilColorBorder} className="text-white" />
                          </CButton>
                          <CButton
                            size="sm"
                            onClick={() => {
                              setVisible(true)
                              setDeletedId(item?.theory_id)
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
            pageCount={Math.ceil(lessonPagination.total / lessonPagination.per_page)}
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

export default LessonList
