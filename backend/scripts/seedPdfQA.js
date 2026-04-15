/**
 * seedPdfQA.js (Bulk Upload to ImageKit)
 * ─────────────────────────────────────────────────────────────
 * Uploads all Q*.pdf and A*.pdf pairs from an input folder
 * to ImageKit and creates MongoDB documents for them.
 * Includes progress tracking to resume if interrupted.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const imagekit = require('../src/config/imagekit'); // Phase 1 config

const User = require('../src/models/User');
const Question = require('../src/models/Question');
const Answer = require('../src/models/Answer');

// ── Config ────────────────────────────────────────────────────
// Put all your PDFs in backend/uploads/bulk
const UPLOADS_DIR = path.join(__dirname, '../uploads/bulk');
const PROGRESS_FILE = path.join(__dirname, 'seeding-progress.json');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  console.log(`\nCreated directory: ${UPLOADS_DIR}`);
  console.log('Please place your Q*.pdf and A*.pdf files here before running the script.\n');
}

// ── Helpers ───────────────────────────────────────────────────

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse progress file, starting fresh.');
      return {};
    }
  }
  return {};
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

// Recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

async function uploadToImageKit(filePath, folder = '/techtutorin_pdfs') {
  const fileBuffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);

  const result = await imagekit.files.upload({
    file: fileBuffer.toString('base64'),
    fileName: fileName,
    folder: folder,
    useUniqueFileName: false
  });
  return result.url;
}

async function getOrCreateStudent() {
  let student = await User.findOne({ role: 'student' });
  if (student) {
    return student;
  }
  student = await User.create({
    name: 'Sample Student',
    email: 'sample.student@techtutorin.com',
    password: 'password123',
    role: 'student',
    verified: true,
  });
  return student;
}

async function getOrCreateTutor() {
  let tutor = await User.findOne({ role: 'tutor' });
  if (tutor) {
    return tutor;
  }
  tutor = await User.create({
    name: 'Expert Tutor',
    email: 'expert.tutor@techtutorin.com',
    password: 'password123',
    role: 'tutor',
    verified: true,
    tutorProfile: { approvalStatus: 'approved', expertise: ['Physics', 'Maths'], earnings: 0 },
  });
  return tutor;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n╔═ ImageKit Bulk PDF Seeder ════════════════════════════════╗');
  
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGODB_URI not set in .env');
  await mongoose.connect(mongoUri);
  console.log('  ✓ Connected to MongoDB');

  const student = await getOrCreateStudent();
  const tutor   = await getOrCreateTutor();

  const progress = loadProgress();

  // Find all files recursively in UPLOADS_DIR
  const allFilesPaths = fs.existsSync(UPLOADS_DIR) ? getAllFiles(UPLOADS_DIR) : [];
  
  // Filter only Q*.pdf files
  const qFilesPaths = allFilesPaths.filter(f => {
    const filename = path.basename(f);
    return filename.toUpperCase().startsWith('Q') && filename.toLowerCase().endsWith('.pdf');
  });

  if (qFilesPaths.length === 0) {
    console.log(`\n  No Question files found in ${UPLOADS_DIR} or its subfolders.`);
    console.log('  Please add pairs formatted like Q1.pdf and A1.pdf, Q2.pdf and A2.pdf');
    process.exit(0);
  }

  console.log(`  Found ${qFilesPaths.length} Question files. Starting bulk upload...\n`);

  for (const qFilePath of qFilesPaths) {
    const qFile = path.basename(qFilePath);
    const dirName = path.dirname(qFilePath);

    // Extract base, e.g. "Q1.pdf" -> "1"
    const match = qFile.match(/^Q(.+)\.pdf$/i);
    if (!match) continue;
    const baseName = match[1]; 
    
    // Create a unique key for progress tracking in case you have multiple folders with Q1.pdf
    const relativeDir = path.relative(UPLOADS_DIR, dirName).replace(/\\/g, '/');
    const uniqueProgressKey = relativeDir ? `${relativeDir}/${baseName}` : baseName;
    
    // Look for answering file in the same folder as the question file
    const aFile = `A${baseName}.pdf`;
    const aFilePath = path.join(dirName, aFile);

    if (progress[uniqueProgressKey]) {
      console.log(`  - Skipping Pair #${uniqueProgressKey} (Already processed)`);
      continue;
    }

    if (!fs.existsSync(aFilePath)) {
      console.log(`  - Warning: Missing Answer file ${aFile} for ${qFile}. Skipping this pair.`);
      continue;
    }

    try {
      console.log(`  > Uploading ${qFile} to ImageKit...`);
      const qUrl = await uploadToImageKit(qFilePath);
      
      console.log(`  > Uploading ${aFile} to ImageKit...`);
      const aUrl = await uploadToImageKit(aFilePath);

      // Create Question
      const question = await Question.create({
        title: `Question Paper Set ${baseName}`,
        description: `This is a sample Question Paper (Set ${baseName}). Full paper is attached as a PDF.`,
        file: qUrl, // Cloud URL
        fileType: 'pdf',
        studentId: student._id,
        status: 'answered',
        assignedTutor: tutor._id,
        price: 99,
        subject: 'Physics', // Default placeholder
        answerUnlocked: false,
      });

      // Create Answer
      await Answer.create({
        questionId: question._id,
        tutorId: tutor._id,
        solution: `Complete step-by-step solutions for Set ${baseName}.`,
        file: aUrl, // Cloud URL
        fileType: 'pdf',
        amountEarned: question.price,
        status: 'submitted',
      });

      console.log(`  ✓ Pair #${uniqueProgressKey} successfully created in DB.`);
      
      // Mark as done
      progress[uniqueProgressKey] = true;
      saveProgress(progress);

    } catch (err) {
      console.error(`  ✗ Failed to process Pair #${uniqueProgressKey}:`, err.message);
      // It will continue to the next one instead of completely aborting the process
    }
  }

  console.log('\n  ✅ Bulk seeding finished!');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('\n  ✗ Seeder failed:', err.message);
  process.exit(1);
});
