import { signAccessToken } from "./src/utils/jwt";

// Create a valid JWT token for testing
const payload = { id: 1, role: "admin" };
const token = signAccessToken(payload);

console.log("Generated JWT Token:");
console.log(token);

// Also show the curl command for easy copy-paste
console.log("\nCurl command to test API:");
console.log(`curl -X GET "http://localhost:3600/partner/departments/facility?facility_id=1" -H "Content-Type: application/json" -H "Authorization: Bearer ${token}"`);
