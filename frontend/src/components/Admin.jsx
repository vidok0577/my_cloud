import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, deleteUser, updateUser } from '../store/slices/adminSlice';
import { Table, Button, Space, message, Popconfirm, Switch } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { formatStorage } from '../api/utils';

const AdminPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { users, status, error } = useSelector(state => state.admin);
  
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (userId) => {
    dispatch(deleteUser(userId))
      .then(() => message.success('Пользователь удален'))
      .catch(() => message.error('Ошибка при удалении пользователя'));
  };

  const handleToggleAdmin = (userId, currentStatus) => {
    dispatch(updateUser({ userId, isAdmin: !currentStatus }))
      .then(() => message.success('Права обновлены'))
      .catch(() => message.error('Ошибка при обновлении прав'));
  };

  const handleShowFiles = (userId) => {
    navigate(`/admin/user-files/${userId}`);
  };

  const columns = [
    {
      title: 'Логин',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Имя',
      dataIndex: 'first_name',
      key: 'first_name',
      render: (text) => text || '-',
    },
    {
      title: 'Фамилия',
      dataIndex: 'last_name',
      key: 'last_name',
      render: (text) => text || '-',
    },
    {
        title: 'Кл-во файлов',
        key: 'files_count',
        render: (_, user) => (
            <span>{user.files_count || 0}</span>
        ),
    },
    {
        title: 'Размер',
        key: 'total_file_size',
        render: (_, user) => (
            <span>
                {user.total_file_size 
                    ? `${formatStorage(user.total_file_size)}`
                    : '0 MB'}
            </span>
        ),
    },
    {
      title: 'Админ',
      key: 'is_admin',
      render: (_, user) => (
        <Switch
          checked={user.is_staff}
          onChange={() => handleToggleAdmin(user.id, user.is_staff)}
        />
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: '15%',
      fixed: 'right',
      render: (_, user) => (
        <Space size="middle">
          <Button 
            type="primary" 
            onClick={() => handleShowFiles(user.id)}
          >
            Файлы
          </Button>
          <Popconfirm
            title="Удалить пользователя?"
            onConfirm={() => handleDelete(user.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <h1>Администрирование</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id"
        loading={status === 'loading'}
      />
    </div>
  );
};

export default AdminPage;
