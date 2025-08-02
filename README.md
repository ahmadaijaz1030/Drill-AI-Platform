# Drill AI Intelligence Platform

A comprehensive AI-powered oil drilling data management platform built with React, Node.js, and AWS services.

## 🚀 Features

- **Well Management**: Interactive well list with depth and location data
- **Data Visualization**: Real-time charts for rock composition, DT, and GR data
- **File Upload**: Drag-and-drop Excel/CSV file upload with progress tracking
- **AI Chatbot**: Intelligent drilling assistant with OpenAI integration
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **AWS Integration**: S3 for file storage, DynamoDB for metadata

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Styled Components** - CSS-in-JS styling
- **Recharts** - Data visualization
- **React Dropzone** - File upload handling
- **React Hot Toast** - User notifications
- **Axios** - HTTP client

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Multer** - File upload middleware
- **XLSX** - Excel/CSV file processing
- **AWS SDK** - Cloud services integration
- **OpenAI API** - AI chatbot integration

### Cloud Services
- **AWS S3** - File storage
- **AWS DynamoDB** - NoSQL database
- **OpenAI GPT** - AI chatbot

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- AWS Account with S3 and DynamoDB access
- OpenAI API key

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd oil-drilling-app
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=oil-drilling-data
   AWS_DYNAMODB_TABLE=WellData
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up AWS resources**
   - Create an S3 bucket named `oil-drilling-data`
   - Create a DynamoDB table named `WellData` with partition key `id` (String)
   - Configure CORS on S3 bucket if needed

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🚀 Deployment

### Quick Start
```bash
# Install dependencies
npm run install-all

# Configure environment
cp env.example .env
# Edit .env with your credentials

# Start development
npm run dev
```

### Production Deployment
- **AWS Elastic Beanstalk**: Full-stack deployment
- **AWS S3 + CloudFront**: Static hosting
- **Docker**: Containerized deployment
- **GitHub Actions**: Automated CI/CD pipeline

See `.github/workflows/deploy.yml` for deployment configuration.

## 📊 API Endpoints

- `GET /api/wells` - Get all wells
- `GET /api/wells/:id` - Get specific well
- `POST /api/upload` - Upload Excel/CSV file
- `POST /api/chat` - Send message to AI chatbot
- `GET /api/health` - Server health status

## 🎨 Features

- **Well List Panel**: Interactive well selection with depth and location
- **Dashboard**: Real-time charts for rock composition, DT, and GR data
- **Chatbot**: AI-powered responses with drilling expertise
- **File Upload**: Drag-and-drop Excel/CSV upload with progress tracking
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🔒 Security

- Input validation and sanitization
- File type checking (Excel/CSV only)
- 10MB file size limit
- CORS configuration
- Comprehensive error handling 