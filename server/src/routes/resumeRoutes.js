const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const pool = require('../db')
const authMiddleware = require('../middleware/authMiddleware')

const uploadDir = path.join(__dirname, '../../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir)

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files allowed!'))
  }
})

router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    const userId = req.user.id
    const { filename, originalname } = req.file

    await pool.query(
      'INSERT INTO resumes (user_id, filename, original_name) VALUES ($1, $2, $3)',
      [userId, filename, originalname]
    )

    res.json({
      success: true,
      message: 'Resume uploaded successfully!',
      file: filename
    })
  } catch (err) {
    console.error('Upload error:', err)
    res.status(500).json({ error: 'Server error during upload' })
  }
})

router.get('/list', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, original_name, uploaded_at FROM resumes WHERE user_id = $1 ORDER BY uploaded_at DESC',
      [req.user.id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch resumes' })
  }
})

module.exports = router
