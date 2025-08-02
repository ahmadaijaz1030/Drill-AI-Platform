# API Documentation
## Drill AI Intelligence Platform

This document provides comprehensive API documentation for the Drill AI Intelligence Platform backend services.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Endpoints](#endpoints)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## 🌐 Overview

The Drill AI Intelligence Platform API provides RESTful endpoints for:
- **Well Data Management**: Upload, retrieve, and manage drilling data
- **File Processing**: Handle Excel and CSV file uploads
- **AI Integration**: Chatbot functionality with OpenAI
- **Health Monitoring**: System status and health checks

### API Version
Current version: `v1`

### Content Type
All requests and responses use `application/json` except for file uploads which use `multipart/form-data`.

---

## 🔐 Authentication

Currently, the API uses API key authentication for sensitive operations.

### API Key Header
```
X-API-Key: your_api_key_here
```

### Environment Variables
API keys are configured through environment variables:
```bash
OPENAI_API_KEY=your_openai_api_key
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
```

---

## 🌍 Base URL

### Development
```
http://localhost:5000/api
```

### Staging
```
https://staging-api.drill-ai.com/api
```

### Production
```
https://api.drill-ai.com/api
```

---

## 📡 Endpoints

### 1. Health Check

#### GET /health
Check the health status of the API server.

**Request:**
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "environment": "production"
}
```

**Status Codes:**
- `200 OK`: Server is healthy
- `503 Service Unavailable`: Server is unhealthy

---

### 2. Well Management

#### GET /wells
Retrieve all wells with their metadata.

**Request:**
```http
GET /api/wells
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "well-001",
      "name": "Well Alpha",
      "depth": 8500,
      "location": {
        "latitude": 29.7604,
        "longitude": -95.3698
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "hasData": true
    },
    {
      "id": "well-002",
      "name": "Well Beta",
      "depth": 9200,
      "location": {
        "latitude": 29.7604,
        "longitude": -95.3698
      },
      "createdAt": "2024-01-15T11:00:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z",
      "hasData": false
    }
  ],
  "total": 2
}
```

#### GET /wells/:id
Retrieve specific well data by ID.

**Request:**
```http
GET /api/wells/well-001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "well-001",
    "name": "Well Alpha",
    "depth": 8500,
    "location": {
      "latitude": 29.7604,
      "longitude": -95.3698
    },
    "drillingData": [
      {
        "depth": 1000,
        "sh": 25.5,
        "ss": 30.2,
        "ls": 15.8,
        "dol": 8.5,
        "anh": 12.0,
        "coal": 2.0,
        "salt": 6.0,
        "dt": 65.2,
        "gr": 45.8,
        "minfinal": 120.5,
        "ucs": 85.3,
        "fa": 92.1,
        "rat": 15.2,
        "rop": 25.8
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Status Codes:**
- `200 OK`: Well data retrieved successfully
- `404 Not Found`: Well not found
- `500 Internal Server Error`: Server error

---

### 3. File Upload

#### POST /upload
Upload Excel or CSV files containing drilling data.

**Request:**
```http
POST /api/upload
Content-Type: multipart/form-data

Form Data:
- file: [Excel/CSV file]
- wellId: "well-001" (optional)
```

**Response:**
```json
{
  "success": true,
  "message": "File uploaded and processed successfully",
  "data": {
    "filename": "drilling_data_2024.csv",
    "wellId": "well-001",
    "recordsProcessed": 150,
    "fileSize": 2048576,
    "processingTime": 2.5,
    "uploadedAt": "2024-01-15T10:30:00.000Z",
    "s3Url": "https://drill-ai-data-storage.s3.amazonaws.com/well-001/drilling_data_2024.csv"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Invalid file format. Only Excel (.xlsx, .xls) and CSV files are supported.",
  "code": "INVALID_FILE_FORMAT"
}
```

**Status Codes:**
- `200 OK`: File uploaded successfully
- `400 Bad Request`: Invalid file format or missing file
- `413 Payload Too Large`: File size exceeds limit (10MB)
- `500 Internal Server Error`: Processing error

**File Requirements:**
- **Supported Formats**: Excel (.xlsx, .xls) and CSV
- **Maximum Size**: 10MB
- **Required Columns**: DEPTH, %SH, %SS, %LS, %DOL, %ANH, %Coal, %Salt, DT, GR, MINFINAL, UCS, FA, RAT, ROP

---

### 4. AI Chatbot

#### POST /chat
Send messages to the AI chatbot for drilling-related queries.

**Request:**
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Analyze the drilling data for Well Alpha",
  "context": {
    "wellId": "well-001",
    "dataType": "drilling_analysis"
  },
  "voiceData": "base64_encoded_audio" (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Based on the drilling data for Well Alpha, I can see several important patterns...",
    "confidence": 0.95,
    "suggestions": [
      "Consider adjusting drilling parameters at depth 5000ft",
      "Monitor GR values for potential formation changes"
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "processingTime": 1.2
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Unable to process voice input. Please try again.",
  "code": "VOICE_PROCESSING_ERROR"
}
```

**Status Codes:**
- `200 OK`: Message processed successfully
- `400 Bad Request`: Invalid message format
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: AI service error

---

### 5. Data Analysis

#### GET /analysis/:wellId
Get comprehensive analysis for a specific well.

**Request:**
```http
GET /api/analysis/well-001
```

**Response:**
```json
{
  "success": true,
  "data": {
    "wellId": "well-001",
    "analysis": {
      "rockComposition": {
        "shale": 25.5,
        "sandstone": 30.2,
        "limestone": 15.8,
        "dolomite": 8.5,
        "anhydrite": 12.0,
        "coal": 2.0,
        "salt": 6.0
      },
      "drillingParameters": {
        "averageDT": 65.2,
        "averageGR": 45.8,
        "maxROP": 35.2,
        "minROP": 12.5
      },
      "recommendations": [
        "Optimize drilling parameters at depth 3000-4000ft",
        "Monitor formation changes at depth 6000ft"
      ]
    },
    "generatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## ⚠️ Error Handling

### Error Response Format
All error responses follow this format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `INVALID_FILE_FORMAT` | Unsupported file type | 400 |
| `FILE_TOO_LARGE` | File exceeds size limit | 413 |
| `MISSING_REQUIRED_FIELD` | Required field not provided | 400 |
| `WELL_NOT_FOUND` | Well ID not found | 404 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `AI_SERVICE_ERROR` | OpenAI service error | 500 |
| `AWS_SERVICE_ERROR` | AWS service error | 500 |
| `INTERNAL_SERVER_ERROR` | Unexpected server error | 500 |

---

## 🚦 Rate Limiting

### Limits
- **File Upload**: 10 requests per minute
- **AI Chat**: 50 requests per minute
- **Data Retrieval**: 100 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 50
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642236000
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later.",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 60
}
```

---

## 📝 Examples

### JavaScript/Node.js

#### Upload File
```javascript
const FormData = require('form-data');
const fs = require('fs');

const formData = new FormData();
formData.append('file', fs.createReadStream('drilling_data.csv'));
formData.append('wellId', 'well-001');

const response = await fetch('https://api.drill-ai.com/api/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'X-API-Key': 'your_api_key'
  }
});

const result = await response.json();
console.log(result);
```

#### Chat with AI
```javascript
const response = await fetch('https://api.drill-ai.com/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
  },
  body: JSON.stringify({
    message: 'Analyze the drilling data for Well Alpha',
    context: {
      wellId: 'well-001',
      dataType: 'drilling_analysis'
    }
  })
});

const result = await response.json();
console.log(result.data.message);
```

#### Get Well Data
```javascript
const response = await fetch('https://api.drill-ai.com/api/wells/well-001', {
  headers: {
    'X-API-Key': 'your_api_key'
  }
});

const result = await response.json();
console.log(result.data);
```

### Python

#### Upload File
```python
import requests

url = 'https://api.drill-ai.com/api/upload'
files = {'file': open('drilling_data.csv', 'rb')}
data = {'wellId': 'well-001'}
headers = {'X-API-Key': 'your_api_key'}

response = requests.post(url, files=files, data=data, headers=headers)
result = response.json()
print(result)
```

#### Chat with AI
```python
import requests

url = 'https://api.drill-ai.com/api/chat'
headers = {
    'Content-Type': 'application/json',
    'X-API-Key': 'your_api_key'
}
data = {
    'message': 'Analyze the drilling data for Well Alpha',
    'context': {
        'wellId': 'well-001',
        'dataType': 'drilling_analysis'
    }
}

response = requests.post(url, json=data, headers=headers)
result = response.json()
print(result['data']['message'])
```

### cURL

#### Health Check
```bash
curl -X GET https://api.drill-ai.com/api/health
```

#### Upload File
```bash
curl -X POST https://api.drill-ai.com/api/upload \
  -H "X-API-Key: your_api_key" \
  -F "file=@drilling_data.csv" \
  -F "wellId=well-001"
```

#### Chat with AI
```bash
curl -X POST https://api.drill-ai.com/api/chat \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "message": "Analyze the drilling data for Well Alpha",
    "context": {
      "wellId": "well-001",
      "dataType": "drilling_analysis"
    }
  }'
```

---

## 🔧 SDKs and Libraries

### Official SDKs
- **JavaScript/Node.js**: Available via npm
- **Python**: Available via pip
- **Java**: Available via Maven

### Third-party Libraries
- **Postman Collection**: Available for testing
- **OpenAPI Specification**: Available for code generation

---

## 📊 Monitoring

### Health Check Endpoint
Monitor API health using the `/health` endpoint:

```bash
# Check API health
curl https://api.drill-ai.com/api/health

# Expected response
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Metrics
- **Response Time**: Average response time in milliseconds
- **Error Rate**: Percentage of failed requests
- **Throughput**: Requests per second
- **Availability**: Uptime percentage

---

## 🔒 Security

### HTTPS
All API endpoints require HTTPS in production.

### API Key Security
- Store API keys securely
- Rotate keys regularly
- Use environment variables
- Never commit keys to version control

### CORS
CORS is configured for authorized domains only.

---

## 📞 Support

### Documentation
- **API Reference**: This document
- **SDK Documentation**: Available for each language
- **Examples**: Code examples and tutorials

### Support Channels
- **Email**: api-support@drill-ai.com
- **Documentation**: https://docs.drill-ai.com
- **Status Page**: https://status.drill-ai.com

### Rate Limits
- **Free Tier**: 1,000 requests/month
- **Professional**: 10,000 requests/month
- **Enterprise**: Custom limits

---

This API documentation provides comprehensive information for integrating with the Drill AI Intelligence Platform backend services. 