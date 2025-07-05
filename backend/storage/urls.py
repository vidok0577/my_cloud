from .views import UserViewSet, FileViewSet, RegisterView, CurrentUserView
from rest_framework.routers import DefaultRouter
from django.urls import path, include

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'files', FileViewSet, basename='file')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/users/<int:pk>/files/', UserViewSet.as_view({'get': 'user_files'}), name='user-files'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/me/', CurrentUserView.as_view(), name='current_user'),
]
