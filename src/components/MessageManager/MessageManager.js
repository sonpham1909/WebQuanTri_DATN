import React, { useEffect, useState } from 'react';
import { Input, Button, List, Avatar, message, Row, Col, Upload, Alert } from 'antd';
import { SearchOutlined, UploadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { getAllUsers } from '../../services/UserService';
import { getAllMessages, updateMessage } from '../../services/MessageServices';
import { getRepliesByMessageId, createReply } from '../../services/ReplyServices';
import moment from 'moment';
import './index.css';

import { io } from 'socket.io-client';

const MessageManager = () => {
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [replies, setReplies] = useState({});
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [newReply, setNewReply] = useState('');
    const [newReplyImage, setNewReplyImage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [repliedUsers, setRepliedUsers] = useState(new Set());
    const [messagesReceived, setMessagesReceived] = useState([]);

   
    useEffect(() => {
        fetchUsersAndMessages();
    }, []);
    const socket = io('http://localhost:3000'); // Địa chỉ server của bạn

    useEffect(() => {
        // Đăng ký admin
        socket.emit('registerAdmin');

        // Lắng nghe tin nhắn từ người dùng
        socket.on('sendMessageToAdmins', (data) => {
            setMessages(oldMessages => [...oldMessages, data]);
            console.log('Tin nhắn mới: ', data);
            alert('Tin nhắn mới: ' + data.content);
        });

        // Ngắt lắng nghe sự kiện khi component unmount
        return () => {
            socket.off('sendMessageToAdmins');
            
        };
    }, [socket]); // Thêm socket vào dependency array

    //Nhận message
    

    const fetchUsersAndMessages = async () => {
        setLoadingUsers(true);
        setLoadingMessages(true);
        try {
            const [allUsers, allMessages] = await Promise.all([getAllUsers(), getAllMessages()]);
            const uniqueMessages = filterDuplicateMessages(allMessages);
            const usersWithMessages = getUsersWithMessages(allUsers, uniqueMessages);
            setUsers(usersWithMessages);
            setMessages(uniqueMessages);
            await fetchRepliesForMessages(uniqueMessages);
        } catch (error) {
            message.error('Không thể tải người dùng hoặc tin nhắn');
            console.error('Lỗi khi lấy người dùng hoặc tin nhắn:', error);
        } finally {
            setLoadingUsers(false);
            setLoadingMessages(false);
        }
    };

    const filterDuplicateMessages = (messages) => {
        const seen = new Set();
        return messages.filter(message => {
            const key = `${message.user_id}-${message.content}-${message.createdAt}`;
            if (seen.has(key)) {
                return false; // Duplicate found
            }
            seen.add(key);
            return true; // Unique message
        });
    };

    const getUsersWithMessages = (allUsers, uniqueMessages) => {
        const userIdsWithMessages = [...new Set(uniqueMessages.map(message => message.user_id))];
        const usersWithMessages = allUsers.filter(user => userIdsWithMessages.includes(user._id));

        const latestMessagesMap = {};
        uniqueMessages.forEach(message => {
            if (!latestMessagesMap[message.user_id] || new Date(message.createdAt) > new Date(latestMessagesMap[message.user_id].createdAt)) {
                latestMessagesMap[message.user_id] = message;
            }
        });

        return usersWithMessages.map(user => {
            const latestMessage = latestMessagesMap[user._id];
            const hasUnreadMessages = latestMessage && !latestMessage.status;
            return { ...user, hasUnreadMessages, latestMessageDate: latestMessage ? new Date(latestMessage.createdAt) : null };
        }).filter(user => user.latestMessageDate !== null)
          .sort((a, b) => b.latestMessageDate - a.latestMessageDate);
    };

    const fetchRepliesForMessages = async (messages) => {
        try {
            const repliesMap = {};
            await Promise.all(messages.map(async (message) => {
                const messageReplies = await getRepliesByMessageId(message._id);
                repliesMap[message._id] = messageReplies.map(reply => ({
                    ...reply,
                    isRecalled: reply.isRecalled || false
                }));
            }));
            setReplies(repliesMap);
        } catch (error) {
            message.error('Không thể tải phản hồi');
            console.error('Lỗi khi lấy phản hồi:', error);
        }
    };
    const handleUserClick = async (user_id) => {
        setSelectedUserId(user_id);
        try {
            const userMessages = messages.filter(message => message.user_id === user_id);
            
            if (userMessages.length === 0) {
                console.log('Người dùng chưa gửi tin nhắn nào.');
                return; // Không có tin nhắn để cập nhật
            }
    
            const latestMessage = userMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    
            if (!latestMessage) {
                message.error('Không tìm thấy tin nhắn để cập nhật');
                return;
            }
    
            // Cập nhật trạng thái cho tất cả tin nhắn
            await updateMessage(latestMessage._id, { status: true });
            fetchUsersAndMessages();
    
            // Gửi phản hồi tự động chỉ nếu đây là tin nhắn đầu tiên
            if (userMessages.length === 1 && !repliedUsers.has(latestMessage._id)) {
                await sendAutomaticReply(user_id);
                setRepliedUsers(prev => new Set(prev).add(latestMessage._id)); // Đánh dấu tin nhắn đã được phản hồi
            }
        } catch (error) {
            message.error('Không thể cập nhật trạng thái tin nhắn');
            console.error('Lỗi khi cập nhật trạng thái tin nhắn:', error);
        }
    };
    const sendAutomaticReply = async (user_id) => {
        const content = "Chào bạn, chúng tôi có thể giúp gì cho bạn?";
        const userMessages = messages.filter(message => message.user_id === user_id);
    
        // Chỉ gửi phản hồi tự động cho tin nhắn đầu tiên
        if (userMessages.length > 1) {
            console.log('Người dùng đã gửi nhiều tin nhắn, không gửi phản hồi tự động.');
            return; // Không gửi phản hồi nếu không phải là tin nhắn đầu tiên
        }
    
        const latestMessage = userMessages[0]; // Lấy tin nhắn đầu tiên
    
        if (!latestMessage) {
            message.error('Không tìm thấy tin nhắn để phản hồi');
            return;
        }
    
        // Kiểm tra xem phản hồi tự động đã được gửi chưa
        const existingReplies = replies[latestMessage._id] || [];
        const hasSentAutomaticReply = existingReplies.some(reply => reply.content === content);
    
        if (hasSentAutomaticReply) {
            console.log('Đã gửi phản hồi tự động trước đó, không gửi lại.');
            return; // Không gửi lại phản hồi
        }
    
        try {
            const formData = new FormData();
            formData.append('content', content);
            formData.append('user_id', user_id);
            formData.append('message_id', latestMessage._id);
    
            await createReply(formData);
            message.success('Phản hồi tự động đã được gửi');
        } catch (error) {
            message.error('Không thể gửi phản hồi tự động');
            console.error('Lỗi khi gửi phản hồi tự động:', error);
        }
    };
    const handleReplySubmit = async () => {
        if ((!newReply.trim() && !newReplyImage) || !selectedUserId) {
            message.error('Vui lòng đảm bảo tất cả các trường bắt buộc đã được điền');
            return;
        }

        const latestMessage = messages
            .filter(message => message.user_id === selectedUserId)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];

        if (!latestMessage) {
            message.error('Không tìm thấy tin nhắn để phản hồi');
            return;
        }

        try {
            const formData = new FormData();
            if (newReply.trim()) {
                formData.append('content', newReply.trim());
            }
            if (newReplyImage) {
                formData.append('imageUrls', newReplyImage);
            }
            formData.append('user_id', selectedUserId);
            formData.append('message_id', latestMessage._id);

            await createReply(formData);
            setNewReply('');
            setNewReplyImage(null);
            fetchUsersAndMessages();
            message.success('Đã gửi');
        } catch (error) {
            message.error('Không thể tạo phản hồi');
            console.error('Lỗi khi tạo phản hồi:', error);
        }
    };

    const handleImageUpload = (file) => {
        if (file && file instanceof File) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewReplyImage(file);
            };
            reader.readAsDataURL(file);
        }
        return false;
    };

    const handleRemoveImage = () => {
        setNewReplyImage(null);
    };

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>Quản lý Tin nhắn</h2>
            <Row gutter={16}>
                <Col span={8}>
                    <Input
                        placeholder="Tìm kiếm người dùng"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        prefix={<SearchOutlined />}
                        style={{ marginBottom: '20px', width: '100%', borderRadius: '5px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}
                    />
                    {loadingUsers ? (
                        <p style={{ textAlign: 'center', color: '#888' }}>Đang tải người dùng...</p>
                    ) : (
                        <List
                            itemLayout="horizontal"
                            dataSource={filteredUsers}
                            renderItem={user => (
                                <List.Item
                                    onClick={() => handleUserClick(user._id)}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        transition: 'background 0.3s',
                                        backgroundColor: selectedUserId === user._id ? '#FFFF66' : 'white',
                                        marginBottom: '10px',
                                        boxShadow: selectedUserId === user._id ? '0 0 5px rgba(0, 0, 0, 0.1)' : 'none',
                                        animation: user.hasUnreadMessages ? 'blink 1s infinite' : 'none'
                                    }}
                                >
                                    <List.Item.Meta
                                        avatar={<Avatar src={user.avatar} />}
                                        title={<span style={{ color: '#1890ff', fontWeight: '500' }}>{user.full_name}</span>}
                                    />
                                </List.Item>
                            )}
                        />
                    )}
                </Col>

                <Col span={16}>
                    {selectedUserId && (
                        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
                            <h3 style={{ textAlign: 'center', color: '#333', marginBottom: '20px' }}>
                                Tin nhắn từ {users.find(user => user._id === selectedUserId)?.full_name || 'Người dùng không xác định'}
                            </h3>
                            <div style={{
                                height: '380px',
                                overflowY: 'auto',
                                border: '1px solid #ddd',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '10px',
                                background: '#fafafa'
                            }}>
                                {loadingMessages ? (
                                    <p style={{ textAlign: 'center', color: '#888' }}>Đang tải tin nhắn...</p>
                                ) : (
                                    messages
                                        .filter(message => message.user_id === selectedUserId)
                                        .map((item) => (
                                            <div key={item._id} style={{ marginBottom: '20px' }}>
                                                <div style={{
                                                    display: 'flex',
                                                    justifyContent: 'flex-start',
                                                    marginBottom: '10px'
                                                }}>
                                                    <div style={{
                                                        padding: '15px',
                                                        borderRadius: '8px',
                                                        background: '#f0f0f0',
                                                        maxWidth: '70%',
                                                        textAlign: 'left'
                                                    }}>
                                                        <strong style={{ color: '#333' }}>{item.user_name}</strong>
                                                        <p style={{ margin: '5px 0', color: '#555' }}>{item.content === 'Tin nhắn đã thu hồi' ? 'Tin nhắn đã thu hồi' : item.content}</p>
                                                        {item.img && (
                                                            <img
                                                                src={item.img}
                                                                style={{
                                                                    maxWidth: '150px',
                                                                    borderRadius: '8px',
                                                                    marginTop: '10px'
                                                                }}
                                                            />
                                                        )}
                                                        <small style={{ color: '#999', display: 'block', marginTop: '10px' }}>{moment(item.createdAt).format('HH:mm:ss')}</small>
                                                    </div>
                                                </div>

                                                {replies[item._id] && replies[item._id].length > 0 && (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                                        {replies[item._id].map(reply => (
                                                            <div key={reply._id} style={{
                                                                padding: '15px',
                                                                borderRadius: '8px',
                                                                background: reply.isRecalled ? '#ffcccc' : '#e6f7ff',
                                                                maxWidth: '70%',
                                                                textAlign: 'left',
                                                                marginBottom: '10px'
                                                            }}>
                                                                <strong style={{ color: '#333' }}>Cửa hàng StyleLife:</strong>
                                                                <p style={{ margin: '5px 0', color: reply.isRecalled ? '#d32f2f' : '#555' }}>{reply.isRecalled ? 'Phản hồi này đã được thu hồi' : reply.content}</p>
                                                                {reply.img && (
                                                                    <img
                                                                        src={reply.img}
                                                                        style={{
                                                                            maxWidth: '150px',
                                                                            borderRadius: '8px',
                                                                            marginTop: '10px'
                                                                        }}
                                                                    />
                                                                )}
                                                                <small style={{ color: '#999', display: 'block', marginTop: '10px' }}>{moment(reply.createdAt).format('HH:mm:ss')}</small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                )}
                            </div>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                position: 'fixed',
                                bottom: '20px',
                                width: '50%',
                                background: '#fff',
                                padding: '10px',
                                boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
                                zIndex: 10,
                                borderRadius: '8px',
                                gap: '10px'
                            }}>
                                <Input
                                    value={newReply}
                                    onChange={e => setNewReply(e.target.value)}
                                    placeholder="Nhập phản hồi của bạn"
                                    style={{ flex: 1, borderRadius: '5px', padding: '8px 12px' }}
                                />
                                {newReplyImage && (
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <img
                                            src={URL.createObjectURL(newReplyImage)}
                                            alt="xem trước"
                                            style={{
                                                maxWidth: '50px',
                                                borderRadius: '5px',
                                                marginRight: '5px'
                                            }}
                                        />
                                        <Button
                                            icon={<CloseCircleOutlined />}
                                            onClick={handleRemoveImage}
                                            type="text"
                                            danger
                                        >
                                            Xóa
                                        </Button>
                                    </div>
                                )}
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={handleImageUpload}
                                >
                                    <Button icon={<UploadOutlined />} style={{ borderRadius: '5px' }} />
                                </Upload>
                                <Button
                                    type="primary"
                                    onClick={handleReplySubmit}
                                    style={{ borderRadius: '5px' }}
                                >
                                    Gửi
                                </Button>
                            </div>
                        </div>
                    )}
                </Col>
            </Row>
        </div>
    );
};

export default MessageManager;