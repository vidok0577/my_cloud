import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminFiles } from '../store/slices/filesSlice';
import { deleteFile, downloadFile } from '../store/slices/filesSlice';
import { formatDate, formatStorage } from '../api/utils';
import { Table, Button, Space, Typography, Popconfirm, message } from 'antd';
import { FileOutlined, ArrowLeftOutlined, DeleteOutlined } from '@ant-design/icons';


const { Text } = Typography;

const UserFilesPage = () => {
  const { userId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { files, status } = useSelector(state => state.files);

  useEffect(() => {
    dispatch(fetchAdminFiles(userId));
  }, [dispatch, userId]);

    const handleDelete = async (fileId) => {
    try {
      await dispatch(deleteFile(fileId, true)).unwrap();
      message.success('Файл успешно удален');
      dispatch(fetchAdminFiles(userId));
    } catch (err) {
      message.error('Ошибка при удалении файла');
      console.error(err);
    }
  };

  const handleDownload = async (fileId) => {
      try {
        await dispatch(downloadFile(fileId)).unwrap();
        message.success('Начато скачивание файла');
      } catch (error) {
        message.error('Ошибка при скачивании файла', error);
      }
    };

  const columns = [
    {
      title: 'Имя файла',
      dataIndex: 'original_name',
      key: 'original_name',
      render: (text, record) => (
        <div>
        <Space>
          <FileOutlined style={{ color: '#52c41a' }} />
          <a onClick={() => handleDownload(record.id)}>{text}</a>
        </Space>
        <div 
          style={{ 
            fontSize: '12px',
            color: record.comment ? 'inherit' : '#bfbfbf',
            marginTop: '4px'
          }}
        >
          Комментарий: {record.comment || 'нет комментария'}
        </div>
      </div>
      ),
    },
    {
      title: 'Размер',
      dataIndex: 'size',
      key: 'size',
      render: (size) => (
        <Text type="secondary">
          {formatStorage(size)}
        </Text>
      ),
    },
    {
      title: 'Дата загрузки',
      dataIndex: 'upload_date',
      key: 'upload_date',
      render: (date) => date ? formatDate(date) : '-',
    },
    {
      title: 'Дата последней загрузки',
      dataIndex: 'last_download',
      key: 'last_download',
      render: (date) => date ? formatDate(date) : '-',
    },
        {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
          <Popconfirm
            title="Вы уверены, что хотите удалить этот файл?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Отмена"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              type="text"
            />
          </Popconfirm>
      ),
    },
  ];

  return (
    <div className="user-files-page">
      <Button 
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        Назад к списку пользователей
      </Button>
      
      <Table
        columns={columns}
        dataSource={files}
        rowKey="id"
        loading={status === 'loading'}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: 'Нет файлов' }}
      />
    </div>
  );
};

export default UserFilesPage;
