import { Button, Modal } from 'antd'
import React from 'react'
import './delform.css'

export default function FormDel({isVisible,onclickDel,onclickCan,id}) {
  return (
    <div>
    <Modal
    visible={isVisible}
    footer={null}
    closable={false}
   
    style={{ maxHeight: '300px', overflowY: 'auto' }} // Giới hạn chiều cao và thêm cuộn
>
        <h3 className='title'>
            Bạn có chắc chắn muốn xóa?
        </h3>

        <div className='contaiButton'>
        <Button className='button_yes' onClick={onclickDel}>Vâng</Button>
        <Button className='button_no' onClick={onclickCan}>Hủy</Button>
        </div>

      </Modal>
    </div>
  )
}
