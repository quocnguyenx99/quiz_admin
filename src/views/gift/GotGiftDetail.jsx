import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableBody,
  CTableRow,
  CTableHeaderCell,
  CFormInput,
  CFormLabel,
  CForm,
  CContainer,
  CTableDataCell,
  CFormSelect,
  CImage,
  CButton,
} from '@coreui/react'
import { axiosClient, imageBaseUrl } from '../../axiosConfig'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const GiftHistory = () => {
  const location = useLocation()

  const params = new URLSearchParams(location.search)
  const id = params.get('id')

  const [dataRewardDetail, setDataRewardDetail] = useState([])

  const [giftStatus, setGiftStatus] = useState()

  const fetchDataReward = async () => {
    try {
      const response = await axiosClient.get(`/detail-gift-history/${id}`)
      if (response.data && response.data.status === true) {
        setDataRewardDetail(response.data.data)
        setGiftStatus(response.data.data?.is_confirmed)
      }
    } catch (error) {
      console.error('Fetch data reward detail error', error.message)
    }
  }

  useEffect(() => {
    fetchDataReward()
  }, [])

  const handleConfirm = async (confirmId) => {
    try {
      const response = await axiosClient.post(`/gifts/${confirmId}/confirm`, {
        _method: 'PATCH',
      })
      if (response.data.status === true) {
        fetchDataReward()
        toast.success('Đã cập nhật trạng thái quà tặng')
      }
    } catch (error) {
      console.error('Confirm gift info id error', error)
      toast.error('Đã xảy ra lỗi khi xóa. Vui lòng thử lại!')
    }
  }

  return (
    <CContainer>
      <CRow className="my-3">
        <CCol>
          <h3>CHI TIẾT NHẬN QUÀ</h3>
        </CCol>

        <CCol md={6}>
          <div className="d-flex justify-content-end">
            <Link to={'/gifts/reward-history'}>
              <CButton color="primary" type="submit" size="sm">
                Danh sách
              </CButton>
            </Link>
          </div>
        </CCol>
      </CRow>
      <CRow>
        {/* Thông tin Người Nhận */}
        <CCol md={6}>
          <CCard>
            <CCardHeader className="bg-primary text-white">Thông tin người nhận quà</CCardHeader>
            <CCardBody>
              <CForm>
                <CFormLabel>Họ tên</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail?.member?.full_name} disabled />

                <CFormLabel className="mt-2">Điện thoại</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail?.member?.phone} disabled />

                <CFormLabel className="mt-2">Email</CFormLabel>
                <CFormInput type="email" value={dataRewardDetail?.member?.email} disabled />

                <CFormLabel className="mt-2">Công ty</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail?.member?.nameCompany} disabled />

                <CFormLabel className="mt-2">Mã số thuế</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail?.member?.tax} disabled />
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Thông tin Giao Quà */}
        <CCol md={6}>
          <CCard>
            <CCardHeader className="bg-primary text-white">Thông tin giao quà</CCardHeader>
            <CCardBody>
              <CForm>
                <CFormLabel>Tên</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail?.member?.full_name} disabled />

                <CFormLabel className="mt-2">Điện thoại</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail.numberPhone} disabled />

                <CFormLabel className="mt-2">Địa chỉ</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail.streetAddress} disabled />

                <CFormLabel className="mt-2">Phường/Xã </CFormLabel>
                <CFormInput type="text" value={dataRewardDetail.wardAddress} disabled />

                <CFormLabel className="mt-2">Quận/ Huyện</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail.districtAddress} disabled />

                <CFormLabel className="mt-2">Tỉnh/ Thành phố</CFormLabel>
                <CFormInput type="text" value={dataRewardDetail.cityAddress} disabled />

                <CFormLabel className="mt-2">Phương thức nhận quà</CFormLabel>
                <CFormInput type="text" value={'Giao quà tận nơi.'} disabled />
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Bảng Lịch Sử Nhận Quà */}
        <CCol md={12} className="mt-4">
          <CCard>
            <CCardHeader className="bg-primary text-white">Lịch sử nhận quà</CCardHeader>
            <CCardBody>
              <CTable striped hover responsive>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Hình ảnh</CTableHeaderCell>
                    <CTableHeaderCell>Tên quà tặng</CTableHeaderCell>
                    <CTableHeaderCell>Số lượng</CTableHeaderCell>
                    <CTableHeaderCell>Thời gian đổi quà</CTableHeaderCell>
                    <CTableHeaderCell>Trạng thái</CTableHeaderCell>
                    <CTableHeaderCell>Tác vụ</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  <CTableRow>
                    <CTableDataCell>
                      <CImage
                        src={`${imageBaseUrl}/uploads/${dataRewardDetail?.gift?.picture}`}
                        alt={dataRewardDetail?.gift?.title}
                        width={150}
                      />
                    </CTableDataCell>
                    <CTableDataCell>{dataRewardDetail?.gift?.title}</CTableDataCell>
                    <CTableDataCell>{dataRewardDetail.gift?.quantity}</CTableDataCell>
                    <CTableDataCell>{dataRewardDetail?.confirm_at}</CTableDataCell>
                    <CTableDataCell>
                      <CFormSelect
                        value={giftStatus}
                        onChange={(e) => setGiftStatus(e.target.value)}
                        options={[
                          { label: 'Đang chờ xử lý', value: 'Chờ xác nhận' },
                          { label: 'Đã gửi quà', value: 'Đã xác nhận' },
                        ]}
                      ></CFormSelect>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        size="sm"
                        color="primary"
                        type="button"
                        onClick={() => handleConfirm(dataRewardDetail?.id)}
                      >
                        Cập nhật
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CContainer>
  )
}

export default GiftHistory
