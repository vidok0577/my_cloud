import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, Spin, message } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import apiClient, { downloadClient } from '../api/client';
import { formatDate, formatStorage } from '../api/utils';
import '../css/download.css';

const ShareDownloadPage = () => {
  const { shareLink } = useParams();
  const navigate = useNavigate();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const response = await apiClient.get(`/files/share/${shareLink}/info/`);
        setFileInfo(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Не удалось загрузить информацию о файле');
      } finally {
        setLoading(false);
      }
    };

    fetchFileInfo();
  }, [shareLink]);

  const handleDownload = async () => {
    try {
      const response = await downloadClient.get(`/files/share/${shareLink}/`);
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      const fileName = contentDisposition 
        ? contentDisposition.split('filename=')[1].replace(/"/g, '')
        : fileInfo?.original_name || 'file';
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      message.success('Файл начал скачиваться');
    } catch (err) {
      message.error(err.response?.data?.error || 'Ошибка при скачивании файла');
    }
  };

  if (loading) {
    return (
      <div className="download-container">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="download-container">
        <Card title="Ошибка">
          <p>{error}</p>
          <Button type="primary" onClick={() => navigate('/')}>
            На главную
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="download-container">
      <Card title="Скачать файл">
        <div className="file-info">
          <p><strong>Имя файла:</strong> {fileInfo.original_name}</p>
          <p><strong>Размер:</strong> {formatStorage(fileInfo.size)}</p>
          <p><strong>Файл загружен:</strong> {formatDate(fileInfo.upload_date)}</p>
          <p><strong>Дата последней загрузки: </strong>{
            fileInfo.last_download ?
              formatDate(fileInfo.last_download) :
              'не загружался'
            }</p>
          <p><strong>Комментарий к файлу: </strong>{fileInfo.comment || 'нет комментария'}</p>
        </div>
        
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={handleDownload}
          size="large"
        >
          Скачать файл
        </Button>
      </Card>
    </div>
  );
};

export default ShareDownloadPage;
