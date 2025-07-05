import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../store/slices/authSlice';
import { Form, Input, Button, Card, Typography, Alert } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import AuthLayout from '../layouts/AuthLayout';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector(state => state.auth);
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);

  const onFinish = async (values) => {
    setIsLoading(true);
    try {
      const registrationData = {
        username: values.username,
        email: values.email,
        first_name: values.first_name,
        last_name: values.last_name,
        password: values.password
      };

      await dispatch(register(registrationData)).unwrap();
      navigate('/files');
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = async (_, value) => {
    if (!value) {
      throw new Error('Пожалуйста, введите пароль');
    }
    if (value.length < 6) {
      throw new Error('Пароль должен содержать минимум 6 символов');
    }
    if (!/[A-Z]/.test(value)) {
      throw new Error('Пароль должен содержать хотя бы одну заглавную букву');
    }
    if (!/[0-9]/.test(value)) {
      throw new Error('Пароль должен содержать хотя бы одну цифру');
    }
    if (!/[!@#$%^&*]/.test(value)) {
      throw new Error('Пароль должен содержать хотя бы один спецсимвол');
    }
  };

  return (
    <AuthLayout>
      <Card className="register-card">
        <Title level={3} className="register-title">Создать аккаунт</Title>
        <Text type="secondary">Заполните форму для регистрации в MyCloud</Text>
        
        {error && (
          <Alert
            message={error.detail || Object.values(error).join(' ')}
            type="error"
            showIcon
            closable
            style={{ margin: '16px 0' }}
          />
        )}

        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ remember: true }}
          autoComplete="off"
        >
          <Form.Item
            name="username"
            label="Логин"
            rules={[
              { required: true, message: 'Пожалуйста, введите логин' },
              {
                pattern: /^[a-zA-Z][a-zA-Z0-9]{3,19}$/,
                message: 'Логин должен начинаться с буквы, содержать только латинские буквы и цифры, и быть длиной 4-20 символов'
              }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Придумайте логин"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Пожалуйста, введите email' },
              { type: 'email', message: 'Некорректный email' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Ваш email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="first_name"
            label="Имя"
          >
            <Input
              prefix={<SolutionOutlined />}
              placeholder="Ваше имя"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="Фамилия"
          >
            <Input
              prefix={<SolutionOutlined />}
              placeholder="Ваша фамилия"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Пожалуйста, введите пароль' },
              { validator: validatePassword }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Придумайте пароль"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password2"
            label="Подтверждение пароля"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Пожалуйста, подтвердите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject('Пароли не совпадают');
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Повторите пароль"
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
              icon={<SolutionOutlined />}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>

          <div className="register-links">
            <Text>Уже есть аккаунт? <Link to="/login">Войти</Link></Text>
          </div>
        </Form>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
