import os
import uuid
import logging
from rest_framework import viewsets, permissions, status
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.db.models import Sum, Count
from django.db import IntegrityError
from django.http import FileResponse
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from .models import File
from .serializers import UserSerializer, RegisterSerializer, FileSerializer


logger = logging.getLogger(__name__)

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]

    def get_queryset(self):
        return User.objects.annotate(
            total_file_size = Sum('files__size'),
            files_count = Count('files')
        )

    @action(detail=True, methods=['patch'])
    def set_admin(self, request, pk=None):
        user = self.get_object()
        user.is_staff = not user.is_staff
        user.save()
        logger.info(f'У пользователя {user.username} установлены админ права:{user.is_staff}')
        return Response(self.get_serializer(user).data)

    @action(detail=True, methods=['get'], url_path='files')
    def user_files(self, request, pk=None):
        user = self.get_object()
        files = File.objects.filter(owner=user)
        serializer = FileSerializer(files, many=True, context={'request': request})
        return Response(serializer.data)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            logger.info(f'Создан пользователь {serializer.user}')
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = User.objects.filter(id=request.user.id).annotate(
            files_count=Count('files'),
            total_file_size=Sum('files__size')
        ).first()

        serializer = UserSerializer(user)
        return Response(serializer.data)


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_permissions(self):
        if self.action in ['download_shared', 'share_file_info']:
            return []
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        user_id = self.request.query_params.get('user_id')

        if user.is_staff and user_id:
            return File.objects.filter(owner_id=user_id)

        return File.objects.filter(owner=user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def create(self, request, *args, **kwargs):
        if 'file' not in request.FILES:
            return Response(
                {"error": "Файл не был предоставлен"},
                status=status.HTTP_400_BAD_REQUEST
            )

        file_obj = request.FILES['file']
        comment = request.data.get('comment', '')

        try:
            ext = os.path.splitext(file_obj.name)[1]
            storage_name = f"{uuid.uuid4().hex}{ext}"
            storage_path = f"user_{request.user.id}/{storage_name}"

            original_name = file_obj.name
            base_name, ext = os.path.splitext(original_name)
            counter = 1

            while File.objects.filter(owner=request.user, original_name=original_name).exists():
                original_name = f"{base_name}_{counter}{ext}"
                counter += 1

            logger.info(f'Пользователь {request.user}, закачал файл {original_name}')

            file_instance = File(
                owner=request.user,
                original_name=original_name,
                storage_path=storage_path,
                size=file_obj.size,
                comment=comment,
                file=file_obj
            )
            file_instance.save()

            serializer = self.get_serializer(file_instance)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except IntegrityError as e:
            return Response(
                {"error": "Конфликт имен файлов. Попробуйте еще раз."},
                status=status.HTTP_409_CONFLICT
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        try:
          file_obj = File.objects.get(pk=pk)

          # Проверяем существование файла в хранилище
          if not file_obj.file:
              logger.error(f"Файл ID:{pk} существует в БД, но отсутствует в хранилище")
              return Response(
                  {"error": "Файл недоступен для скачивания"},
                  status=status.HTTP_410_GONE
              )

          # Разрешаем скачивание либо владельцу, либо администратору
          if not request.user.is_staff and file_obj.owner != request.user:
              logger.warning(
                  f"Попытка несанкционированного доступа к файлу ID:{pk} пользователем {request.user}"
              )
              return Response(
                  {"detail": "У вас нет прав для скачивания этого файла"},
                  status=status.HTTP_403_FORBIDDEN
              )

          response = FileResponse(file_obj.file)
          response['Content-Disposition'] = f'attachment; filename="{file_obj.original_name}"'
          response['Content-Type'] = 'application/octet-stream'
          logger.info(f'Скачивание файла {file_obj.original_name}, владельцем или админом')

          file_obj.last_download = timezone.now()
          file_obj.save()

          return response
        
        except File.DoesNotExist:
        # Логируем попытку доступа к несуществующему файлу
          logger.info(f"Попытка доступа к несуществующему файлу ID:{pk}")
          return Response(
              {"error": "Файл не найден"},
              status=status.HTTP_404_NOT_FOUND
          )
        
        except Exception as e:
            # Логируем непредвиденные ошибки
            logger.exception(f"Ошибка при скачивании файла ID:{pk}")
            return Response(
                {"error": "Внутренняя ошибка сервера"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'], url_path='update_comment')
    def update_comment(self, request, pk=None):
        file = self.get_object()
        if file.owner != request.user:
            return Response(
                {"error": "Вы не являетесь владельцем этого файла"},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            new_comment = request.data.get('comment')
            if new_comment is None:
                return Response(
                    {"error": "Поле 'comment' обязательно"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            file.comment = new_comment
            file.save()

            serializer = self.get_serializer(file)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], url_path='share/(?P<share_link>[^/.]+)')
    def download_shared(self, request, share_link=None):
        try:
            file_obj = get_object_or_404(File, share_link=share_link)

            response = FileResponse(file_obj.file)
            response['Content-Disposition'] = f'attachment; filename="{file_obj.original_name}"'
            response['Content-Type'] = 'application/octet-stream'
            logger.info(f'Скачивание файла {file_obj.original_name}, по шаред-ссылке')

            file_obj.last_download = timezone.now()
            file_obj.save()

            return response
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=['get'], url_path='share/(?P<share_link>[^/.]+)/info')
    def share_file_info(self, request, share_link=None):
        file_obj = get_object_or_404(File, share_link=share_link)
        return Response({
            'original_name': file_obj.original_name,
            'size': file_obj.size,
            'upload_date': file_obj.upload_date,
            'last_download': file_obj.last_download,
            'comment': file_obj.comment
        })

    @action(detail=True, methods=['delete'], permission_classes=[IsAdminUser])
    def admin_delete(self, request, pk=None):
        logger.info(f'Админ {request.user} пытается удалить файл ID:{pk}')
        try:
            file = File.objects.get(pk=pk)
            logger.info(f'Файл ID: {file} успешно удален')
            file.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except File.DoesNotExist:
            logger.error(f'Файл ID:{pk} не найден')
            return Response(
                {"error": "Файл не найден"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
          logger.exception(f'Ошибка при удалении файла ID:{pk}')
          return Response(
              {"error": "Внутренняя ошибка сервера"},
              status=status.HTTP_500_INTERNAL_SERVER_ERROR
          )
