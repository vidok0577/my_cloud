from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.validators import RegexValidator
from .models import File


class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(source='is_staff', read_only=True)
    total_file_size = serializers.IntegerField(read_only=True)
    files_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email',
            'first_name', 'last_name',
            'is_admin', 'is_staff',
            'total_file_size', 'files_count',
            'date_joined'
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {
            'username': {
                'validators': [
                    RegexValidator(
                        regex='^[a-zA-Z][a-zA-Z0-9]{3,19}$',
                        message='Логин должен начинаться с буквы, содержать только латинские буквы и цифры, и быть длиной 4-20 символов'
                    )
                ]
            },
            'email': {'required': True}
        }

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        user.set_password(validated_data['password'])
        user.save()
        return user


class FileSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    download_url = serializers.SerializerMethodField()
    share_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'owner', 'original_name', 'storage_path', 'size',
                  'upload_date', 'last_download', 'comment', 'share_link',
                  'download_url', 'share_url']
        read_only_fields = ['storage_path', 'size', 'upload_date',
                            'last_download', 'share_link']

    def get_download_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(f'/api/files/{obj.id}/download/')

    def get_share_url(self, obj):
        request = self.context.get('request')
        return request.build_absolute_uri(f'/api/share/{obj.share_link}/')


class FileUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField(write_only=True)
    comment = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = File
        fields = ['file', 'comment']

    def create(self, validated_data):
        request = self.context['request']
        file_obj = validated_data['file']

        file_instance = File(
            owner=request.user,
            original_name=file_obj.name,
            size=file_obj.size,
            comment=validated_data.get('comment', ''),
            file=file_obj
        )

        if not file_instance.storage_path:
            file_instance.storage_path = file_instance.file.name

        file_instance.save()
        return file_instance
