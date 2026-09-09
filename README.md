# 🇨🇩 eForeigner DRC

## Digital Immigration Management Platform for the Democratic Republic of Congo

eForeigner DRC is a full-stack web application designed to simplify and organize immigration-related procedures for foreigners living in or travelling to the Democratic Republic of Congo.

I built this project to explore how a digital platform could bring together application submission, document management, application tracking, officer review, payment verification, and administrative workflows in one system.

The goal was not simply to create a website, but to build a structured application with different user roles, a database-backed workflow, authentication, authorization, audit history, and a clear progression from application submission to immigration decision.

> **Note:** This is an independent software project and is not an official government platform of the Democratic Republic of Congo.

---

## 🎯 Why I Built This Project

Immigration procedures often involve several steps, documents, validations and interactions between applicants and administrative services.

I wanted to explore how these processes could be represented digitally.

The project started as an idea for an immigration portal and progressively evolved into a complete full-stack application with:

- Applicant accounts
- Immigration applications
- Document submission
- Application tracking
- Officer validation
- Medical verification
- Payment verification
- Immigration decisions
- Administrative management
- Audit history
- French / English interface

The project also gave me the opportunity to work on authentication, database relationships, API design, role-based access control and application workflow management.

---

## 👤 Applicant Features

Applicants can create an account and access their personal immigration space.

### Application management

Applicants can:

- Create an immigration application
- Enter personal and passport information
- Select the purpose of their application
- Upload supporting documents
- View their submitted applications
- Follow the progress of an application
- Access their application details

### Application tracking

Each residence application follows a structured progression:

```text
20%  Account Created
      ↓
40%  Documents & Profile Validated
      ↓
60%  Medical Verification
      ↓
80%  Payment Verification
      ↓
100% Immigration Decision