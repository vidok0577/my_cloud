import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Upload, 
  Button, 
  Table, 
  Space, 
  Typography, 
  Input, 
  message,
  Popconfirm,
  Card,
  Modal,
  Form
} from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  DeleteOutlined, 
  FileOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { fetchFiles, uploadFile, deleteFile, downloadFile, updateFileComment } from '../store/slices/filesSlice';
import ShareButton from './ShareButton';
import { formatDate, formatStorage } from '../api/utils';
import '../css/files.css';

const { Title, Text } = Typography;
const { Dragger } = Upload;
const { TextArea } = Input;

const FilesManager = () => {
  const dispatch = useDispatch();
  const { files = [], status } = useSelector(state => state.files);
  const [searchText, setSearchText] = useState('');
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [comment, setComment] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState(null);
  const [editComment, setEditComment] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    dispatch(fetchFiles());
  }, [dispatch]);

  const handleUpload = async () => {
    if (!currentFile) {
      message.warning('Пожалуйста, выберите файл');
      return;
    }

    try {
      dispatch(uploadFile({ 
        file: currentFile, 
        comment 
      })).unwrap();
      
      message.success(`${currentFile.name} успешно загружен`);
      setUploadModalVisible(false);
      setComment('');
      setCurrentFile(null);
      dispatch(fetchFiles());
    } catch (error) {
        message.error(`Ошибка: ${error.message}`);
    }
  };

  const handleFileChange = (info) => {
    if (info.file.status === 'removed') {
        setCurrentFile(null);
        return;
    }
    
    setCurrentFile(info.file.originFileObj || info.file);
  };

  const handleDelete = async (fileId) => {
    try {
      await dispatch(deleteFile(fileId)).unwrap();
      message.success('Файл удален');
      dispatch(fetchFiles());
    } catch (error) {
      message.error('Ошибка при удалении файла', error);
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

  const handleEditComment = async () => {
    if (!editingFile) return;
    
    try {
      await dispatch(updateFileComment({ 
        fileId: editingFile.id, 
        comment: editComment 
      })).unwrap();
      
      message.success('Комментарий обновлен');
      setEditModalVisible(false);
      dispatch(fetchFiles());
    } catch (error) {
      message.error(error.message || 'Ошибка при обновлении комментария');
    }
  };

  const filteredFiles = files.filter(file => {
    if (!file || !file.original_name) return false;
    return file.original_name.toLowerCase().includes(searchText.toLowerCase());
  });

  const uploadProps = {
    beforeUpload: () => false,
    onChange: handleFileChange,
    fileList: currentFile ? [{
        uid: currentFile.uid || '-1',
        name: currentFile.name,
        status: 'done',
    }] : [],
    multiple: false,
    maxCount: 1,
  };

  const columns = [
  {
    title: 'Имя файла',
    dataIndex: 'original_name',
    key: 'original_name',
    width: '55%',
    render: (text, record) => (
      <div>
        <Space>
          <FileOutlined style={{ color: '#52c41a' }} />
          <a onClick={() => handleDownload(record.id)}>{text}</a>
        </Space>
        <div 
          onClick={() => {
            setEditingFile(record);
            setEditComment(record.comment || '');
            setEditModalVisible(true);
          }}
          style={{ 
            cursor: 'pointer',
            fontSize: '12px',
            color: record.comment ? 'inherit' : '#bfbfbf',
            marginTop: '4px'
          }}
        >
          Комментарий: {record.comment || 'добавить комментарий'}
        </div>
      </div>
    ),
    sorter: (a, b) => (a.original_name || '').localeCompare(b.original_name || ''),
  },
  {
    title: 'Размер',
    dataIndex: 'size',
    key: 'size',
    width: '15%',
    render: size => (
      <Text type="secondary">
        {formatStorage(size)}
      </Text>
    ),
    sorter: (a, b) => (a.size || 0) - (b.size || 0),
  },
  {
    title: 'Дата загрузки',
    dataIndex: 'upload_date',
    key: 'upload_date',
    width: '15%',
    render: date => formatDate(date),
    sorter: (a, b) => new Date(a.upload_date || 0) - new Date(b.upload_date || 0),
  },
  {
    title: 'Действия',
    key: 'actions',
    width: '15%',
    fixed: 'right',
    render: (_, record) => (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Space size="middle">
          <Button 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record.id)}
            title="Скачать"
          />
          <ShareButton 
            fileId={record.id} 
            apiUrl="/files"
          />
          <Popconfirm
            title="Вы уверены, что хотите удалить этот файл?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              title="Удалить"
            />
          </Popconfirm>
        </Space>
      </div>
    ),
  },
];

  return (
    <div className="files-page">
      <Title level={3}>Мои файлы</Title>
      
      <Card className="files-actions">
        <Space size="large">
          <Button 
            type="primary" 
            icon={<UploadOutlined />}
            onClick={() => setUploadModalVisible(true)}
            loading={status === 'loading' || status === 'uploading'}
          >
            Загрузить файл
          </Button>
          
          <Input
            placeholder="Поиск файлов..."
            name='search'
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>
      </Card>

      <Table
      columns={columns}
      dataSource={filteredFiles}
      rowKey="id"
      loading={status === 'loading'}
      pagination={{ pageSize: 10 }}
      locale={{ emptyText: 'Нет загруженных файлов' }}
      style={{ width: '100%' }}
    />

      {/* Модальное окно загрузки файла */}
      <Modal
        title="Загрузка файла"
        open={uploadModalVisible}
        onOk={handleUpload}
        onCancel={() => {
          setUploadModalVisible(false);
          setCurrentFile(null);
          setComment('');
        }}
        okText="Загрузить"
        cancelText="Отмена"
        confirmLoading={status === 'uploading'}
        afterClose={() => dispatch(fetchFiles())}
      >
        <Form layout="vertical">
          <Form.Item label="Файл" required>
            <Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Кликните или перетащите файл для загрузки</p>
              <p className="ant-upload-hint">
                Поддерживаются файлы
              </p>
            </Dragger>
          </Form.Item>
          <Form.Item label="Комментарий">
            <TextArea 
              rows={4} 
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Введите комментарий к файлу"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Модальное окно редактирования комментария */}
      <Modal
        title={
          <div className="modal-custom-title">
            Редактирование комментария для файла<br />
            <span className="filename">{editingFile?.original_name || ''}</span>
          </div>
        }
        open={editModalVisible}
        onOk={handleEditComment}
        onCancel={() => setEditModalVisible(false)}
        afterOpenChange={(opened) => {
          if (opened && textareaRef.current) {
            setTimeout(() => {
              textareaRef.current.focus();
            }, 50);
          }
        }}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Form layout="vertical">
          <Form.Item>
            <TextArea 
              ref={textareaRef}
              rows={4} 
              value={editComment}
              onChange={e => setEditComment(e.target.value)}
              placeholder="Введите комментарий к файлу"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FilesManager;
