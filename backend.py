from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import cv2
import pickle
import cvzone
import numpy as np
import threading
import time
import base64
from io import BytesIO
from PIL import Image
import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import sqlite3
import hashlib
import os

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_FILE = 'smartpark_users.db'

# OTP storage (in production, use Redis or database)
otp_storage = {}  # {email: {'otp': '123456', 'expires_at': timestamp, 'user_data': {...}}}
password_reset_otp_storage = {}  # {email: {'otp': '123456', 'expires_at': timestamp}}

# Email configuration
# For Gmail: Use App Password (not regular password)
# For Outlook: Use "smtp-mail.outlook.com" and port 587
# For Yahoo: Use "smtp.mail.yahoo.com" and port 587
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = "smartpark110@gmail.com"  # Replace with your email
SMTP_PASSWORD = "wxdb fxrl hgpp bzbm"     # Replace with your app password

# Set to True to enable real email sending, False for demo mode
ENABLE_REAL_EMAIL = True

def init_database():
    """Initialize the SQLite database with users table"""
    conn = sqlite3.connect(DATABASE_FILE)
    cursor = conn.cursor()
    
    # Create users table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            phone TEXT,
            organization TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_verified BOOLEAN DEFAULT 1
        )
    ''')
    
    # Insert demo users if they don't exist
    demo_users = [
        ('admin', 'admin@smartpark.com', 'admin123', 'Admin User', '', 'SmartPark'),
        ('user', 'user@smartpark.com', 'user123', 'Regular User', '', 'SmartPark'),
        ('demo', 'demo@smartpark.com', 'demo123', 'Demo User', '', 'SmartPark')
    ]
    
    for username, email, password, full_name, phone, org in demo_users:
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO users (username, email, password_hash, full_name, phone, organization)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (username, email, password_hash, full_name, phone, org))
        except sqlite3.IntegrityError:
            pass  # User already exists
    
    conn.commit()
    conn.close()
    print(f"✅ Database initialized: {DATABASE_FILE}")

def get_db_connection():
    """Get database connection"""
    conn = sqlite3.connect(DATABASE_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def verify_user_credentials(username, password):
    """Verify user credentials against database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    cursor.execute('''
        SELECT * FROM users 
        WHERE username = ? AND password_hash = ? AND is_verified = 1
    ''', (username, password_hash))
    
    user = cursor.fetchone()
    conn.close()
    
    return user

def create_user(user_data):
    """Create a new user in the database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(user_data['password'].encode()).hexdigest()
    
    try:
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, phone, organization)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            user_data['username'],
            user_data['email'],
            password_hash,
            user_data['full_name'],
            user_data.get('phone', ''),
            user_data.get('organization', '')
        ))
        
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return user_id
    except sqlite3.IntegrityError as e:
        conn.close()
        if 'UNIQUE constraint failed: users.username' in str(e):
            raise ValueError('Username already exists')
        elif 'UNIQUE constraint failed: users.email' in str(e):
            raise ValueError('Email already exists')
        else:
            raise ValueError('Database error')
    except Exception as e:
        conn.close()
        raise ValueError(f'Error creating user: {str(e)}')

def generate_otp():
    """Generate a 6-digit OTP"""
    return ''.join(random.choices(string.digits, k=6))

def send_email_otp(email, otp):
    """Send OTP via email"""
    try:
        if ENABLE_REAL_EMAIL:
            # Send real email
            msg = MIMEMultipart()
            msg['From'] = SMTP_USERNAME
            msg['To'] = email
            msg['Subject'] = "SmartPark Email Verification"
            
            body = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px;">🏢 SmartPark</h1>
                    <p style="margin: 10px 0; opacity: 0.9;">Email Verification</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
                    
                    <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px;">{otp}</span>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">
                        Please enter this 6-digit code to verify your email address. 
                        This code will expire in <strong>10 minutes</strong>.
                    </p>
                    
                    <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0; color: #856404;">
                            <strong>Security Notice:</strong> If you didn't request this verification code, 
                            please ignore this email and contact support immediately.
                        </p>
                    </div>
                    
                    <p style="color: #999; font-size: 14px; margin-top: 30px;">
                        This is an automated message from SmartPark. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>
            """
            
            msg.attach(MIMEText(body, 'html'))
            
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            text = msg.as_string()
            server.sendmail(SMTP_USERNAME, email, text)
            server.quit()
            
            print(f"✅ Email sent successfully to {email}")
            return True
        else:
            # Demo mode - just print the OTP
            print(f"📧 DEMO MODE - OTP for {email}: {otp}")
            print(f"📧 To enable real email sending, set ENABLE_REAL_EMAIL = True in backend.py")
            return True
            
    except Exception as e:
        print(f"❌ Error sending email: {e}")
        print(f"📧 Make sure your email credentials are correct in backend.py")
        return False

def store_otp(email, user_data=None):
    """Store OTP with expiration time"""
    otp = generate_otp()
    expires_at = time.time() + 600  # 10 minutes
    
    print(f"💾 Storing OTP for {email}: {otp}")
    print(f"⏰ Expires at: {expires_at}")
    
    otp_storage[email] = {
        'otp': otp,
        'expires_at': expires_at,
        'user_data': user_data
    }
    
    return otp

def verify_stored_otp(email, otp):
    """Verify OTP and return user data if valid"""
    print(f"🔍 Verifying OTP for {email}: {otp}")
    
    if email not in otp_storage:
        print(f"❌ No OTP found for {email}")
        return None
    
    stored_data = otp_storage[email]
    stored_otp = stored_data['otp']
    expires_at = stored_data['expires_at']
    current_time = time.time()
    
    print(f"📧 Stored OTP: {stored_otp}")
    print(f"⏰ Expires at: {expires_at}, Current time: {current_time}")
    print(f"⏰ Time remaining: {expires_at - current_time:.1f} seconds")
    
    # Check if OTP is expired
    if current_time > expires_at:
        print(f"❌ OTP expired for {email}")
        del otp_storage[email]
        return None
    
    # Check if OTP matches
    if stored_otp == otp:
        print(f"✅ OTP verified successfully for {email}")
        user_data = stored_data.get('user_data')
        # Return a special marker for successful verification even if no user_data
        if user_data is None:
            return "VERIFIED"  # Special marker for successful verification without user data
        return user_data
    else:
        print(f"❌ OTP mismatch for {email}: expected {stored_otp}, got {otp}")
    
    return None

def store_password_reset_otp(email):
    """Store password reset OTP"""
    otp = generate_otp()
    expires_at = time.time() + 600  # 10 minutes expiry
    
    password_reset_otp_storage[email] = {
        'otp': otp,
        'expires_at': expires_at
    }
    
    return otp

def verify_password_reset_otp(email, otp):
    """Verify password reset OTP"""
    if email not in password_reset_otp_storage:
        return False, "OTP not found or expired"
    
    stored_data = password_reset_otp_storage[email]
    stored_otp = stored_data['otp']
    expires_at = stored_data['expires_at']
    current_time = time.time()
    
    # Check if OTP has expired
    if current_time > expires_at:
        del password_reset_otp_storage[email]  # Clean up expired OTP
        return False, "OTP has expired"
    
    # Verify OTP
    if stored_otp == otp:
        return True, "OTP verified"
    else:
        return False, "Invalid OTP"

def reset_user_password(email, new_password):
    """Reset user password in database"""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    try:
        cursor.execute('''
            UPDATE users 
            SET password_hash = ? 
            WHERE email = ?
        ''', (password_hash, email))
        
        if cursor.rowcount == 0:
            conn.close()
            return False, "User not found"
        
        conn.commit()
        conn.close()
        
        # Clean up used OTP
        if email in password_reset_otp_storage:
            del password_reset_otp_storage[email]
        
        return True, "Password reset successfully"
    except Exception as e:
        conn.close()
        return False, f"Error resetting password: {str(e)}"

# Initialize database on startup
init_database()

# Global variables for video processing
cap = None
posList = []
width, height = 107, 48
current_frame = None
parking_data = {
    'total_spaces': 0,
    'available_spaces': 0,
    'occupied_spaces': 0,
    'reserved_spaces': 0,
    'utilization_rate': 0
}
individual_spaces = []  # Store individual space status
reservations = {}  # Store reservations: {space_id: {'user': 'name', 'time': timestamp, 'duration': minutes}}

# Simple authentication system
# No email verification required - direct registration and login

# Caching for optimization
last_parking_data = None
last_individual_spaces = None
frame_cache = None
last_frame_time = 0
CACHE_DURATION = 0.5  # Cache for 500ms



def load_parking_positions():
    """Load parking space positions from pickle file"""
    global posList
    try:
        with open('CarParkPos', 'rb') as f:
            posList = pickle.load(f)
        return len(posList)
    except FileNotFoundError:
        print("CarParkPos file not found. Please run ParkingSpacePicker.py first.")
        return 0

def check_parking_space(imgPro, img):
    """Check parking spaces and draw rectangles"""
    global parking_data, individual_spaces, last_parking_data, last_individual_spaces
    spaceCounter = 0
    reservedCounter = 0
    individual_spaces = []  # Reset individual spaces
    
    for i, pos in enumerate(posList):
        x, y = pos
        imgCrop = imgPro[y:y + height, x:x + width]
        count = cv2.countNonZero(imgCrop)
        space_id = i + 1
        
        # Check if space is reserved
        is_reserved = space_id in reservations
        
        if is_reserved:
            color = (255, 165, 0)  # Orange for reserved
            thickness = 3
            status = 'reserved'
            reservedCounter += 1
        elif count < 900:
            color = (0, 255, 0)  # Green for available
            thickness = 5
            spaceCounter += 1
            status = 'available'
        else:
            color = (0, 0, 255)  # Red for occupied
            thickness = 2
            status = 'occupied'
        
        # Store individual space data
        individual_spaces.append({
            'id': space_id,
            'position': pos,
            'status': status,
            'count': count,
            'is_reserved': is_reserved,
            'reservation_info': reservations.get(space_id, None),
            'coordinates': {
                'x': x,
                'y': y,
                'width': width,
                'height': height
            }
        })
        
        cv2.rectangle(img, pos, (pos[0] + width, pos[1] + height), color, thickness)
        cvzone.putTextRect(img, str(count), (x, y + height - 3), scale=1,
                          thickness=2, offset=0, colorR=color)
    
    # Update parking data
    total_spaces = len(posList)
    new_parking_data = {
        'total_spaces': total_spaces,
        'available_spaces': spaceCounter,
        'occupied_spaces': total_spaces - spaceCounter - reservedCounter,
        'reserved_spaces': reservedCounter,
        'utilization_rate': int(((total_spaces - spaceCounter - reservedCounter) / total_spaces * 100) if total_spaces > 0 else 0)
    }
    
    # Only update if data has changed
    if new_parking_data != last_parking_data:
        parking_data.update(new_parking_data)
        last_parking_data = new_parking_data.copy()
    
    # Only update individual spaces if they've changed
    if individual_spaces != last_individual_spaces:
        last_individual_spaces = individual_spaces.copy()
    
    # Add occupancy text
    cvzone.putTextRect(img, f'Free: {spaceCounter}/{total_spaces}', (100, 50), scale=3,
                      thickness=5, offset=20, colorR=(0, 200, 0))

def process_video():
    """Process video frames in a separate thread"""
    global cap, current_frame, frame_cache, last_frame_time
    
    # Initialize video capture
    cap = cv2.VideoCapture('carPark.mp4')
    
    while True:
        if cap.get(cv2.CAP_PROP_POS_FRAMES) == cap.get(cv2.CAP_PROP_FRAME_COUNT):
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
        
        success, img = cap.read()
        if not success:
            continue
            
        # Process the image
        imgGray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        imgBlur = cv2.GaussianBlur(imgGray, (3, 3), 1)
        imgThreshold = cv2.adaptiveThreshold(imgBlur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                           cv2.THRESH_BINARY_INV, 25, 16)
        imgMedian = cv2.medianBlur(imgThreshold, 5)
        kernel = np.ones((3, 3), np.uint8)
        imgDilate = cv2.dilate(imgMedian, kernel, iterations=1)
        
        # Check parking spaces
        check_parking_space(imgDilate, img)
        
        # Store current frame
        current_frame = img.copy()
        
        # Optimized frame rate control
        time.sleep(0.02)  # ~50 FPS for smoother processing

def frame_to_base64(frame):
    """Convert OpenCV frame to base64 string with caching"""
    global frame_cache, last_frame_time
    
    current_time = time.time()
    
    # Return cached frame if it's still fresh
    if frame_cache and (current_time - last_frame_time) < CACHE_DURATION:
        return frame_cache
    
    if frame is None:
        return None
    
    # Convert BGR to RGB
    frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    
    # Convert to PIL Image
    pil_image = Image.fromarray(frame_rgb)
    
    # Convert to base64 with optimized quality
    buffer = BytesIO()
    pil_image.save(buffer, format='JPEG', quality=80, optimize=True)
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    # Cache the result
    frame_cache = img_str
    last_frame_time = current_time
    
    return img_str



@app.route('/api/register', methods=['POST'])
def register_user():
    """Complete user registration after OTP verification"""
    try:
        data = request.get_json()
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        full_name = data.get('full_name')
        phone = data.get('phone', '')
        organization = data.get('organization', '')
        
        if not all([email, username, password, full_name]):
            return jsonify({'error': 'All required fields must be provided'}), 400
        
        # Check if user data was verified via OTP
        if email not in otp_storage:
            return jsonify({'error': 'Email verification required. Please complete OTP verification first.'}), 400
        
        # Check if OTP was actually verified
        if not otp_storage[email].get('verified', False):
            return jsonify({'error': 'Email verification required. Please complete OTP verification first.'}), 400
        
        # Create user in database
        user_id = create_user({
            'username': username, 
            'email': email, 
            'password': password, 
            'full_name': full_name, 
            'phone': phone, 
            'organization': organization
        })
        
        # Remove OTP data after successful registration
        del otp_storage[email]
        
        return jsonify({
            'message': 'Registration completed successfully',
            'user': {
                'id': user_id,
                'username': username,
                'email': email,
                'full_name': full_name
            }
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 409
    except Exception as e:
        print(f"Error in register_user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/login', methods=['POST'])
def login_user():
    """User login endpoint"""
    print(f"🔐 Login request received for user: {request.get_json()}")
    try:
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        # Verify credentials against database
        user = verify_user_credentials(username, password)
        
        if user:
            # Direct login without OTP for all users
            return jsonify({
                'message': 'Login successful',
                'user': {
                    'id': user['id'],
                    'username': user['username'],
                    'email': user['email'],
                    'full_name': user['full_name'],
                    'role': 'admin' if user['username'] == 'admin' else 'user'
                }
            })
        else:
            return jsonify({'error': 'Invalid username or password'}), 401
            
    except Exception as e:
        print(f"Error in login_user: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/send-otp', methods=['POST'])
def send_otp():
    """Send OTP for email verification"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if email already exists
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
        existing_user = cursor.fetchone()
        conn.close()
        
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409
        
        # Generate and store OTP
        otp = store_otp(email)
        
        # Send OTP via email
        if send_email_otp(email, otp):
            return jsonify({
                'message': 'OTP sent successfully'
            })
        else:
            # If email fails, still return success for testing
            print(f"⚠️ Email sending failed, but returning success for testing: {otp}")
            return jsonify({
                'message': 'OTP sent successfully (demo mode due to email issue)',
                'email_issue': True
            })
            
    except Exception as e:
        print(f"Error in send_otp: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/verify-otp', methods=['POST'])
def verify_otp():
    """Verify OTP and complete registration"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        user_data = data.get('user_data')
        
        print(f"🔍 Verify OTP request: email={email}, otp={otp}")
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Verify OTP
        verified_user_data = verify_stored_otp(email, otp)
        
        if verified_user_data is None:
            return jsonify({'error': 'Invalid or expired OTP'}), 400
        
        # Check if this is a registration OTP (no user data) or login OTP (has user data)
        if verified_user_data == "VERIFIED":
            # This is a registration OTP verification
            print(f"✅ Registration OTP verified for {email}")
            
            # If user_data was provided, store it for later use in registration
            if user_data:
                print(f"💾 Storing user data for registration: {email}")
                # Keep the original OTP but mark it as verified
                original_otp = otp_storage[email]['otp']
                otp_storage[email] = {
                    'otp': original_otp,  # Keep original OTP
                    'expires_at': time.time() + 600,
                    'user_data': user_data,
                    'verified': True  # Mark as verified
                }
            else:
                # If no user_data provided, just mark as verified
                print(f"💾 Marking OTP as verified for registration: {email}")
                otp_storage[email]['verified'] = True
        elif isinstance(verified_user_data, dict):
            # This is a login OTP verification - should not happen in this endpoint
            print(f"⚠️ Login OTP received in registration endpoint: {email}")
            return jsonify({'error': 'Invalid OTP type for registration'}), 400
        else:
            return jsonify({'error': 'Invalid OTP verification result'}), 400
        
        print(f"✅ Returning success response for OTP verification: {email}")
        return jsonify({
            'message': 'OTP verified successfully',
            'email': email,
            'verified': True
        }), 200  # Explicitly return 200 status
        
    except Exception as e:
        print(f"Error in verify_otp: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/resend-otp', methods=['POST'])
def resend_otp():
    """Resend OTP for email verification"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if there's an existing OTP for this email
        if email in otp_storage:
            # Remove existing OTP
            del otp_storage[email]
        
        # Generate and store new OTP
        otp = store_otp(email)
        
        # Send new OTP via email
        if send_email_otp(email, otp):
            return jsonify({
                'message': 'OTP resent successfully'
            })
        else:
            # If email fails, still return success for testing
            print(f"⚠️ Email resend failed, but returning success for testing: {otp}")
            return jsonify({
                'message': 'OTP resent successfully (demo mode due to email issue)',
                'email_issue': True
            })
            
    except Exception as e:
        print(f"Error in resend_otp: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/forgot-password', methods=['POST'])
def forgot_password():
    """Send password reset OTP"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if user exists
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate and store password reset OTP
        otp = store_password_reset_otp(email)
        
        # Send OTP via email
        if send_email_otp(email, otp):
            print(f"📧 Password reset OTP sent to {email}: {otp}")
            return jsonify({'message': 'Password reset OTP sent successfully'}), 200
        else:
            # If email fails, still return success for testing
            print(f"⚠️ Password reset email failed, but returning success for testing: {otp}")
            return jsonify({
                'message': 'Password reset OTP sent successfully (demo mode due to email issue)',
                'email_issue': True
            })
        
    except Exception as e:
        print(f"❌ Error sending password reset OTP: {str(e)}")
        return jsonify({'error': 'Failed to send password reset OTP'}), 500

@app.route('/api/verify-forgot-password-otp', methods=['POST'])
def verify_forgot_password_otp():
    """Verify password reset OTP"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        
        if not email or not otp:
            return jsonify({'error': 'Email and OTP are required'}), 400
        
        # Verify OTP
        is_valid, message = verify_password_reset_otp(email, otp)
        
        if is_valid:
            return jsonify({'message': 'OTP verified successfully'}), 200
        else:
            return jsonify({'error': message}), 400
        
    except Exception as e:
        print(f"❌ Error verifying password reset OTP: {str(e)}")
        return jsonify({'error': 'Failed to verify OTP'}), 500

@app.route('/api/reset-password', methods=['POST'])
def reset_password():
    """Reset user password"""
    try:
        data = request.get_json()
        email = data.get('email')
        otp = data.get('otp')
        new_password = data.get('newPassword')
        
        if not email or not otp or not new_password:
            return jsonify({'error': 'Email, OTP, and new password are required'}), 400
        
        # Verify OTP first
        is_valid, message = verify_password_reset_otp(email, otp)
        
        if not is_valid:
            return jsonify({'error': message}), 400
        
        # Reset password
        success, message = reset_user_password(email, new_password)
        
        if success:
            return jsonify({'message': 'Password reset successfully'}), 200
        else:
            return jsonify({'error': message}), 400
        
    except Exception as e:
        print(f"❌ Error resetting password: {str(e)}")
        return jsonify({'error': 'Failed to reset password'}), 500

@app.route('/api/resend-forgot-password-otp', methods=['POST'])
def resend_forgot_password_otp():
    """Resend password reset OTP"""
    try:
        data = request.get_json()
        email = data.get('email')
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        # Check if user exists
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Generate and store new password reset OTP
        otp = store_password_reset_otp(email)
        
        # Send OTP via email
        if send_email_otp(email, otp):
            print(f"📧 Password reset OTP resent to {email}: {otp}")
            return jsonify({'message': 'Password reset OTP resent successfully'}), 200
        else:
            # If email fails, still return success for testing
            print(f"⚠️ Password reset email resend failed, but returning success for testing: {otp}")
            return jsonify({
                'message': 'Password reset OTP resent successfully (demo mode due to email issue)',
                'email_issue': True
            })
        
    except Exception as e:
        print(f"❌ Error resending password reset OTP: {str(e)}")
        return jsonify({'error': 'Failed to resend password reset OTP'}), 500

@app.route('/api/parking-status')
def get_parking_status():
    """Get current parking status"""
    return jsonify(parking_data)

@app.route('/api/parking-spaces')
def get_parking_spaces():
    """Get individual parking space status"""
    return jsonify({
        'spaces': individual_spaces,
        'total_spaces': len(individual_spaces),
        'timestamp': time.time()
    })

@app.route('/api/reservations', methods=['GET'])
def get_reservations():
    """Get all current reservations"""
    return jsonify({
        'reservations': reservations,
        'total_reservations': len(reservations)
    })

@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    """Create a new reservation"""
    try:
        data = request.get_json()
        space_id = data.get('space_id')
        user_name = data.get('user_name')
        duration_minutes = data.get('duration_minutes', 60)
        
        print(f"Creating reservation: Space {space_id}, User {user_name}, Duration {duration_minutes}")
        
        if not space_id or not user_name:
            return jsonify({'error': 'Space ID and user name are required'}), 400
        
        # Check if space exists
        if space_id < 1 or space_id > len(posList):
            return jsonify({'error': 'Invalid space ID'}), 400
        
        # Check if space is already reserved
        if space_id in reservations:
            return jsonify({'error': 'Space is already reserved'}), 409
        
        # Create reservation
        reservations[space_id] = {
            'user_name': user_name,
            'reserved_at': time.time(),
            'duration_minutes': duration_minutes,
            'expires_at': time.time() + (duration_minutes * 60)
        }
        
        print(f"Reservation created successfully. Current reservations: {reservations}")
        
        return jsonify({
            'message': 'Reservation created successfully',
            'reservation': reservations[space_id]
        }), 201
        
    except Exception as e:
        print(f"Error creating reservation: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/reservations/<int:space_id>', methods=['DELETE'])
def cancel_reservation(space_id):
    """Cancel a reservation"""
    try:
        if space_id in reservations:
            del reservations[space_id]
            return jsonify({'message': 'Reservation cancelled successfully'}), 200
        else:
            return jsonify({'error': 'Reservation not found'}), 404
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/video-frame')
def get_video_frame():
    """Get current video frame as base64"""
    if current_frame is not None:
        frame_b64 = frame_to_base64(current_frame)
        return jsonify({
            'frame': frame_b64,
            'timestamp': time.time()
        })
    else:
        return jsonify({'error': 'No frame available'})

@app.route('/api/health')
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'parking_spaces_loaded': len(posList)})

def start_video_processing():
    """Start video processing in background thread"""
    thread = threading.Thread(target=process_video, daemon=True)
    thread.start()
    return thread

if __name__ == '__main__':
    # Load parking positions
    total_spaces = load_parking_positions()
    if total_spaces == 0:
        print("No parking spaces loaded. Please run ParkingSpacePicker.py first.")
        exit(1)
    
    print(f"Loaded {total_spaces} parking spaces")
    
    # Start video processing
    video_thread = start_video_processing()
    
    # Start Flask server
    print("Starting Flask server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=False, threaded=True) 