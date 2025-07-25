#!/usr/bin/env python3
"""
SmartPark System Startup Script
This script starts the Flask backend for the parking detection system.
"""

import subprocess
import sys
import time
import os

def check_dependencies():
    """Check if required dependencies are installed"""
    try:
        import flask
        import cv2
        import cvzone
        import numpy
        import PIL
        print("✅ All dependencies are installed")
        return True
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("Please install dependencies with: pip install -r requirements.txt")
        return False

def check_files():
    """Check if required files exist"""
    required_files = ['carPark.mp4', 'CarParkPos']
    missing_files = []
    
    for file in required_files:
        if not os.path.exists(file):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Missing files: {', '.join(missing_files)}")
        print("Please ensure all required files are in the current directory")
        return False
    
    print("✅ All required files found")
    return True

def start_backend():
    """Start the Flask backend server"""
    print("\n🚀 Starting SmartPark Backend Server...")
    print("=" * 50)
    
    try:
        # Start the Flask backend
        subprocess.run([sys.executable, "backend.py"], check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Backend server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Error starting backend: {e}")
    except FileNotFoundError:
        print("\n❌ backend.py not found. Please ensure the file exists.")

def main():
    """Main function"""
    print("🏢 SmartPark Parking Detection System")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        return
    
    # Check required files
    if not check_files():
        return
    
    print("\n📋 System Requirements:")
    print("- Python 3.7+ with required packages")
    print("- carPark.mp4 video file")
    print("- CarParkPos pickle file")
    print("- React frontend running on port 3000")
    
    print("\n🌐 Frontend Instructions:")
    print("1. Open a new terminal window")
    print("2. Navigate to this directory")
    print("3. Run: npm start")
    print("4. Open browser to: http://localhost:3000")
    print("5. Go to 'Live Monitoring' page")
    
    print("\n🔧 Backend Instructions:")
    print("- This script will start the Flask backend on port 5000")
    print("- The backend processes the video with OpenCV")
    print("- Real-time parking detection data will be available")
    print("- Press Ctrl+C to stop the backend")
    
    input("\nPress Enter to start the backend server...")
    
    # Start the backend
    start_backend()

if __name__ == "__main__":
    main() 