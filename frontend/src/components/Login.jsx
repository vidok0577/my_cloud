import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../store/slices/authSlice';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { UserOutlined, LockOutlined, } from '@ant-design/icons';
import AuthLayout from '../layouts/AuthLayout';

const { Title, Text } = Typography;

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      await dispatch(login(values)).unwrap();
      navigate('/files');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Card className="login-card">
        <Title level={3} className="login-title">Вход в MyCloud</Title>
        <Text type="secondary">Введите свои учетные данные для доступа к хранилищу</Text>
        
        {error && (
          <Alert
            message={error.detail || 'Ошибка авторизации'}
            type="error"
            showIcon
            closable
            style={{ margin: '16px 0' }}
          />
        )}

        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: 'Пожалуйста, введите ваш логин' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9]{3,19}$/,
                message: 'Логин должен начинаться с буквы, содержать только латинские буквы и цифры, и быть длиной 4-20 символов'
              }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Логин"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Пожалуйста, введите ваш пароль' },
              { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoading || status === 'loading'}
              icon={<UserOutlined />}
            >
              Войти
            </Button>
          </Form.Item>

          <div className="login-links">
            <Text>Нет аккаунта? <Link to="/register">Создать аккаунт</Link></Text>
          </div>
        </Form>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
