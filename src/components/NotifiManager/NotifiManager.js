import React, { useState } from 'react';
import { Button, Modal, Form, Input, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { pushNotification } from '../../services/NotificationServices';

export default function NotifiManager() {
  const [isVisitablePushNoti, setIsVisitablePushNoti] = useState(false);
  const [form] = Form.useForm();

  const handleClickPush = () => {
    setIsVisitablePushNoti(true);
  };

  const handleClickClose = () => {
    setIsVisitablePushNoti(false);
    form.resetFields(); // Reset form khi đóng modal
  };

  const handleSubmit = (values) => {
    console.log('Form data:', values);
    // Gửi dữ liệu đến server hoặc xử lý thêm
    setIsVisitablePushNoti(false);
    form.resetFields();
  };

  const handlePushNotification = async()=>{

   try {
    const values = form.getFieldsValue(); // Lấy dữ liệu từ form

    // Chuẩn bị FormData
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('message', values.message);
    formData.append('link', values.link || '');

    // Xử lý file upload từ Ant Design
    if (values.imageUrls && values.imageUrls.length > 0) {
      values.imageUrls.forEach((file) => {
        formData.append('imageUrls', file.originFileObj); // originFileObj chứa file gốc
      });
    }

    await pushNotification(formData);
    message.success('Gửi thông báo cho người dùng thành công');
    form.resetFields();
    setIsVisitablePushNoti(false);
   } catch (error) {
    message.error('Gửi thông báo thất bại');
    
   }


    


  }

  return (
    <div>
      <h1>Quản lý thông báo</h1>
      <Button type="primary" onClick={handleClickPush}
      >
        Đẩy thông báo cho người dùng
      </Button>

      <Modal
        title="Đẩy thông báo"
        visible={isVisitablePushNoti}
        footer={null}
        onCancel={handleClickClose}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Tiêu đề"
            name="title"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Nhập tiêu đề thông báo" />
          </Form.Item>

          <Form.Item
            label="Nội dung"
            name="message"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <Input.TextArea rows={4} placeholder="Nhập nội dung thông báo" />
          </Form.Item>

          <Form.Item
            label="Ảnh"
            name="imageUrls"
            valuePropName="fileList"
            getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            rules={[{ required: true, message: 'Vui lòng tải lên ảnh!' }]}
          >
            <Upload
              name="image"
              listType="picture"
              beforeUpload={() => false} // Không tự upload ngay
            >
              <Button icon={<UploadOutlined />}>Tải lên ảnh</Button>
            </Upload>
          </Form.Item>

          <Form.Item
            label="Liên kết"
            name="link"
            rules={[{ type: 'url', message: 'Vui lòng nhập URL hợp lệ!' }]}
          >
            <Input placeholder="Nhập URL liên kết (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}
            onClick={handlePushNotification}>
              Gửi thông báo
            </Button>
            <Button onClick={handleClickClose}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
