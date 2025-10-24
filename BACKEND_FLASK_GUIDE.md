# Flask Backend Guide for Llamanage

This guide will help you build a complete Flask backend to support your Llamanage frontend, including Google Calendar OAuth, token management, and all required API endpoints.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Installation & Setup](#installation--setup)
3. [Environment Variables](#environment-variables)
4. [Complete Backend Code](#complete-backend-code)
5. [Database Models](#database-models)
6. [OAuth Implementation](#oauth-implementation)
7. [API Endpoints](#api-endpoints)
8. [Running the Backend](#running-the-backend)
9. [Testing OAuth Flow](#testing-oauth-flow)

---

## Project Structure

```
llamanage/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── models.py              # Database models
│   ├── auth.py                # Authentication middleware
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (DO NOT COMMIT)
├── frontend/
│   └── src/
└── README.md
```

---

## Installation & Setup

### Step 1: Create Backend Directory

```powershell
# Navigate to your project root
cd C:\Users\aboda\Desktop\programming\llamanage

# Create backend directory
mkdir backend
cd backend
```

### Step 2: Create Virtual Environment

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# If you get execution policy error, run:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Step 3: Install Dependencies

Create `requirements.txt`:

```txt
Flask==3.0.0
Flask-CORS==4.0.0
Flask-SQLAlchemy==3.1.1
python-dotenv==1.0.0
requests==2.31.0
cryptography==41.0.7
PyJWT==2.8.0
gunicorn==21.2.0
```

Install:

```powershell
pip install -r requirements.txt
```

---

## Environment Variables

Create `backend/.env`:

```env
# Flask Configuration
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-super-secret-key-change-this-in-production

# Database
DATABASE_URL=sqlite:///llamanage.db

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:5173/dashboard

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Encryption Key (generate with: python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())")
ENCRYPTION_KEY=your-encryption-key-here
```

### Generate Encryption Key:

```powershell
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

---

## Complete Backend Code

### `backend/config.py`

```python
import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Flask
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Database
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL', 'sqlite:///llamanage.db')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Google OAuth
    GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
    GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
    GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI')
    GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token'
    GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo'
    
    # Frontend
    FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    
    # Encryption
    ENCRYPTION_KEY = os.getenv('ENCRYPTION_KEY')
```

---

### `backend/models.py`

```python
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from cryptography.fernet import Fernet
import os

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    company_name = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    integrations = db.relationship('Integration', backref='user', lazy=True, cascade='all, delete-orphan')
    flows = db.relationship('Flow', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'company_name': self.company_name,
            'created_at': self.created_at.isoformat()
        }


class Integration(db.Model):
    __tablename__ = 'integrations'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # 'googleCalendar', 'slack', etc.
    email = db.Column(db.String(255))
    access_token = db.Column(db.Text)  # Encrypted
    refresh_token = db.Column(db.Text)  # Encrypted
    expires_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def encrypt_token(self, token):
        """Encrypt a token using Fernet symmetric encryption"""
        if not token:
            return None
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            raise ValueError("ENCRYPTION_KEY not set in environment variables")
        f = Fernet(key.encode())
        return f.encrypt(token.encode()).decode()
    
    def decrypt_token(self, encrypted_token):
        """Decrypt a token"""
        if not encrypted_token:
            return None
        key = os.getenv('ENCRYPTION_KEY')
        if not key:
            raise ValueError("ENCRYPTION_KEY not set in environment variables")
        f = Fernet(key.encode())
        return f.decrypt(encrypted_token.encode()).decode()
    
    def set_access_token(self, token):
        """Encrypt and store access token"""
        self.access_token = self.encrypt_token(token)
    
    def get_access_token(self):
        """Decrypt and return access token"""
        return self.decrypt_token(self.access_token)
    
    def set_refresh_token(self, token):
        """Encrypt and store refresh token"""
        self.refresh_token = self.encrypt_token(token)
    
    def get_refresh_token(self):
        """Decrypt and return refresh token"""
        return self.decrypt_token(self.refresh_token)
    
    def to_dict(self):
        return {
            'id': self.id,
            'type': self.type,
            'email': self.email,
            'connected': True,
            'expires_at': self.expires_at.isoformat() if self.expires_at else None,
            'created_at': self.created_at.isoformat()
        }


class Flow(db.Model):
    __tablename__ = 'flows'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    nodes = db.Column(db.JSON)  # Store as JSON
    edges = db.Column(db.JSON)  # Store as JSON
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'nodes': self.nodes,
            'edges': self.edges,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
```

---

### `backend/auth.py`

```python
from functools import wraps
from flask import request, jsonify
import jwt
from models import User, db

def get_current_user():
    """Extract user from Authorization header"""
    auth_header = request.headers.get('Authorization')
    
    if not auth_header:
        return None
    
    try:
        # Simple email-based auth (for development)
        # In production, use proper JWT tokens
        token = auth_header.replace('Bearer ', '')
        
        # For now, token is just the user email
        user = User.query.filter_by(email=token).first()
        return user
    except Exception as e:
        print(f"Auth error: {e}")
        return None


def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({'error': 'Authentication required'}), 401
        return f(user, *args, **kwargs)
    return decorated_function
```

---

### `backend/app.py` (Main Application)

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import requests
from config import Config
from models import db, User, Integration, Flow
from auth import get_current_user, require_auth

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS
CORS(app, origins=[app.config['FRONTEND_URL']], supports_credentials=True)

# Initialize database
db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()
    print("✅ Database tables created!")


# ============================================
# HEALTH CHECK
# ============================================

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Llamanage backend is running! 🦙',
        'timestamp': datetime.utcnow().isoformat()
    })


# ============================================
# AUTHENTICATION
# ============================================

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User signup"""
    data = request.json
    email = data.get('email')
    company_name = data.get('companyName')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Check if user exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'User already exists'}), 400
    
    # Create user
    user = User(email=email, company_name=company_name)
    db.session.add(user)
    db.session.commit()
    
    return jsonify({
        'message': 'User created successfully',
        'user': user.to_dict(),
        'token': email  # Simple token for development
    }), 201


@app.route('/api/auth/signin', methods=['POST'])
def signin():
    """User signin"""
    data = request.json
    email = data.get('email')
    
    if not email:
        return jsonify({'error': 'Email is required'}), 400
    
    # Find user
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'message': 'Signed in successfully',
        'user': user.to_dict(),
        'token': email  # Simple token for development
    })


# ============================================
# GOOGLE CALENDAR OAUTH
# ============================================

@app.route('/api/oauth/google/callback', methods=['POST'])
def google_oauth_callback():
    """Handle Google OAuth callback and exchange code for tokens"""
    data = request.json
    code = data.get('code')
    user_email = data.get('userId')
    
    if not code or not user_email:
        return jsonify({'error': 'Missing code or userId'}), 400
    
    # Find or create user
    user = User.query.filter_by(email=user_email).first()
    if not user:
        user = User(email=user_email)
        db.session.add(user)
        db.session.commit()
    
    try:
        # Exchange authorization code for tokens
        token_response = requests.post(
            app.config['GOOGLE_TOKEN_URL'],
            data={
                'code': code,
                'client_id': app.config['GOOGLE_CLIENT_ID'],
                'client_secret': app.config['GOOGLE_CLIENT_SECRET'],
                'redirect_uri': app.config['GOOGLE_REDIRECT_URI'],
                'grant_type': 'authorization_code'
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if token_response.status_code != 200:
            print(f"Token exchange error: {token_response.text}")
            return jsonify({'error': 'Failed to exchange code for tokens'}), 400
        
        tokens = token_response.json()
        access_token = tokens.get('access_token')
        refresh_token = tokens.get('refresh_token')
        expires_in = tokens.get('expires_in', 3600)
        
        # Get user's Google profile
        profile_response = requests.get(
            app.config['GOOGLE_USERINFO_URL'],
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if profile_response.status_code != 200:
            return jsonify({'error': 'Failed to get user profile'}), 400
        
        profile = profile_response.json()
        google_email = profile.get('email')
        
        # Check if integration exists
        integration = Integration.query.filter_by(
            user_id=user.id,
            type='googleCalendar'
        ).first()
        
        if integration:
            # Update existing integration
            integration.email = google_email
            integration.set_access_token(access_token)
            if refresh_token:  # Only update if provided
                integration.set_refresh_token(refresh_token)
            integration.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            integration.updated_at = datetime.utcnow()
        else:
            # Create new integration
            integration = Integration(
                user_id=user.id,
                type='googleCalendar',
                email=google_email,
                expires_at=datetime.utcnow() + timedelta(seconds=expires_in)
            )
            integration.set_access_token(access_token)
            if refresh_token:
                integration.set_refresh_token(refresh_token)
            db.session.add(integration)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'email': google_email,
            'message': 'Google Calendar connected successfully!'
        })
        
    except Exception as e:
        print(f"OAuth error: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/integrations/refresh-token', methods=['POST'])
@require_auth
def refresh_google_token(user):
    """Refresh Google access token using refresh token"""
    try:
        integration = Integration.query.filter_by(
            user_id=user.id,
            type='googleCalendar'
        ).first()
        
        if not integration or not integration.refresh_token:
            return jsonify({'error': 'No refresh token available'}), 400
        
        refresh_token = integration.get_refresh_token()
        
        # Request new access token
        token_response = requests.post(
            app.config['GOOGLE_TOKEN_URL'],
            data={
                'refresh_token': refresh_token,
                'client_id': app.config['GOOGLE_CLIENT_ID'],
                'client_secret': app.config['GOOGLE_CLIENT_SECRET'],
                'grant_type': 'refresh_token'
            },
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        if token_response.status_code != 200:
            return jsonify({'error': 'Failed to refresh token'}), 400
        
        tokens = token_response.json()
        access_token = tokens.get('access_token')
        expires_in = tokens.get('expires_in', 3600)
        
        # Update integration
        integration.set_access_token(access_token)
        integration.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        integration.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Token refreshed successfully',
            'expires_at': integration.expires_at.isoformat()
        })
        
    except Exception as e:
        print(f"Token refresh error: {e}")
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ============================================
# INTEGRATIONS
# ============================================

@app.route('/api/integrations', methods=['GET'])
@require_auth
def get_integrations(user):
    """Get all integrations for current user"""
    integrations = Integration.query.filter_by(user_id=user.id).all()
    return jsonify({
        'integrations': [i.to_dict() for i in integrations]
    })


@app.route('/api/integrations/<integration_type>', methods=['DELETE'])
@require_auth
def delete_integration(user, integration_type):
    """Delete an integration"""
    integration = Integration.query.filter_by(
        user_id=user.id,
        type=integration_type
    ).first()
    
    if not integration:
        return jsonify({'error': 'Integration not found'}), 404
    
    db.session.delete(integration)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': f'{integration_type} integration removed'
    })


# ============================================
# GOOGLE CALENDAR API PROXY
# ============================================

def get_valid_google_token(user):
    """Get valid Google access token, refresh if needed"""
    integration = Integration.query.filter_by(
        user_id=user.id,
        type='googleCalendar'
    ).first()
    
    if not integration:
        raise ValueError('Google Calendar not connected')
    
    # Check if token expired
    if datetime.utcnow() >= integration.expires_at:
        # Token expired, refresh it
        refresh_token = integration.get_refresh_token()
        
        if not refresh_token:
            raise ValueError('No refresh token available')
        
        token_response = requests.post(
            app.config['GOOGLE_TOKEN_URL'],
            data={
                'refresh_token': refresh_token,
                'client_id': app.config['GOOGLE_CLIENT_ID'],
                'client_secret': app.config['GOOGLE_CLIENT_SECRET'],
                'grant_type': 'refresh_token'
            }
        )
        
        if token_response.status_code != 200:
            raise ValueError('Failed to refresh token')
        
        tokens = token_response.json()
        access_token = tokens.get('access_token')
        expires_in = tokens.get('expires_in', 3600)
        
        # Update integration
        integration.set_access_token(access_token)
        integration.expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
        db.session.commit()
        
        return access_token
    
    return integration.get_access_token()


@app.route('/api/calendar/events', methods=['GET'])
@require_auth
def list_calendar_events(user):
    """List calendar events"""
    try:
        access_token = get_valid_google_token(user)
        
        # Get query parameters
        max_results = request.args.get('maxResults', 10)
        time_min = request.args.get('timeMin', datetime.utcnow().isoformat() + 'Z')
        
        # Call Google Calendar API
        response = requests.get(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            params={
                'maxResults': max_results,
                'timeMin': time_min,
                'singleEvents': 'true',
                'orderBy': 'startTime'
            },
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code != 200:
            return jsonify({'error': 'Failed to fetch events'}), response.status_code
        
        return jsonify(response.json())
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/calendar/events', methods=['POST'])
@require_auth
def create_calendar_event(user):
    """Create a calendar event"""
    try:
        access_token = get_valid_google_token(user)
        event_data = request.json
        
        # Call Google Calendar API
        response = requests.post(
            'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            json=event_data,
            headers={'Authorization': f'Bearer {access_token}'}
        )
        
        if response.status_code not in [200, 201]:
            return jsonify({'error': 'Failed to create event'}), response.status_code
        
        return jsonify(response.json()), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ============================================
# FLOW BUILDER
# ============================================

@app.route('/api/flows', methods=['POST'])
@require_auth
def save_flow(user):
    """Save a flow"""
    data = request.json
    
    name = data.get('flowName')
    nodes = data.get('nodes')
    edges = data.get('edges')
    
    if not name or not nodes:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Create flow
    flow = Flow(
        user_id=user.id,
        name=name,
        nodes=nodes,
        edges=edges
    )
    
    db.session.add(flow)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Flow saved successfully!',
        'flow': flow.to_dict()
    }), 201


@app.route('/api/flows', methods=['GET'])
@require_auth
def get_flows(user):
    """Get all flows for current user"""
    flows = Flow.query.filter_by(user_id=user.id).all()
    return jsonify({
        'flows': [f.to_dict() for f in flows]
    })


@app.route('/api/flows/<int:flow_id>', methods=['GET'])
@require_auth
def get_flow(user, flow_id):
    """Get a specific flow"""
    flow = Flow.query.filter_by(id=flow_id, user_id=user.id).first()
    
    if not flow:
        return jsonify({'error': 'Flow not found'}), 404
    
    return jsonify(flow.to_dict())


@app.route('/api/flows/<int:flow_id>', methods=['DELETE'])
@require_auth
def delete_flow(user, flow_id):
    """Delete a flow"""
    flow = Flow.query.filter_by(id=flow_id, user_id=user.id).first()
    
    if not flow:
        return jsonify({'error': 'Flow not found'}), 404
    
    db.session.delete(flow)
    db.session.commit()
    
    return jsonify({
        'success': True,
        'message': 'Flow deleted successfully'
    })


# ============================================
# RUN APPLICATION
# ============================================

if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
```

---

## Running the Backend

### Step 1: Activate Virtual Environment

```powershell
cd C:\Users\aboda\Desktop\programming\llamanage\backend
.\venv\Scripts\Activate.ps1
```

### Step 2: Set Environment Variables

Make sure your `backend/.env` file has all required values:
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `ENCRYPTION_KEY`

### Step 3: Run Flask Server

```powershell
python app.py
```

You should see:

```
✅ Database tables created!
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://0.0.0.0:5000
```

---

## Testing OAuth Flow

### 1. Test Health Check

```powershell
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "healthy",
  "message": "Llamanage backend is running! 🦙",
  "timestamp": "2025-10-25T..."
}
```

### 2. Test Full OAuth Flow

1. **Start Backend:** `python app.py` (port 5000)
2. **Start Frontend:** `npm run dev` (port 5173)
3. **Navigate to:** http://localhost:5173/dashboard
4. **Go to Integrations tab**
5. **Click "Connect Google Calendar"**
6. **Authorize with Google**
7. **Check backend logs** - you should see token exchange
8. **Frontend should show:** "Google Calendar connected successfully! 🎉"

---

## API Endpoints Summary

### Authentication
- `POST /api/auth/signup` - User signup
- `POST /api/auth/signin` - User signin

### OAuth
- `POST /api/oauth/google/callback` - Exchange code for tokens
- `POST /api/integrations/refresh-token` - Refresh access token

### Integrations
- `GET /api/integrations` - List all integrations
- `DELETE /api/integrations/:type` - Remove integration

### Calendar
- `GET /api/calendar/events` - List events
- `POST /api/calendar/events` - Create event

### Flow Builder
- `POST /api/flows` - Save flow
- `GET /api/flows` - List flows
- `GET /api/flows/:id` - Get specific flow
- `DELETE /api/flows/:id` - Delete flow

---

## Security Best Practices

### ✅ Implemented:
1. **Token Encryption** - All tokens encrypted with Fernet
2. **Environment Variables** - Secrets in `.env` file
3. **CORS** - Only frontend origin allowed
4. **Token Refresh** - Automatic refresh before expiry
5. **Secure Storage** - Tokens never sent to frontend

### 🔒 For Production:
1. Use PostgreSQL instead of SQLite
2. Implement proper JWT authentication
3. Add rate limiting
4. Enable HTTPS
5. Use Redis for session storage
6. Add request validation
7. Implement logging and monitoring
8. Use environment-specific configs

---

## Troubleshooting

### Error: "ENCRYPTION_KEY not set"
```powershell
# Generate new key
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

# Add to backend/.env
ENCRYPTION_KEY=your-generated-key-here
```

### Error: "Failed to exchange code for tokens"
- Check `GOOGLE_CLIENT_SECRET` is correct
- Check `GOOGLE_REDIRECT_URI` matches Google Console
- Check backend logs for detailed error

### Error: "CORS policy"
- Ensure backend is running on port 5000
- Check `FRONTEND_URL` in `.env` is `http://localhost:5173`

---

## Next Steps

1. ✅ Set up Google OAuth credentials
2. ✅ Configure `.env` file
3. ✅ Run backend: `python app.py`
4. ✅ Test OAuth flow
5. 🚀 Build AI features
6. 🚀 Deploy to production

---

## Production Deployment

### Option 1: Deploy to Heroku

```bash
# Install Heroku CLI
# Add Procfile
echo "web: gunicorn app:app" > Procfile

# Deploy
heroku create llamanage-backend
heroku config:set GOOGLE_CLIENT_ID=your-id
heroku config:set GOOGLE_CLIENT_SECRET=your-secret
heroku config:set ENCRYPTION_KEY=your-key
git push heroku main
```

### Option 2: Deploy to Railway

1. Push to GitHub
2. Connect Railway to repo
3. Add environment variables
4. Deploy automatically

### Option 3: Deploy to AWS/Azure

Use Docker + container service (ECS, App Service, etc.)

---

## Support

Need help? Check:
- [Flask Documentation](https://flask.palletsprojects.com/)
- [Google Calendar API](https://developers.google.com/calendar/api)
- `GOOGLE_CALENDAR_SETUP.md` for OAuth setup
- `SECURITY.md` for security best practices

Happy coding! 🦙🚀
