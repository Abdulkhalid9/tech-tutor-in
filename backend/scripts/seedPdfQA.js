/**
 * seedPdfQA.js
 * ─────────────────────────────────────────────────────────────
 * Inserts one sample Question (Q0.pdf) + Answer (A0.pdf) into
 * MongoDB so they appear immediately in the Browse Library.
 *
 * Files required in  backend/uploads/:
 *   Q0.pdf   ← question paper
 *   A0.pdf   ← answer / solution paper
 *
 * Usage:
 *   node scripts/seedPdfQA.js
 * ─────────────────────────────────────────────────────────────
 */

require('dotenv').config();
const mongoose = require('mongoose');
const path     = require('path');
const fs       = require('fs');

const User     = require('../src/models/User');
const Question = require('../src/models/Question');
const Answer   = require('../src/models/Answer');

// ── Config ────────────────────────────────────────────────────
const BASE_URL    = process.env.BACKEND_URL || 'http://localhost:5000';
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const Q_FILE      = 'Q0.pdf';
const A_FILE      = 'A0.pdf';

// ── Helpers ───────────────────────────────────────────────────
function fileExists(filename) {
  return fs.existsSync(path.join(UPLOADS_DIR, filename));
}

async function getOrCreateStudent() {
  let student = await User.findOne({ role: 'student' });
  if (student) {
    console.log(`  ✓ Using existing student: ${student.email}`);
    return student;
  }
  student = await User.create({
    name: 'Sample Student',
    email: 'sample.student@techtutorin.com',
    password: 'password123',
    role: 'student',
    verified: true,
  });
  console.log(`  ✓ Created placeholder student: ${student.email}`);
  return student;
}

async function getOrCreateTutor() {
  let tutor = await User.findOne({ role: 'tutor' });
  if (tutor) {
    console.log(`  ✓ Using existing tutor: ${tutor.email}`);
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
  console.log(`  ✓ Created placeholder tutor: ${tutor.email}`);
  return tutor;
}

// ── Main ──────────────────────────────────────────────────────
async function main() {
  console.log('\n╔═ PDF Q&A Seeder ══════════════════════════════════════════╗');

  // 1. Connect
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error('MONGODB_URI not set in .env');
  await mongoose.connect(mongoUri);
  console.log('  ✓ Connected to MongoDB');

  // 2. Check files exist
  if (!fileExists(Q_FILE)) {
    console.error(`\n  ✗ Missing file: uploads/${Q_FILE}`);
    console.error('    Please copy Q0.pdf into the backend/uploads folder first.\n');
    process.exit(1);
  }
  if (!fileExists(A_FILE)) {
    console.error(`\n  ✗ Missing file: uploads/${A_FILE}`);
    console.error('    Please copy A0.pdf into the backend/uploads folder first.\n');
    process.exit(1);
  }
  console.log(`  ✓ Found ${Q_FILE} and ${A_FILE} in uploads/`);

  // 3. Resolve users
  const student = await getOrCreateStudent();
  const tutor   = await getOrCreateTutor();

  // 4. PDF URLs served by the backend static middleware
  const questionFileUrl = `${BASE_URL}/uploads/${Q_FILE}`;
  const answerFileUrl   = `${BASE_URL}/uploads/${A_FILE}`;

  // 5. Create Question
  const question = await Question.create({
    title:          'JEE 2024 — Physics & Chemistry (Sample Paper Q0)',
    description:
      'This is a sample JEE-level Question Paper (Q0) covering Kinematics, Thermodynamics, ' +
      'and Organic Chemistry. The full question paper is attached as a PDF below.',
    file:           questionFileUrl,
    fileType:       'pdf',
    studentId:      student._id,
    status:         'answered',
    assignedTutor:  tutor._id,
    price:          99,
    subject:        'Physics',
    answerUnlocked: false,           // locked by default — unlock via the library UI
  });
  console.log(`  ✓ Question created: ${question._id}`);

  // 6. Create Answer
  const answer = await Answer.create({
    questionId:   question._id,
    tutorId:      tutor._id,
    solution:
      'Complete step-by-step solutions are provided in the attached PDF (A0). ' +
      'Each question is solved with full working, formulas applied, and final answers highlighted.',
    file:         answerFileUrl,
    fileType:     'pdf',
    amountEarned: question.price,
    status:       'submitted',
  });
  console.log(`  ✓ Answer created:   ${answer._id}`);

  console.log('\n  ✅ Seeding done! Open Browse Library to view the entry.');
  console.log(`     Question PDF: ${questionFileUrl}`);
  console.log(`     Answer PDF:   ${answerFileUrl}`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('\n  ✗ Seeder failed:', err.message);
  process.exit(1);
});
