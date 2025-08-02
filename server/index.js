const express = require('express');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const AWS = require('aws-sdk');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Configure AWS (only if credentials are available)
let s3, dynamodb;
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1'
  });
  s3 = new AWS.S3();
  dynamodb = new AWS.DynamoDB.DocumentClient();
} else {
  console.log('AWS credentials not found, S3 and DynamoDB features will be disabled');
}

// Configure OpenAI (only if API key is available)
let openai;
if (process.env.OPENAI_API_KEY) {
  const OpenAI = require('openai');
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
} else {
  console.log('OpenAI API key not found, chatbot features will be disabled');
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept Excel files and CSV files
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
      'application/csv' // .csv alternative
    ];
    
    const allowedExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    
    if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error(`Only Excel (.xlsx, .xls) and CSV (.csv) files are allowed. Received: ${file.mimetype}`), false);
    }
  }
});

// Mock well data
const mockWells = [
  { id: '1', name: 'Well A', depth: 5000, location: 'Gulf of Mexico' },
  { id: '2', name: 'Well AA', depth: 4500, location: 'North Sea' },
  { id: '3', name: 'Well AAA', depth: 5200, location: 'Permian Basin' },
  { id: '4', name: 'Well B', depth: 4800, location: 'Eagle Ford' },
  { id: '5', name: 'Well C', depth: 5500, location: 'Bakken Formation' },
  { id: '6', name: 'Well D', depth: 4200, location: 'Marcellus Shale' },
  { id: '7', name: 'Well E', depth: 5800, location: 'Haynesville Shale' },
  { id: '8', name: 'Well F', depth: 3900, location: 'Barnett Shale' }
];

// In-memory storage for development (when AWS is not available)
const inMemoryStorage = new Map();

// Routes
app.get('/api/wells', (req, res) => {
  try {
    res.json(mockWells);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch wells' });
  }
});

app.get('/api/wells/:id', (req, res) => {
  try {
    const well = mockWells.find(w => w.id === req.params.id);
    if (!well) {
      return res.status(404).json({ error: 'Well not found' });
    }
    res.json(well);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch well' });
  }
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Parse Excel or CSV file
    let data;
    if (req.file.mimetype.includes('csv') || req.file.originalname.toLowerCase().endsWith('.csv')) {
      // Handle CSV file
      const csvString = req.file.buffer.toString('utf-8');
      const workbook = xlsx.read(csvString, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(worksheet);
    } else {
      // Handle Excel file
      const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      data = xlsx.utils.sheet_to_json(worksheet);
    }

    // Process and validate data
    const processedData = data.map((row, index) => ({
      id: index + 1,
      depth: parseFloat(row.DEPTH) || 0,
      sh: parseFloat(row['%SH']) || 0,
      ss: parseFloat(row['%SS']) || 0,
      ls: parseFloat(row['%LS']) || 0,
      dol: parseFloat(row['%DOL']) || 0,
      anh: parseFloat(row['%ANH']) || 0,
      coal: parseFloat(row['%Coal']) || 0,
      salt: parseFloat(row['%Salt']) || 0,
      dt: parseFloat(row.DT) || 0,
      gr: parseFloat(row.GR) || 0,
      minfinal: parseFloat(row.MINFINAL) || 0,
      ucs: parseFloat(row.UCS) || 0,
      fa: parseFloat(row.FA) || 0,
      rat: parseFloat(row.RAT) || 0,
      rop: parseFloat(row.ROP) || 0,
      timestamp: new Date().toISOString()
    }));

    // Store data (AWS S3 if available, otherwise in-memory)
    if (s3) {
      const s3Params = {
        Bucket: process.env.AWS_S3_BUCKET || 'oil-drilling-data',
        Key: `well-data-${Date.now()}.json`,
        Body: JSON.stringify(processedData),
        ContentType: 'application/json'
      };
      await s3.upload(s3Params).promise();
    } else {
      // Store in memory for development
      const key = `upload-${Date.now()}`;
      inMemoryStorage.set(key, {
        id: key,
        filename: req.file.originalname,
        recordCount: processedData.length,
        uploadDate: new Date().toISOString(),
        data: processedData
      });
    }

    // Store metadata in DynamoDB or memory
    if (dynamodb) {
      const dbParams = {
        TableName: process.env.AWS_DYNAMODB_TABLE || 'WellData',
        Item: {
          id: `upload-${Date.now()}`,
          filename: req.file.originalname,
          recordCount: processedData.length,
          uploadDate: new Date().toISOString(),
          s3Key: s3 ? `well-data-${Date.now()}.json` : null
        }
      };
      await dynamodb.put(dbParams).promise();
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      recordCount: processedData.length,
      data: processedData.slice(0, 10) // Return first 10 records for preview
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide specific error messages
    let errorMessage = 'Failed to upload file';
    if (error.message.includes('Only Excel')) {
      errorMessage = error.message;
    } else if (error.message.includes('file size')) {
      errorMessage = 'File size too large. Maximum size is 10MB.';
    } else if (error.message.includes('parse')) {
      errorMessage = 'Invalid file format. Please ensure the file contains valid data.';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// Get uploaded data
app.get('/api/data', async (req, res) => {
  try {
    if (dynamodb) {
      const params = {
        TableName: process.env.AWS_DYNAMODB_TABLE || 'WellData'
      };
      const result = await dynamodb.scan(params).promise();
      res.json(result.Items || []);
    } else {
      // Return in-memory data for development
      const data = Array.from(inMemoryStorage.values());
      res.json(data);
    }
  } catch (error) {
    console.error('Data fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Chatbot endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, wellData } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!openai) {
      // Mock response when OpenAI is not available
      const mockResponses = [
        "I'm currently in development mode. Please configure your OpenAI API key for full functionality.",
        "This is a mock response. Set up your OpenAI API key to enable AI-powered responses.",
        "The chatbot is in demo mode. Configure environment variables for full AI capabilities."
      ];
      const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      return res.json({
        success: true,
        response: randomResponse,
        timestamp: new Date().toISOString()
      });
    }

    // Create context-aware prompt
    const context = wellData ? `Current well data: ${JSON.stringify(wellData.slice(0, 5))}. ` : '';
    const prompt = `${context}User question about oil drilling: ${message}. 
    Please provide a helpful, technical response about oil drilling operations, 
    well data analysis, or drilling optimization. Keep the response concise and professional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Drill AI, an expert assistant for oil drilling operations. You help analyze well data, provide drilling insights, and answer technical questions about oil drilling operations, geology, and well optimization."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    res.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat request',
      fallback: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    features: {
      aws: !!s3 && !!dynamodb,
      openai: !!openai,
      mode: process.env.NODE_ENV || 'development'
    }
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Mode: ${process.env.NODE_ENV || 'development'}`);
  if (!openai) {
    console.log('⚠️  OpenAI API key not configured - chatbot will use mock responses');
  }
  if (!s3 || !dynamodb) {
    console.log('⚠️  AWS credentials not configured - using in-memory storage');
  }
}); 