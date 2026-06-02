# Postman Examples for createUserCertification API

## 📋 Endpoint Information
- **Method**: `POST`
- **URL**: `{{base_url}}/user-certifications`
- **Base URL**: `http://localhost:3000` (adjust according to your server)

---

## 🔐 Authentication (if required)
Add to Headers:
```
Authorization: Bearer {{your_token_here}}
```

---

## 📝 Test Case 1: Create Certification WITHOUT File (Auto-generate Document Number)

### Request Type: `application/json`

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "certification_id": 1,
  "institution_id": 1,
  "start_date": "2024-01-01",
  "graduate_date": "2024-12-31",
  "user_id": 123
}
```

**Expected Response:**
```json
{
  "user_certification": {
    "id": 1,
    "user_id": 123,
    "certification_id": 1,
    "institution_id": 1,
    "document_url": null,
    "document_id": null,
    "document_number": "SPL_CERT_24_0001",
    "start_date": "2024-01-01",
    "graduate_date": "2024-12-31",
    "is_active": true,
    "created_by": 123,
    "updated_by": 123,
    "created_at": "2024-09-24T10:30:00.000Z",
    "updated_at": "2024-09-24T10:30:00.000Z"
  }
}
```

---

## 📝 Test Case 2: Create Certification WITH Custom Document Number

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "certification_id": 2,
  "institution_id": 1,
  "start_date": "2024-02-01",
  "graduate_date": "2024-11-30",
  "document_number": "CUSTOM_CERT_001",
  "user_id": 456
}
```

---

## 📝 Test Case 3: Create Certification WITH File Upload

### Request Type: `multipart/form-data`

**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**

| Key | Type | Value |
|-----|------|-------|
| `file` | File | Select a file (must follow naming: `123_certificate.pdf`) |
| `certification_id` | Text | `1` |
| `institution_id` | Text | `1` |
| `start_date` | Text | `2024-01-01` |
| `graduate_date` | Text | `2024-12-31` |
| `user_id` | Text | `123` |

**File Naming Convention:**
- Format: `{user_id}_{filename}.{ext}`
- Examples: 
  - `123_certificate.pdf`
  - `456_diploma.jpg`
  - `789_license.png`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "user_id": 123,
    "certification_id": 1,
    "institution_id": 1,
    "document_url": null,
    "document_id": 15,
    "document_number": "SPL_CERT_24_0002",
    "start_date": "2024-01-01",
    "graduate_date": "2024-12-31",
    "is_active": true,
    "certification_info": {
      "id": 1,
      "certification_name": "Example Certification"
    },
    "institution_info": {
      "id": 1,
      "institution_name": "Example Institution"
    }
  },
  "document_id": 15,
  "message": "User certification created successfully"
}
```

---

## 📝 Test Case 4: Create Certification with All Optional Fields

**Headers:**
```
Content-Type: application/json
```

**Body (raw JSON):**
```json
{
  "certification_id": 3,
  "institution_id": 2,
  "start_date": "2023-09-01",
  "graduate_date": "2024-06-30",
  "document_number": "MASTER_CERT_2024",
  "document_url": "https://example.com/certificate.pdf",
  "user_id": 789
}
```

---

## 🧪 Postman Collection Setup

### Environment Variables:
```json
{
  "base_url": "http://localhost:3000",
  "token": "your_jwt_token_here"
}
```

### Pre-request Script (if using authentication):
```javascript
// If you need to get a fresh token
pm.sendRequest({
    url: pm.environment.get("base_url") + "/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            "username": "test@example.com",
            "password": "password123"
        })
    }
}, function (err, res) {
    if (!err && res.json().token) {
        pm.environment.set("token", res.json().token);
    }
});
```

### Tests Script:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has user_certification", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('user_certification');
});

pm.test("Document number is auto-generated", function () {
    var jsonData = pm.response.json();
    if (jsonData.user_certification) {
        pm.expect(jsonData.user_certification.document_number).to.match(/^SPL_CERT_\d{2}_\d{4}$/);
    }
});
```

---

## 🚨 Common Error Responses

### 400 Bad Request - Missing User ID:
```json
{
  "error": "User ID is missing."
}
```

### 400 Bad Request - Invalid File Format:
```json
{
  "error": "Filename must follow format: <user_id>_filename.ext (e.g. 12345_resume.pdf)"
}
```

### 400 Bad Request - Unsupported File Type:
```json
{
  "error": "Unsupported file type"
}
```

---

## 📊 Testing Checklist

- [ ] Test without file (auto document number)
- [ ] Test with custom document number
- [ ] Test with file upload (various formats: PDF, PNG, JPG)
- [ ] Test file naming validation
- [ ] Test unsupported file types
- [ ] Test missing required fields
- [ ] Test authentication (if applicable)
- [ ] Verify watermark is applied to uploaded files
- [ ] Verify UserDocument is created with document_type_id = 1
- [ ] Verify document_id is linked properly

---

## 🔍 Document Number Pattern Verification

The auto-generated document numbers follow this pattern:
- Format: `SPL_CERT_YY_NNNN`
- Example: `SPL_CERT_24_0001`, `SPL_CERT_24_0002`
- Year-based sequential numbering
- Unique per year

---

## 📱 Quick Test Files

Create these test files for upload testing:

1. **123_test-certificate.pdf** - Valid PDF
2. **456_diploma.jpg** - Valid Image
3. **invalid_name.pdf** - Invalid naming (should fail)
4. **789_license.txt** - Unsupported format (should fail)