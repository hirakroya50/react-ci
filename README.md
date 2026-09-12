# React CI/CD — AI-Powered Build, Validation & AWS Deployment

A production-ready **React + TypeScript + Vite** application with an automated CI/CD pipeline for **testing, validation, code-change verification, and AI-powered code auditing**.

Every code push triggers the GitHub Actions pipeline. The application is validated and built, the generated `dist` folder is deployed to **AWS S3**, and **AWS CloudFront** serves the latest version to users.

---

## 🚀 Project Overview

This project demonstrates a complete automated workflow for deploying a modern React application:

```text
Developer
    │
    │ git push
    ▼
GitHub Repository
    │
    ▼
GitHub Actions CI/CD
    │
    ├── Install dependencies
    ├── Run tests
    ├── Run lint / validation
    ├── Verify code changes
    ├── AI-powered code audit
    └── Build application
             │
             ▼
        dist/
             │
             ▼
          AWS S3
             │
             ▼
        CloudFront
             │
             ▼
        Live Website
```

The goal is to ensure that code is **tested and verified before deployment**, while keeping the deployment process fully automated.

---

## ✨ Features

* ⚛️ React with TypeScript
* ⚡ Vite for fast development and production builds
* 🔍 Oxlint for code quality and validation
* 🧪 Automated application testing
* ✅ Code-change verification
* 🤖 AI-powered code auditing
* 🔄 GitHub Actions CI/CD
* 📦 Automated production builds
* ☁️ AWS S3 static hosting
* 🌐 AWS CloudFront CDN
* 🚀 Automatic deployment on code push
* 🔐 Automated cloud deployment without manual file uploads

---

## 🛠️ Tech Stack

### Frontend

* React
* TypeScript
* Vite

### Code Quality

* Oxlint
* TypeScript validation

### CI/CD

* GitHub Actions
* Automated testing
* Build verification
* Code-change verification
* AI code audit

### AWS

* Amazon S3
* Amazon CloudFront

---

## 💻 Local Development

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The application will be available at the local Vite development URL shown in the terminal.

---

## 🏗️ Production Build

Create a production build with:

```bash
npm run build
```

The production files are generated inside:

```text
dist/
```

The `dist` directory contains the optimized static files that are deployed to AWS S3.

---

## 🧪 Testing & Validation

Before deployment, the CI/CD pipeline performs automated checks such as:

```text
Install dependencies
        ↓
Run tests
        ↓
Run validation / lint
        ↓
Verify code changes
        ↓
AI code audit
        ↓
Build application
        ↓
Deploy
```

If any required validation fails, the deployment pipeline stops and the new version is **not deployed**.

---

## 🤖 AI Code Audit

The CI/CD pipeline includes an AI-powered audit step that analyzes code changes.

The audit can be used to identify potential:

* Bugs
* Code-quality issues
* Unsafe changes
* Unexpected modifications
* Maintainability problems
* Potential regressions

This provides an additional verification layer alongside traditional automated tests and linting.

> AI auditing complements automated tests; it does not replace them.

---

## 🔄 CI/CD Pipeline

The GitHub Actions workflow is triggered when code is pushed to the configured branch.

A typical deployment looks like:

```text
git push
   ↓
GitHub Actions
   ↓
Checkout repository
   ↓
Install dependencies
   ↓
Run tests
   ↓
Run validation
   ↓
Verify changes
   ↓
AI audit
   ↓
npm run build
   ↓
Generate dist/
   ↓
Upload dist/ → AWS S3
   ↓
Invalidate CloudFront cache
   ↓
CloudFront serves new version
```

This means developers do not need to manually build or upload the application.

---

## ☁️ AWS Deployment

The production application is deployed using:

### Amazon S3

The Vite production output from:

```text
dist/
```

is uploaded to an Amazon S3 bucket.

### Amazon CloudFront

CloudFront sits in front of the S3 bucket and provides:

* CDN-based delivery
* HTTPS
* Global caching
* Faster content delivery
* Secure access to the application

The architecture is:

```text
                    ┌──────────────┐
                    │   GitHub     │
                    │ Repository   │
                    └──────┬───────┘
                           │
                       git push
                           │
                           ▼
                  ┌─────────────────┐
                  │ GitHub Actions  │
                  │     CI/CD       │
                  └────────┬────────┘
                           │
                    Build & Validate
                           │
                           ▼
                     ┌──────────┐
                     │  dist/   │
                     └────┬─────┘
                          │
                       Deploy
                          │
                          ▼
                    ┌──────────┐
                    │ AWS S3   │
                    └────┬─────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  CloudFront  │
                  └──────┬───────┘
                         │
                         ▼
                    End Users
```

---

## 🔐 Deployment Security

AWS credentials should not be hardcoded inside the repository.

The GitHub Actions workflow should use secure GitHub/AWS authentication and repository secrets or **OIDC-based authentication** where configured.

Never commit:

```text
.env
AWS access keys
AWS secret keys
API keys
AI provider keys
other credentials
```

---

## 📁 Important Project Structure

A typical project structure looks like:

```text
.
├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── public/
├── .github/
│   └── workflows/
│       └── ...
│
├── dist/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .oxlintrc.json
└── README.md
```

> `dist/` is generated during the build and should generally not be committed to the repository when CI/CD is responsible for deployment.

---

## 📋 Deployment Requirements

To use the complete CI/CD deployment pipeline, configure the required:

* GitHub Actions workflow
* AWS S3 bucket
* CloudFront distribution
* AWS deployment permissions
* Required GitHub secrets/environment variables
* AI audit credentials, if required by the workflow

---

## 🎯 Project Goal

The purpose of this project is to demonstrate a **reliable AI-assisted software delivery pipeline** where code changes are automatically:

**Built → Tested → Validated → Verified → AI Audited → Deployed**

This reduces manual deployment work and adds multiple verification layers before a new version reaches production.

---

## 📌 Original Vite Template

This project was initially created using the React + TypeScript + Vite template.

Vite provides a fast development environment with HMR and support for React through official plugins.

The React Compiler is not enabled by default because of its development and build performance impact.

For production applications, type-aware Oxlint rules can also be enabled using `oxlint-tsgolint`.

---

## 📄 License

Add your project license here.
