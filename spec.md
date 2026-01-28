# Student Grade Tracker Application

## Overview
A web application for tracking student grades with role-based access for teachers and parents.

## User Roles and Authentication
- **Teachers**: Full access to manage students and grades
- **Parents**: Limited access to view only their child's grades
- Role-based access control system to enforce permissions

## Core Features

### Teacher Functionality
- Add new students to the system
- Edit existing student information
- Delete students from the system
- Enter grades for students
- Update existing grades
- View all student records
- Access dashboard with grade summaries and recent updates
- Search and filter students by name or class

### Parent Functionality
- Log in to access the system
- View their child's grades only
- Cannot access other students' information

### User Interface
- Clean and user-friendly design using Tailwind CSS with a **red color theme**
- Red color palette applied across all components including buttons, headers, highlights, and dashboard cards
- Dashboard for teachers showing:
  - Grade summaries
  - Recent grade updates
- Search bar/filter functionality for finding students
- English language interface
- Color theme supports both light and dark modes with appropriate red shades

## Backend Data Storage
The backend must store:
- Student records (name, class, and other basic information)
- Grade records associated with each student
- User accounts with role assignments (teacher/parent)
- Parent-child relationships to enforce access control

## Backend Operations
- User authentication and role verification
- CRUD operations for students (Create, Read, Update, Delete)
- CRUD operations for grades
- Retrieve grade summaries and recent updates for dashboard
- Search and filter students by name or class
- Enforce parent access restrictions to show only their child's data
