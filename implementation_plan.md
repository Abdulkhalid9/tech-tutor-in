# Implementation Plan: Scaling to 3000+ PDFs

Scaling your Browse Library from a few questions to 3,000+ entries (which means 6,000+ PDF files total) comes with exciting challenges. We can't simply place them in the local folder or load them all at once on the frontend, otherwise, your app and server will crash.

Here is the systematic plan of action to accomplish this flawlessly.

## Phase 1: Cloud Storage Setup (ImageKit)

> [!WARNING]  
> Storing 6,000 PDFs on your local server disk will consume massive storage and drastically slow down your application speed.

- **Action**: Move file storage from local `/uploads` to a specialized cloud service. We will use **ImageKit** as our cloud storage and CDN solution.
- **Result**: Your PDFs will load incredibly fast via global CDNs, and it won't impact your backend Node.js performance at all.

## Phase 2: Bulk Database Seeding Script

- **Action**: We will write a powerful Node.js batch-upload script. 
- **Method**: 
  1. You will organize your 3000 PDFs locally into a folder (e.g., matching Q and A filenames, or using an Excel/CSV file with metadata like Subject, Price, etc.).
  2. The script will loop through this directory sequentially.
  3. For each file, the script will:
     - Upload the Q and A PDFs to ImageKit.
     - Capture the secure cloud URLs.
     - Automatically create the unified `Question` and `Answer` database entries in MongoDB with the correct subjects and IDs.
- **Progress Tracking**: The script will track its progress so if your internet cuts out at question #1,500, it can resume where it left off.

## Phase 3: Backend Pagination & Search 

> [!IMPORTANT]  
> Sending 3,000 questions to the browser in one API call will crash the student's browser and eat up all their mobile data. 

- **Action**: Update the `/api/qa` route to handle **Pagination** and **Server-Side Filtering**.
- **Implementation**: 
  - Send only the first 20 items initially.
  - Implement MongoDB text indexes so when a student searches for "Thermodynamics", the database quickly finds the matches rather than the frontend filtering all 3,000 items.

## Phase 4: Frontend Infinite Scrolling

- **Action**: Update the `QuestionsPage` sidebar to support infinite scrolling.
- **Implementation**: When the student scrolls to the bottom of the first 20 questions in the sidebar, we seamlessly ping the backend and fetch the next 20 questions, appending them to the list without refreshing the page. 

---

## User Review Required

Does this general approach make sense to you? If so, we can begin immediately by setting up **Phase 1 (ImageKit Integration)** or tackling the **Pagination** setup. Which would you like to start with?
