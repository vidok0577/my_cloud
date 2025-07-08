import { Button, message, Modal, Input, Space, Tooltip, Typography } from 'antd';
import { ShareAltOutlined, CopyOutlined, LinkOutlined } from '@ant-design/icons';
import '@ant-design/v5-patch-for-react-19';
import { useState } from 'react';
import apiClient from '../api/client';
import { formatDate } from '../api/utils';
import '../css/share.css';

const { Text } = Typography;

const ShareButton = ({ fileId, apiUrl = '/api/files' }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [lastDownload, setLastDownload] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateShareLink = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get(`${apiUrl}/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      const shareToken = response.data.share_link;
      setLastDownload(response.data.last_download);

      const fullShareUrl = `${window.location.origin}/share/${shareToken}/`;
      
      setShareLink(fullShareUrl);
      
    } catch (error) {
      console.error('Ошибка при получении ссылки:', error);
      if (error.response?.status === 403) {
        message.error('У вас нет прав на доступ к этому файлу');
      } else if (error.response?.status === 404) {
        message.error('Файл не найден');
      } else {
        message.error('Ошибка при генерации ссылки');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = () => {
    setIsModalVisible(true);
    if (!shareLink) {
      generateShareLink();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    message.success('Ссылка скопирована в буфер обмена!');
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  return (
    <>
      <Tooltip title="Поделиться">
        <Button 
          icon={<ShareAltOutlined />} 
          onClick={handleShareClick}
          loading={isLoading}
          className="share-button"
        />
      </Tooltip>
      
      <Modal 
        title={
          <Space>
            <LinkOutlined />
            <span>Поделиться файлом</span>
          </Space>
        } 
        open={isModalVisible} 
        onCancel={handleModalClose}
        footer={null}
        className="share-modal"
      >
        <div className="share-content">
          <Text type="secondary" className="share-description">
            Отправьте эту ссылку для предоставления доступа к файлу
          </Text>
          
          <Space.Compact block className="share-input-group">
            <Input 
              value={shareLink} 
              readOnly 
              placeholder={isLoading ? "Генерация ссылки..." : "Ошибка при генерации"}
              className="share-input"
            />
            <Tooltip title="Копировать">
              <Button 
                icon={<CopyOutlined />} 
                onClick={copyToClipboard}
                type="primary"
                className="copy-button"
              />
            </Tooltip>
          </Space.Compact>
            
          <div className="share-options">
            <strong>Дата последней загрузки: </strong>{
            lastDownload ?
              formatDate(lastDownload) :
              'не загружался'
            }
          </div>
          
          <div className="share-options">
            <Text strong>Характеристики доступа:</Text>
            <div className="options-list">
              <Text>• Только скачивание файла</Text>
              <Text>• Доступ по ссылке</Text>
              <Text>• Без ограничения по времени</Text>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ShareButton;
