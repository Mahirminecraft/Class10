
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const subjectDir = path.join(uploadsDir, req.body.subject || 'general');
        if (!fs.existsSync(subjectDir)) {
            fs.mkdirSync(subjectDir, { recursive: true });
        }
        cb(null, subjectDir);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        cb(null, `${timestamp}_${sanitizedName}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static('uploads'));

// Data storage files
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const usersFile = path.join(dataDir, 'users.json');
const subjectsFile = path.join(dataDir, 'subjects.json');
const homeworkFile = path.join(dataDir, 'homework.json');
const requestsFile = path.join(dataDir, 'requests.json');
const chatFile = path.join(dataDir, 'chat.json');

// Initialize data files if they don't exist
function initializeDataFiles() {
    const defaultUsers = {
        '2129136822': { 
            password: 'mbmEmmm21291', 
            name: 'Teacher Admin', 
            role: 'admin', 
            devices: [], 
            activeDevice: null, 
            ipAddress: null,
            isLoggedIn: false,
            banned: false,
            homeworkHidden: false
        },
        'student_07': { 
            password: 'mbmEmmm21291', 
            name: 'Mahir Sayban', 
            role: 'student', 
            devices: [], 
            activeDevice: null, 
            ipAddress: null,
            isLoggedIn: false,
            banned: false,
            homeworkHidden: false
        }
    };

    const defaultSubjects = {
        bangla: { name: 'Bangla', description: 'বাংলা ব্যাকরণ, সাহিত্য ও রচনা' },
        english: { name: 'English', description: 'Grammar, Literature, Composition' },
        mathematics: { name: 'Mathematics', description: 'Algebra, Geometry, Trigonometry' },
        physics: { name: 'Physics', description: 'Mechanics, Thermodynamics, Electromagnetism' },
        chemistry: { name: 'Chemistry', description: 'Organic, Inorganic, Physical Chemistry' },
        biology: { name: 'Biology', description: 'Botany, Zoology, Human Physiology' },
        higher_math: { name: 'Higher Math', description: 'Calculus, Statistics, Coordinate Geometry' },
        ict: { name: 'ICT', description: 'Information & Communication Technology' }
    };

    const defaultHomework = {
        bangla: [
            {
                id: 1,
                title: 'বাংলা ব্যাকরণ - সন্ধি',
                content: 'সন্ধির নিয়মাবলী অনুশীলন করুন:\n১. স্বরসন্ধি\n২. ব্যঞ্জনসন্ধি\n৩. বিসর্গসন্ধি\n\nপ্রতিটি প্রকারের ৫টি করে উদাহরণ দিন।',
                dueDate: '2024-02-15',
                files: []
            }
        ]
    };

    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2));
    }
    if (!fs.existsSync(subjectsFile)) {
        fs.writeFileSync(subjectsFile, JSON.stringify(defaultSubjects, null, 2));
    }
    if (!fs.existsSync(homeworkFile)) {
        fs.writeFileSync(homeworkFile, JSON.stringify(defaultHomework, null, 2));
    }
    if (!fs.existsSync(requestsFile)) {
        fs.writeFileSync(requestsFile, JSON.stringify([], null, 2));
    }
    if (!fs.existsSync(chatFile)) {
        fs.writeFileSync(chatFile, JSON.stringify([], null, 2));
    }
}

initializeDataFiles();

// Helper functions to read/write data
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        if (!data.trim()) {
            console.log(`File ${filePath} is empty, returning default`);
            return getDefaultData(filePath);
        }
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        console.log(`Returning default data for ${filePath}`);
        return getDefaultData(filePath);
    }
}

function getDefaultData(filePath) {
    const fileName = path.basename(filePath);
    switch(fileName) {
        case 'users.json':
            return {
                '2129136822': { 
                    password: 'mbmEmmm21291', 
                    name: 'Teacher Admin', 
                    role: 'admin', 
                    devices: [], 
                    activeDevice: null, 
                    ipAddress: null,
                    isLoggedIn: false,
                    banned: false,
                    homeworkHidden: false
                },
                'student_07': { 
                    password: 'mbmEmmm21291', 
                    name: 'Mahir Sayban', 
                    role: 'student', 
                    devices: [], 
                    activeDevice: null, 
                    ipAddress: null,
                    isLoggedIn: false,
                    banned: false,
                    homeworkHidden: false
                }
            };
        case 'subjects.json':
            return {
                bangla: { name: 'Bangla', description: 'বাংলা ব্যাকরণ, সাহিত্য ও রচনা' },
                english: { name: 'English', description: 'Grammar, Literature, Composition' },
                mathematics: { name: 'Mathematics', description: 'Algebra, Geometry, Trigonometry' },
                physics: { name: 'Physics', description: 'Mechanics, Thermodynamics, Electromagnetism' },
                chemistry: { name: 'Chemistry', description: 'Organic, Inorganic, Physical Chemistry' },
                biology: { name: 'Biology', description: 'Botany, Zoology, Human Physiology' },
                higher_math: { name: 'Higher Math', description: 'Calculus, Statistics, Coordinate Geometry' },
                ict: { name: 'ICT', description: 'Information & Communication Technology' }
            };
        case 'homework.json':
            return {
                bangla: [
                    {
                        id: 1,
                        title: 'বাংলা ব্যাকরণ - সন্ধি',
                        content: 'সন্ধির নিয়মাবলী অনুশীলন করুন:\n১. স্বরসন্ধি\n২. ব্যঞ্জনসন্ধি\n৩. বিসর্গসন্ধি\n\nপ্রতিটি প্রকারের ৫টি করে উদাহরণ দিন।',
                        dueDate: '2024-02-15',
                        files: []
                    }
                ]
            };
        default:
            return [];
    }
}

function writeJSONFile(filePath, data) {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
}

// API Routes

// Get all data
app.get('/api/users', (req, res) => {
    const users = readJSONFile(usersFile);
    res.json(users);
});

app.get('/api/subjects', (req, res) => {
    const subjects = readJSONFile(subjectsFile);
    res.json(subjects);
});

app.get('/api/homework', (req, res) => {
    const homework = readJSONFile(homeworkFile);
    res.json(homework);
});

app.get('/api/requests', (req, res) => {
    const requests = readJSONFile(requestsFile);
    res.json(requests);
});

app.get('/api/chat', (req, res) => {
    const chat = readJSONFile(chatFile);
    res.json(chat);
});

// Update data
app.post('/api/users', (req, res) => {
    if (writeJSONFile(usersFile, req.body)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save users' });
    }
});

app.post('/api/subjects', (req, res) => {
    if (writeJSONFile(subjectsFile, req.body)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save subjects' });
    }
});

app.post('/api/homework', (req, res) => {
    if (writeJSONFile(homeworkFile, req.body)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save homework' });
    }
});

app.post('/api/requests', (req, res) => {
    if (writeJSONFile(requestsFile, req.body)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save requests' });
    }
});

app.post('/api/chat', (req, res) => {
    if (writeJSONFile(chatFile, req.body)) {
        res.json({ success: true });
    } else {
        res.status(500).json({ error: 'Failed to save chat' });
    }
});

// File upload endpoint
app.post('/api/upload', upload.array('files'), (req, res) => {
    try {
        const files = req.files.map(file => ({
            name: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size,
            mimetype: file.mimetype,
            url: `/uploads/${req.body.subject || 'general'}/${file.filename}`
        }));
        
        res.json({ success: true, files });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload files' });
    }
});

// Serve static files from frontend
app.use(express.static('.'));

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
