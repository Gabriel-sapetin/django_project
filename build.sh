#!/usr/bin/env bash
set -o errexit

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Building React frontend..."
cd frontend
npm install
CI=false NODE_ENV=production npm run build
cd ..

echo "Copying frontend build to static files..."
mkdir -p myproject/static
cp -r frontend/build/* myproject/static/ || true

echo "Collecting Django static files..."
python manage.py collectstatic --no-input

echo "Creating media directories..."
mkdir -p media/employee_photos media/activity_photos media/profile_photos

echo "Running database migrations..."
python manage.py migrate

echo "Creating superuser if needed..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
import os
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')
if password and not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f'Superuser {username} created.')
else:
    print('Superuser already exists or no password set.')
" || true

echo "Build completed successfully!"
