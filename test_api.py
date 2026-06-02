#!/usr/bin/env python3
import requests
import json

# Test facilities API
url = "http://localhost:3600/facilities"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJkZXZlbG9wZXIiLCJpYXQiOjE3NTY1NzkxMjYsImV4cCI6MTc2MDQ2NzEyNn0.NzqXKErKCed147yKZ-tpRtQY5UOkttwpnIKP2HLPK44"
}

try:
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if data and len(data) > 0:
            first_facility = data[0]
            print(f"\nFirst facility:")
            print(f"ID: {first_facility.get('id')}")
            print(f"Name: {first_facility.get('name')}")
            print(f"Address: {first_facility.get('address')}")
            
            # Check user data
            created_by_user = first_facility.get('created_by_user')
            updated_by_user = first_facility.get('updated_by_user')
            
            print(f"\nCreated by user:")
            if created_by_user:
                print(f"  ID: {created_by_user.get('id')}")
                print(f"  Email: {created_by_user.get('email')}")
                print(f"  First Name: {created_by_user.get('first_name')}")
                print(f"  Last Name: {created_by_user.get('last_name')}")
                print(f"  Phone: {created_by_user.get('phone')}")
            else:
                print("  No created_by_user data")
            
            print(f"\nUpdated by user:")
            if updated_by_user:
                print(f"  ID: {updated_by_user.get('id')}")
                print(f"  Email: {updated_by_user.get('email')}")
                print(f"  First Name: {updated_by_user.get('first_name')}")
                print(f"  Last Name: {updated_by_user.get('last_name')}")
                print(f"  Phone: {updated_by_user.get('phone')}")
            else:
                print("  No updated_by_user data")
        else:
            print("No facilities data returned")
    else:
        print(f"Error: {response.text}")

except Exception as e:
    print(f"Error: {e}")
