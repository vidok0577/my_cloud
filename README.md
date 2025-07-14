# MyCloud - Облачное файловое хранилище


![Django](https://img.shields.io/badge/Django-092E20?style=flat&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/Django_REST-ff1709?style=flat&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)

Полнофункциональное веб-приложение для безопасного хранения и управления файлами с возможностью администрирования.

## 🌟 Основные возможности

- 📁 Загрузка, скачивание и управление файлами
- 🔐 Регистрация и аутентификация пользователей
- 👨‍💻 Админ-панель для управления пользователями
- 📊 Отображение использования хранилища
- 🔗 Генерация share-ссылок для файлов
- ✏️ Комментарии к файлам

## 🛠 Технологический стек

**Бэкенд:**
- Python 3.12+
- Django 5.2
- Django REST Framework
- PostgreSQL
- JWT-аутентификация

**Фронтенд:**
- React 19
- Redux Toolkit
- Axios
- React Router
- Ant Design

## 🚀 Установка и запуск
- создать в корне проекта файл ".env", с таким содержимым:
  - DB_NAME="mycloud" #имя используемой базы данных
  - DB_USER="mycloud" #пользователь базы данных
  - DB_PASSWORD="mycloud" # пароль базы данных
  - DEBUG=0 #0 - продакшн режим джанго, 1 - debug режим
  - SECRET_KEY="" #в кавычки вставить вывод команды openssl rand -hex 32
  - ADMIN_PASSWORD="admin123" #пароль суперпользователя Django, лучше поменять
  - ALLOWED_HOSTS="backend,localhost,127.0.0.1,внешний_ИП_сервера" #внешний_ИП_сервера замените на url или IP сервера на котором запускается проект
- собрать контейнер, запустив командой(в корне проекта) docker-compose build
- запустить собраный контенер командой docker-compose up


### Требования
- Docker и docker-compose
- Поддерживаются файлы не более 50 Мб
