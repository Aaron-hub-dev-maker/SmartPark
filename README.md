SmartPark

AI-powered intelligent parking management system with real-time parking space detection, live dashboard, user authentication, reservations, and analytics.

Project Overview
SmartPark is a full-stack smart parking solution that leverages computer vision and modern web technologies to provide real-time parking space monitoring, analytics, and management. The system is designed to optimize parking utilization, reduce congestion, and enhance user experience in parking facilities.

Features
- Real-time Parking Detection: AI-powered computer vision detects available and occupied spaces from live video feed
- Live Dashboard: Interactive dashboard with occupancy rates, analytics, and parking map
- User Authentication: Secure login, registration, email OTP verification, and password reset
- Parking Reservations: Book and manage parking spaces in real-time
- Analytics & Reporting: Insights into parking utilization and trends
- Responsive UI: Modern, mobile-friendly interface with smooth animations

Tech Stack
- Frontend: React.js, Tailwind CSS, Framer Motion
- Backend: Python Flask, OpenCV
- Database: SQLite
- Email Integration: SMTP for OTP verification

Requirements
- Python 3.8 or above
- Node.js 14.x or above
- npm (Node Package Manager)
- Git (for cloning repository)
- Virtualenv (optional, for isolated Python environments)
- A webcam or IP camera (for live parking space detection)
- SMTP email credentials (for OTP functionality)
- Google Chrome or any modern browser

Getting Started

Prerequisites
Make sure the following are installed on your system:
- Python 3.8+
- Node.js and npm
- Git
- Virtual Environment (Recommended for Python)

Step 1: Clone the Repository
git clone https://github.com/yourusername/SmartPark.git
cd SmartPark

Step 2: Set Up the Backend
cd backend
python -m venv venv
source venv/bin/activate         # On Windows: venv\Scripts\activate
pip install -r requirements.txt

Step 3: Set Up the Frontend
cd ../frontend
npm install

If you are using an .env file for frontend environment variables, configure it now:
REACT_APP_BACKEND_URL=http://localhost:5000

Step 4: Configure Email for OTP (Optional but Recommended)
In your backend's config file or .env, configure the SMTP settings:

EMAIL_HOST=smtp.yourprovider.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password

Step 5: Run the Application

Start Backend
cd backend
python backend.py

Start Frontend
cd ../frontend
npm start

Step 6: Access the Application
Open your browser and visit:
http://localhost:3000

Functions
- Register or log in using a demo or real account
- Use OTP for email verification
- View live parking slot status
- Make or cancel parking reservations
- Check analytics and usage reports
- Use the forgot password feature to reset securely


SmartPark – Making parking smarter, one spot at a time.

