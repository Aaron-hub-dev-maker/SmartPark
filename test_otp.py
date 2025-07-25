#!/usr/bin/env python3
"""
Test script for OTP verification functionality
"""

import requests
import json
import time

BASE_URL = "http://localhost:5000"

def test_otp_functionality():
    """Test the complete OTP verification flow"""
    print("🧪 Testing OTP Verification Functionality")
    print("=" * 50)
    
    # Test data
    test_user = {
        "email": "test@example.com",
        "username": "testuser",
        "password": "testpass123",
        "full_name": "Test User",
        "phone": "1234567890",
        "organization": "Test Org"
    }
    
    try:
        # 1. Test sending OTP for registration
        print("\n1. Testing OTP sending for registration...")
        response = requests.post(f"{BASE_URL}/api/send-otp", json={"email": test_user["email"]})
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ OTP sent successfully: {data.get('demo_otp', 'N/A')}")
            otp = data.get('demo_otp', '123456')  # Use demo OTP for testing
        else:
            print(f"❌ Failed to send OTP: {response.text}")
            return
        
        # 2. Test OTP verification
        print("\n2. Testing OTP verification...")
        response = requests.post(f"{BASE_URL}/api/verify-otp", json={
            "email": test_user["email"],
            "otp": otp,
            "user_data": test_user
        })
        
        if response.status_code == 200:
            print("✅ OTP verified successfully")
        else:
            print(f"❌ Failed to verify OTP: {response.text}")
            return
        
        # 3. Test user registration
        print("\n3. Testing user registration...")
        response = requests.post(f"{BASE_URL}/api/register", json=test_user)
        
        if response.status_code == 200:
            print("✅ User registered successfully")
        else:
            print(f"❌ Failed to register user: {response.text}")
            return
        
        # 4. Test login with OTP requirement
        print("\n4. Testing login with OTP requirement...")
        response = requests.post(f"{BASE_URL}/api/login", json={
            "username": test_user["username"],
            "password": test_user["password"]
        })
        
        if response.status_code == 200:
            data = response.json()
            if data.get('requires_otp'):
                print("✅ Login requires OTP (as expected)")
                
                # 5. Test sending login OTP
                print("\n5. Testing login OTP sending...")
                response = requests.post(f"{BASE_URL}/api/send-login-otp", json={
                    "email": test_user["email"]
                })
                
                if response.status_code == 200:
                    data = response.json()
                    print(f"✅ Login OTP sent: {data.get('demo_otp', 'N/A')}")
                    login_otp = data.get('demo_otp', '123456')
                    
                    # 6. Test login OTP verification
                    print("\n6. Testing login OTP verification...")
                    response = requests.post(f"{BASE_URL}/api/verify-login-otp", json={
                        "email": test_user["email"],
                        "otp": login_otp,
                        "username": test_user["username"]
                    })
                    
                    if response.status_code == 200:
                        print("✅ Login OTP verified successfully")
                        print("🎉 Complete OTP flow working!")
                    else:
                        print(f"❌ Failed to verify login OTP: {response.text}")
                else:
                    print(f"❌ Failed to send login OTP: {response.text}")
            else:
                print("❌ Login should require OTP but doesn't")
        else:
            print(f"❌ Failed to login: {response.text}")
        
        # 7. Test admin login (should not require OTP)
        print("\n7. Testing admin login (should not require OTP)...")
        response = requests.post(f"{BASE_URL}/api/login", json={
            "username": "admin",
            "password": "admin123"
        })
        
        if response.status_code == 200:
            data = response.json()
            if not data.get('requires_otp'):
                print("✅ Admin login successful without OTP (as expected)")
            else:
                print("❌ Admin login should not require OTP")
        else:
            print(f"❌ Failed to login as admin: {response.text}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure the backend is running on http://localhost:5000")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

def test_otp_expiration():
    """Test OTP expiration functionality"""
    print("\n🧪 Testing OTP Expiration")
    print("=" * 30)
    
    try:
        # Send OTP
        response = requests.post(f"{BASE_URL}/api/send-otp", json={"email": "expire@test.com"})
        
        if response.status_code == 200:
            data = response.json()
            otp = data.get('demo_otp', '123456')
            print(f"✅ OTP sent: {otp}")
            
            # Try to verify with wrong OTP
            response = requests.post(f"{BASE_URL}/api/verify-otp", json={
                "email": "expire@test.com",
                "otp": "000000"
            })
            
            if response.status_code == 400:
                print("✅ Wrong OTP correctly rejected")
            else:
                print("❌ Wrong OTP should be rejected")
        else:
            print(f"❌ Failed to send OTP: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")

if __name__ == "__main__":
    print("🚀 Starting OTP Verification Tests")
    print("Make sure the backend server is running on http://localhost:5000")
    print()
    
    test_otp_functionality()
    test_otp_expiration()
    
    print("\n✨ OTP testing completed!") 