import requests
import json

# Test the reservation API
def test_reservation():
    # Test creating a reservation
    reservation_data = {
        'space_id': 1,
        'user_name': 'Test User',
        'duration_minutes': 60
    }
    
    print("Testing reservation creation...")
    response = requests.post('http://localhost:5000/api/reservations', 
                           json=reservation_data)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test getting all reservations
    print("\nTesting get reservations...")
    response = requests.get('http://localhost:5000/api/reservations')
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test getting parking spaces
    print("\nTesting get parking spaces...")
    response = requests.get('http://localhost:5000/api/parking-spaces')
    print(f"Status Code: {response.status_code}")
    data = response.json()
    print(f"Total spaces: {data['total_spaces']}")
    
    # Check if space 1 is reserved
    space_1 = next((space for space in data['spaces'] if space['id'] == 1), None)
    if space_1:
        print(f"Space 1 status: {space_1['status']}")
        print(f"Space 1 is_reserved: {space_1['is_reserved']}")
        if space_1['reservation_info']:
            print(f"Reservation info: {space_1['reservation_info']}")

if __name__ == "__main__":
    test_reservation() 