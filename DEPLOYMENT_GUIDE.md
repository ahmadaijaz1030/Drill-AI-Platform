# Deployment Guide
## Drill AI Intelligence Platform

This guide provides comprehensive instructions for deploying the Drill AI Intelligence Platform to production environments using AWS services.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Infrastructure Setup](#aws-infrastructure-setup)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Methods](#deployment-methods)
5. [Monitoring & Maintenance](#monitoring--maintenance)
6. [Security Configuration](#security-configuration)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Accounts & Services
- **AWS Account** with appropriate permissions
- **GitHub Account** for repository management
- **OpenAI API Key** for AI chatbot functionality
- **Docker Hub Account** (optional, for container deployment)

### Required Software
- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Docker** and **Docker Compose** (for containerized deployment)
- **AWS CLI** configured with appropriate credentials
- **Git** for version control

### Required Permissions
- AWS S3 bucket creation and management
- AWS DynamoDB table creation and management
- AWS Elastic Beanstalk application deployment
- AWS CloudFront distribution management
- AWS IAM role and policy management

---

## 🏗️ AWS Infrastructure Setup

### 1. S3 Bucket Setup

Create S3 buckets for file storage and static hosting:

```bash
# Create bucket for file storage
aws s3 mb s3://drill-ai-data-storage

# Create bucket for frontend hosting
aws s3 mb s3://drill-ai-frontend-hosting

# Configure bucket policies
aws s3api put-bucket-policy --bucket drill-ai-data-storage --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::drill-ai-data-storage/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::YOUR_ACCOUNT_ID:distribution/YOUR_DISTRIBUTION_ID"
        }
      }
    }
  ]
}'
```

### 2. DynamoDB Table Setup

Create DynamoDB table for well data:

```bash
# Create WellData table
aws dynamodb create-table \
  --table-name WellData \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Create indexes for efficient querying
aws dynamodb update-table \
  --table-name WellData \
  --attribute-definitions AttributeName=wellName,AttributeType=S \
  --global-secondary-indexes \
    IndexName=WellNameIndex,KeySchema=[{AttributeName=wellName,KeyType=HASH}],Projection={ProjectionType=ALL}
```

### 3. Elastic Beanstalk Environment

Create Elastic Beanstalk applications for backend deployment:

```bash
# Create backend application
aws elasticbeanstalk create-application \
  --application-name drill-ai-backend-production \
  --description "Drill AI Backend API"

# Create backend environment
aws elasticbeanstalk create-environment \
  --application-name drill-ai-backend-production \
  --environment-name drill-ai-backend-production-env \
  --solution-stack-name "64bit Amazon Linux 2 v5.8.0 running Node.js 18" \
  --option-settings \
    Namespace=aws:autoscaling:launchconfiguration,OptionName=IamInstanceProfile,Value=aws-elasticbeanstalk-ec2-role \
    Namespace=aws:elasticbeanstalk:environment,OptionName=EnvironmentType,Value=LoadBalanced \
    Namespace=aws:elasticbeanstalk:environment,OptionName=LoadBalancerType,Value=application \
    Namespace=aws:autoscaling:asg,OptionName=MinSize,Value=1 \
    Namespace=aws:autoscaling:asg,OptionName=MaxSize,Value=4
```

### 4. CloudFront Distribution

Create CloudFront distribution for frontend hosting:

```bash
# Create CloudFront distribution
aws cloudfront create-distribution \
  --distribution-config '{
    "CallerReference": "drill-ai-frontend",
    "Comment": "Drill AI Frontend Distribution",
    "DefaultCacheBehavior": {
      "TargetOriginId": "S3-drill-ai-frontend-hosting",
      "ViewerProtocolPolicy": "redirect-to-https",
      "TrustedSigners": {
        "Enabled": false,
        "Quantity": 0
      },
      "ForwardedValues": {
        "QueryString": false,
        "Cookies": {
          "Forward": "none"
        }
      },
      "MinTTL": 0,
      "DefaultTTL": 86400,
      "MaxTTL": 31536000
    },
    "Origins": {
      "Quantity": 1,
      "Items": [
        {
          "Id": "S3-drill-ai-frontend-hosting",
          "DomainName": "drill-ai-frontend-hosting.s3.amazonaws.com",
          "S3OriginConfig": {
            "OriginAccessIdentity": ""
          }
        }
      ]
    },
    "Enabled": true,
    "PriceClass": "PriceClass_100"
  }'
```

### 5. IAM Roles and Policies

Create necessary IAM roles and policies:

```bash
# Create EC2 instance profile
aws iam create-role \
  --role-name drill-ai-ec2-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "ec2.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

# Attach policies to EC2 role
aws iam attach-role-policy \
  --role-name drill-ai-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWebTier

aws iam attach-role-policy \
  --role-name drill-ai-ec2-role \
  --policy-arn arn:aws:iam::aws:policy/AWSElasticBeanstalkWorkerTier

# Create instance profile
aws iam create-instance-profile \
  --instance-profile-name drill-ai-ec2-profile

aws iam add-role-to-instance-profile \
  --instance-profile-name drill-ai-ec2-profile \
  --role-name drill-ai-ec2-role
```

---

## ⚙️ Environment Configuration

### 1. Environment Variables

Create environment configuration files:

```bash
# Production environment
cat > .env.production << EOF
NODE_ENV=production
PORT=5000
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=drill-ai-data-storage
AWS_S3_FRONTEND_BUCKET=drill-ai-frontend-hosting
AWS_DYNAMODB_TABLE=WellData
OPENAI_API_KEY=your_openai_api_key
CORS_ORIGIN=https://your-frontend-domain.com
EOF

# Staging environment
cat > .env.staging << EOF
NODE_ENV=staging
PORT=5000
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=drill-ai-data-storage-staging
AWS_S3_FRONTEND_BUCKET=drill-ai-frontend-hosting-staging
AWS_DYNAMODB_TABLE=WellDataStaging
OPENAI_API_KEY=your_openai_api_key
CORS_ORIGIN=https://staging.your-frontend-domain.com
EOF
```

### 2. GitHub Secrets Configuration

Configure GitHub repository secrets for CI/CD:

```bash
# Required secrets for GitHub Actions
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_S3_BUCKET=drill-ai-data-storage
AWS_S3_FRONTEND_BUCKET=drill-ai-frontend-hosting
AWS_CLOUDFRONT_DISTRIBUTION_ID=your_cloudfront_distribution_id
DOCKER_USERNAME=your_docker_username
DOCKER_PASSWORD=your_docker_password
```

---

## 🚀 Deployment Methods

### Method 1: GitHub Actions (Recommended)

The application uses GitHub Actions for automated deployment:

1. **Push to main branch** triggers production deployment
2. **Push to develop branch** triggers staging deployment
3. **Pull requests** trigger testing and security scans

```bash
# Deploy to production
git push origin main

# Deploy to staging
git push origin develop
```

### Method 2: Manual AWS Deployment

For manual deployment to AWS:

```bash
# Build the application
npm run build

# Deploy backend to Elastic Beanstalk
cd server
eb init drill-ai-backend-production --region us-east-1
eb create drill-ai-backend-production-env
eb deploy

# Deploy frontend to S3
cd ../client
npm run build
aws s3 sync build/ s3://drill-ai-frontend-hosting --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### Method 3: Docker Deployment

For containerized deployment:

```bash
# Build Docker images
docker build -t drill-ai-frontend:latest ./client
docker build -t drill-ai-backend:latest ./server

# Push to Docker Hub
docker tag drill-ai-frontend:latest your-username/drill-ai-frontend:latest
docker tag drill-ai-backend:latest your-username/drill-ai-backend:latest
docker push your-username/drill-ai-frontend:latest
docker push your-username/drill-ai-backend:latest

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📊 Monitoring & Maintenance

### 1. CloudWatch Monitoring

Set up CloudWatch monitoring and alerts:

```bash
# Create CloudWatch dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "Drill-AI-Monitoring" \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ElasticBeanstalk", "ApplicationRequests", "EnvironmentName", "drill-ai-backend-production-env"]
          ],
          "period": 300,
          "stat": "Sum",
          "region": "us-east-1",
          "title": "Application Requests"
        }
      },
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ElasticBeanstalk", "CPUUtilization", "EnvironmentName", "drill-ai-backend-production-env"]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "title": "CPU Utilization"
        }
      }
    ]
  }'

# Create CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name "Drill-AI-High-CPU" \
  --alarm-description "High CPU utilization" \
  --metric-name CPUUtilization \
  --namespace AWS/ElasticBeanstalk \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:drill-ai-alerts
```

### 2. Log Management

Configure log aggregation and monitoring:

```bash
# Enable CloudWatch logs for Elastic Beanstalk
aws elasticbeanstalk update-environment \
  --environment-name drill-ai-backend-production-env \
  --option-settings \
    Namespace=aws:elasticbeanstalk:cloudwatch:logs,OptionName=StreamLogs,Value=true \
    Namespace=aws:elasticbeanstalk:cloudwatch:logs,OptionName=DeleteOnTerminate,Value=false \
    Namespace=aws:elasticbeanstalk:cloudwatch:logs,OptionName=RetentionInDays,Value=7
```

### 3. Performance Monitoring

Set up performance monitoring tools:

```bash
# Install New Relic agent (optional)
npm install newrelic

# Configure New Relic
cat > newrelic.js << EOF
'use strict'

exports.config = {
  app_name: ['Drill AI Platform'],
  license_key: 'your_newrelic_license_key',
  logging: {
    level: 'info'
  },
  distributed_tracing: {
    enabled: true
  }
}
EOF
```

### 4. Backup Strategy

Implement automated backup strategy:

```bash
# Create DynamoDB backup schedule
aws dynamodb create-backup \
  --table-name WellData \
  --backup-name WellData-Backup-$(date +%Y%m%d)

# Create S3 lifecycle policy for backups
aws s3api put-bucket-lifecycle-configuration \
  --bucket drill-ai-data-storage \
  --lifecycle-configuration '{
    "Rules": [
      {
        "ID": "BackupLifecycle",
        "Status": "Enabled",
        "Filter": {
          "Prefix": "backups/"
        },
        "Transitions": [
          {
            "Days": 30,
            "StorageClass": "STANDARD_IA"
          },
          {
            "Days": 90,
            "StorageClass": "GLACIER"
          }
        ],
        "Expiration": {
          "Days": 365
        }
      }
    ]
  }'
```

---

## 🔒 Security Configuration

### 1. SSL/TLS Configuration

Configure SSL certificates:

```bash
# Request SSL certificate
aws acm request-certificate \
  --domain-name your-domain.com \
  --subject-alternative-names "*.your-domain.com" \
  --validation-method DNS

# Configure HTTPS for Elastic Beanstalk
aws elasticbeanstalk update-environment \
  --environment-name drill-ai-backend-production-env \
  --option-settings \
    Namespace=aws:elbv2:listener:443,OptionName=ListenerEnabled,Value=true \
    Namespace=aws:elbv2:listener:443,OptionName=SSLCertificateArns,Value=arn:aws:acm:us-east-1:YOUR_ACCOUNT_ID:certificate/YOUR_CERTIFICATE_ID
```

### 2. Security Groups

Configure security groups for network security:

```bash
# Create security group for backend
aws ec2 create-security-group \
  --group-name drill-ai-backend-sg \
  --description "Security group for Drill AI backend"

# Configure security group rules
aws ec2 authorize-security-group-ingress \
  --group-name drill-ai-backend-sg \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-name drill-ai-backend-sg \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0
```

### 3. IAM Security

Implement least privilege access:

```bash
# Create custom policy for application
aws iam create-policy \
  --policy-name DrillAIApplicationPolicy \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Action": [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ],
        "Resource": "arn:aws:s3:::drill-ai-data-storage/*"
      },
      {
        "Effect": "Allow",
        "Action": [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ],
        "Resource": "arn:aws:dynamodb:us-east-1:YOUR_ACCOUNT_ID:table/WellData"
      }
    ]
  }'
```

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### 1. Deployment Failures

**Issue**: GitHub Actions deployment fails
**Solution**:
```bash
# Check AWS credentials
aws sts get-caller-identity

# Verify S3 bucket permissions
aws s3 ls s3://drill-ai-data-storage

# Check Elastic Beanstalk environment status
aws elasticbeanstalk describe-environments \
  --environment-names drill-ai-backend-production-env
```

#### 2. Application Errors

**Issue**: Application returns 500 errors
**Solution**:
```bash
# Check application logs
aws logs describe-log-groups --log-group-name-prefix /aws/elasticbeanstalk

# View recent log events
aws logs filter-log-events \
  --log-group-name /aws/elasticbeanstalk/drill-ai-backend-production-env/var/log/nodejs \
  --start-time $(date -d '1 hour ago' +%s)000
```

#### 3. Performance Issues

**Issue**: Slow response times
**Solution**:
```bash
# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ElasticBeanstalk \
  --metric-name CPUUtilization \
  --dimensions Name=EnvironmentName,Value=drill-ai-backend-production-env \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

#### 4. Database Issues

**Issue**: DynamoDB connection errors
**Solution**:
```bash
# Check DynamoDB table status
aws dynamodb describe-table --table-name WellData

# Verify IAM permissions
aws iam get-role-policy \
  --role-name drill-ai-ec2-role \
  --policy-name DrillAIApplicationPolicy
```

### Monitoring Commands

```bash
# Check application health
curl -f https://your-backend-domain.com/api/health

# Monitor application metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ElasticBeanstalk \
  --metric-name ApplicationRequests \
  --dimensions Name=EnvironmentName,Value=drill-ai-backend-production-env \
  --start-time $(date -d '1 hour ago' -u +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Sum

# Check CloudFront distribution
aws cloudfront get-distribution --id YOUR_DISTRIBUTION_ID
```

---

## 📈 Scaling and Optimization

### Auto Scaling Configuration

```bash
# Configure auto scaling
aws elasticbeanstalk update-environment \
  --environment-name drill-ai-backend-production-env \
  --option-settings \
    Namespace=aws:autoscaling:trigger,OptionName=BreachDuration,Value=5 \
    Namespace=aws:autoscaling:trigger,OptionName=LowerBreachScaleIncrement,Value=-1 \
    Namespace=aws:autoscaling:trigger,OptionName=UpperBreachScaleIncrement,Value=1 \
    Namespace=aws:autoscaling:trigger,OptionName=UpperThreshold,Value=80 \
    Namespace=aws:autoscaling:trigger,OptionName=LowerThreshold,Value=30
```

### Performance Optimization

1. **Enable CloudFront caching**
2. **Implement database connection pooling**
3. **Use Redis for session storage**
4. **Optimize static asset delivery**

### Cost Optimization

1. **Use Spot Instances for non-critical workloads**
2. **Implement S3 lifecycle policies**
3. **Monitor and optimize DynamoDB capacity**
4. **Use CloudWatch alarms for cost monitoring**

---

This deployment guide provides comprehensive instructions for deploying the Drill AI Intelligence Platform to production environments with proper monitoring, security, and maintenance strategies. 