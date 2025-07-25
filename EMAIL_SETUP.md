# 📧 Email Setup Guide for SmartPark OTP System

## 🚀 Quick Setup (3 Steps)

### Step 1: Choose Your Email Provider

**For Gmail:**
1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Generate an "App Password" (not your regular password)
4. Use these settings in `backend.py`:
   ```python
   SMTP_SERVER = "smtp.gmail.com"
   SMTP_PORT = 587
   SMTP_USERNAME = "your-gmail@gmail.com"
   SMTP_PASSWORD = "your-16-digit-app-password"
   ENABLE_REAL_EMAIL = True
   ```

**For Outlook/Hotmail:**
```python
SMTP_SERVER = "smtp-mail.outlook.com"
SMTP_PORT = 587
SMTP_USERNAME = "your-email@outlook.com"
SMTP_PASSWORD = "your-password"
ENABLE_REAL_EMAIL = True
```

**For Yahoo:**
```python
SMTP_SERVER = "smtp.mail.yahoo.com"
SMTP_PORT = 587
SMTP_USERNAME = "your-email@yahoo.com"
SMTP_PASSWORD = "your-app-password"
ENABLE_REAL_EMAIL = True
```

### Step 2: Update backend.py

Find these lines in `backend.py` (around line 30):
```python
SMTP_USERNAME = "your-email@gmail.com"  # Replace with your email
SMTP_PASSWORD = "your-app-password"     # Replace with your app password
ENABLE_REAL_EMAIL = False
```

Change them to:
```python
SMTP_USERNAME = "your-actual-email@gmail.com"
SMTP_PASSWORD = "your-actual-app-password"
ENABLE_REAL_EMAIL = True
```

### Step 3: Restart the Backend

Stop the current backend (Ctrl+C) and restart it:
```bash
python backend.py
```

## 🔧 Gmail App Password Setup (Detailed)

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/
   - Click "Security"

2. **Enable 2-Step Verification**
   - Find "2-Step Verification" and turn it ON
   - Follow the setup process

3. **Generate App Password**
   - Go back to Security
   - Click "App passwords" (under 2-Step Verification)
   - Select "Mail" and "Other (Custom name)"
   - Name it "SmartPark"
   - Copy the 16-character password

4. **Use the App Password**
   - Replace `SMTP_PASSWORD` with the 16-character app password
   - Keep your regular Gmail password unchanged

## 🧪 Test Your Setup

1. **Start the backend** with real email enabled
2. **Go to the frontend** (http://localhost:3000)
3. **Try registering** with your real email address
4. **Check your email** for the OTP code
5. **Enter the OTP** to complete registration

## 🔒 Security Notes

- ✅ **App Passwords** are more secure than regular passwords
- ✅ **2-Factor Authentication** is required for app passwords
- ✅ **OTP codes expire** after 10 minutes
- ✅ **One-time use** - each OTP can only be used once

## 🆘 Troubleshooting

**"Authentication failed" error:**
- Make sure you're using an App Password, not your regular password
- Verify 2-Factor Authentication is enabled
- Check that your email and password are correct

**"Connection refused" error:**
- Check your internet connection
- Verify the SMTP server and port are correct
- Some networks block SMTP - try a different network

**Email not received:**
- Check your spam/junk folder
- Verify the email address is correct
- Wait a few minutes - emails can be delayed

## 📱 Demo Mode

If you want to test without setting up email:
```python
ENABLE_REAL_EMAIL = False
```

The OTP will be displayed in the console/terminal instead of being sent via email.

---

**🎉 That's it!** Once configured, users will receive beautiful HTML emails with their OTP codes for verification. 