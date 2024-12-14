import React, { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, Upload, message, List } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { pushNotification, getAllNotifications } from '../../services/NotificationServices';

export default function NotifiManager() {
  const [isVisitablePushNoti, setIsVisitablePushNoti] = useState(false);
  const [form] = Form.useForm();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getAllNotifications();
      setNotifications(data);
    } catch (error) {
      message.error('Lấy thông báo thất bại');
    }
  };

  const handleClickPush = () => {
    setIsVisitablePushNoti(true);
  };

  const handleClickClose = () => {
    setIsVisitablePushNoti(false);
    form.resetFields();
  };

  const handlePushNotification = async () => {
    try {
      const values = form.getFieldsValue();
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('message', values.message);
      formData.append('link', values.link || '');

      if (values.imageUrls && values.imageUrls.length > 0) {
        values.imageUrls.forEach((file) => {
          formData.append('imageUrls', file.originFileObj);
        });
      }

      await pushNotification(formData);
      message.success('Gửi thông báo cho người dùng thành công');
      form.resetFields();
      setIsVisitablePushNoti(false);
      fetchNotifications(); // Refresh notifications after sending
    } catch (error) {
      message.error('Gửi thông báo thất bại');
    }
  };

  return (
    <div>
      <h1>Quản lý thông báo</h1>
      <Button type="primary" onClick={handleClickPush}>
        Đẩy thông báo cho người dùng
      </Button>

      <Modal
        title="Đẩy thông báo"
        visible={isVisitablePushNoti}
        footer={null}
        onCancel={handleClickClose}
      >
        <Form form={form} layout="vertical" onFinish={handlePushNotification}>
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
              beforeUpload={() => false}
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
            <Button type="primary" htmlType="submit" style={{ marginRight: '8px' }}>
              Gửi thông báo
            </Button>
            <Button onClick={handleClickClose}>Hủy</Button>
          </Form.Item>
        </Form>
      </Modal>

      <h2>Danh sách thông báo</h2>
      <List
        bordered
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {item.imgNotifi && (
                <img
                  src={item.imgNotifi}
                  alt="Notification"
                  style={{ width: 50, height: 50, marginRight: 16 }}
                />
              )}
              <div>
                <h3>Tiêu đề: {item.title}</h3>
                <p>Nội dung: {item.message}</p>
                <p>{new Date(item.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </List.Item>
        )}
      />
    </div>
  );
}