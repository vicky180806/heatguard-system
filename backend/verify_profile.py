import requests
import sys

BASE_URL = "http://localhost:5000/api"

def verify():
    # 1. Login to get token
    print("1. Attempting Login...")
    try:
        # Create a test user if needed, or just try to login with known credentials
        # We'll assume the user created one, or we can try to register one.
        # Let's try to register a test user first to be sure.
        reg_data = {
            "name": "Test User",
            "email": "test@example.com",
            "password": "password123"
        }
        requests.post(f"{BASE_URL}/auth/register", json=reg_data) # Ignore error if exists
        
        # Login
        login_data = {
            "email": "test@example.com",
            "password": "password123"
        }
        res = requests.post(f"{BASE_URL}/auth/login", json=login_data)
        
        if res.status_code != 200:
            print(f"Login failed: {res.status_code} {res.text}")
            return
            
        token = res.json().get('access_token')
        print(f"Login successful. Token: {token[:10]}...")
        
        # 2. Fetch Profile
        print("\n2. Fetching Profile...")
        headers = {"Authorization": f"Bearer {token}"}
        
        # Try without slash
        url = f"{BASE_URL}/profile"
        print(f"Requesting: {url}")
        res = requests.get(url, headers=headers)
        print(f"Response: {res.status_code}")
        print(res.text)
        
        if res.status_code == 200:
            print("\nSUCCESS: Profile endpoint is working!")
        else:
            print("\nFAILURE: Profile endpoint returned error.")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify()
