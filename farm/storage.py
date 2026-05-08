"""
Custom Cloudinary storage backend for Django 6.0+
Replaces django-cloudinary-storage which is incompatible with Django 6.0
"""
import os
from urllib.parse import urlparse
from django.core.files.storage import Storage
from django.core.files.base import ContentFile


class CloudinaryStorage(Storage):
    """Django storage backend that uploads files to Cloudinary."""

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        import cloudinary
        self.cloudinary = cloudinary

    def _get_public_id(self, name):
        """Convert file path to Cloudinary public_id."""
        # Remove extension for Cloudinary
        base, _ = os.path.splitext(name)
        return f"farm_media/{base}"

    def _save(self, name, content):
        """Upload file to Cloudinary."""
        import cloudinary.uploader
        public_id = self._get_public_id(name)
        
        # Read content
        file_data = content.read()
        
        result = cloudinary.uploader.upload(
            file_data,
            public_id=public_id,
            resource_type="auto",
            overwrite=True,
        )
        
        # Return the public_id as the stored name
        return name

    def _open(self, name, mode='rb'):
        """Retrieve file from Cloudinary."""
        import cloudinary.api
        import requests
        
        url = self.url(name)
        response = requests.get(url)
        return ContentFile(response.content)

    def exists(self, name):
        """Check if file exists on Cloudinary."""
        try:
            import cloudinary.api
            public_id = self._get_public_id(name)
            cloudinary.api.resource(public_id)
            return True
        except Exception:
            return False

    def url(self, name):
        """Return the Cloudinary URL for the file."""
        import cloudinary.utils
        public_id = self._get_public_id(name)
        url, _ = cloudinary.utils.cloudinary_url(public_id)
        return url

    def delete(self, name):
        """Delete file from Cloudinary."""
        try:
            import cloudinary.uploader
            public_id = self._get_public_id(name)
            cloudinary.uploader.destroy(public_id)
        except Exception:
            pass

    def size(self, name):
        """Return file size."""
        try:
            import cloudinary.api
            public_id = self._get_public_id(name)
            result = cloudinary.api.resource(public_id)
            return result.get('bytes', 0)
        except Exception:
            return 0
