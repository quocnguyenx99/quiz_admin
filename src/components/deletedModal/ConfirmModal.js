import React from 'react'
import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilGift } from '@coreui/icons'

import '../css/deletedModal.css'

const ConfirmModal = ({ onDelete, visible, setVisible }) => {
  const handleConfirmDelete = () => {
    onDelete()
    setVisible(false)
  }
  return (
    <>
      <CModal
        visible={visible}
        onClose={() => setVisible(false)}
        aria-labelledby="LiveDemoExampleLabel"
        className="confirm-modal__dialog"
      >
        <CModalHeader className="confirm-modal__header" onClose={() => setVisible(false)}>
          <CModalTitle id="LiveDemoExampleLabel">
            <div className="d-flex align-items-center " style={{ columnGap: 4 }}>
              <CIcon icon={cilGift} className="text-success" size="xl" />
              <span>XÁC NHẬN ĐÃ GỬI QUÀ</span>
            </div>
          </CModalTitle>
        </CModalHeader>
        <CModalBody className="confirm-modal__body">
          <p>
            Trạng thái xác nhận đã gửi quà sẽ được cập nhật và không thể chỉnh sửa. Bạn chắc chứ?
          </p>
        </CModalBody>
        <CModalFooter className="confirm-modal__footer">
          <CButton style={{ color: 'white' }} color="secondary" onClick={() => setVisible(false)}>
            Hủy
          </CButton>
          <CButton style={{ color: 'white' }} onClick={handleConfirmDelete} color="danger">
            Xác nhận
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}
export default ConfirmModal
