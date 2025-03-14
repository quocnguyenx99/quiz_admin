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

function ProductsList() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [dataProduct, setDataProduct] = useState([])

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

  const fetchDataProduct = async () => {
    try {
      setIsLoading(true)
      const response = await axiosClient.get(`/admin/product?page=${pageNumber}&data=${dataSearch}`)
      if (response.data.status === true) {
        setDataProduct(response.data.data)
      }
    } catch (error) {
      console.error('Fetch data product list error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDataProduct()
  }, [pageNumber, debouncedSearchTerm])

  // handle toggle filter table
  const handleToggleCollapse = () => {
    setIsCollapse((prevState) => !prevState)
  }

  const handleSearch = (keyword) => {
    fetchDataProduct(keyword)
  }

  const handleEditClick = (id) => {
    navigate(`/products/edit?id=${id}`)
  }

  // delete row
  const handleDelete = async () => {
    setVisible(true)
    try {
      const response = await axiosClient.delete(`/admin/product/${deletedId}`)
      if (response.data.status === true) {
        setVisible(false)
        fetchDataProduct()
      }
    } catch (error) {
      console.error('Delete product id error', error)
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
          <h2>DANH SÁCH SẢN PHẨM</h2>
        </CCol>
        <CCol>
          <div className="d-flex justify-content-end gap-2">
            <Link to={`/products/add`}>
              <CButton color="primary" type="submit" size="sm">
                Thêm mới
              </CButton>
            </Link>
            <Link to={`/products/productsList`}>
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
                  <td className="total-count">{dataProduct?.total}</td>
                </tr>

                <tr>
                  <td>Tìm kiếm</td>
                  <td>
                    <strong>Tìm kiếm từ khóa theo TIÊU ĐỀ SẢN PHẨM</strong>
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
                          const allIds = dataProduct?.map((item) => item.id) || []
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
                    Tiêu đề
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('category.name')}
                    style={{ cursor: 'pointer' }}
                  >
                    Hình ảnh
                  </CTableHeaderCell>

                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('updateTime')}
                    style={{ cursor: 'pointer' }}
                  >
                    Create Time
                  </CTableHeaderCell>
                  <CTableHeaderCell
                    scope="col"
                    onClick={() => handleSort('updateTime')}
                    style={{ cursor: 'pointer' }}
                  >
                    Update Time
                  </CTableHeaderCell>
                  <CTableHeaderCell scope="col">Tác vụ</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {dataProduct?.data &&
                  dataProduct?.data?.length > 0 &&
                  dataProduct?.data?.map((item, index) => (
                    <CTableRow key={item.product_id}>
                      <CTableHeaderCell scope="row">
                        <CFormCheck
                          key={item?.product_id}
                          aria-label="Default select example"
                          defaultChecked={item?.product_id}
                          id={`flexCheckDefault_${item?.product_id}`}
                          value={item?.product_id}
                          checked={selectedUnDealCheckbox.includes(item?.product_id)}
                          onChange={(e) => {
                            const undealId = item?.product_id
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
                        <Link to={`/products/edit?id=${item?.product_id}`}>
                          <div className="blue-txt">{item.title}</div>
                        </Link>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CImage
                          src={`${imageBaseUrl}/uploads/${item.picture}`}
                          width={120}
                          alt={`Ảnh ${item.product_id}`}
                        />
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
                            onClick={() => handleEditClick(item.product_id)}
                            className="button-action mr-2 bg-info"
                          >
                            <CIcon icon={cilColorBorder} className="text-white" />
                          </CButton>
                          <CButton
                            size="sm"
                            onClick={() => {
                              setVisible(true)
                              setDeletedId(item?.product_id)
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
            pageCount={Math.ceil(dataProduct?.total / dataProduct?.per_page)}
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

export default ProductsList
