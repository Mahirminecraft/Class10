// Application State
let currentUser = null;
let currentSubject = null;

// Data Storage - using localStorage for GitHub Pages compatibility
let users = {};
let subjects = {};
let homework = {};
let accountRequests = [];
let chatMessages = [];

// localStorage Functions
function loadAllData() {
    try {
        // Initialize with default data if not exists
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

        // Load from localStorage or use defaults
        users = JSON.parse(localStorage.getItem('secureNotes_users')) || defaultUsers;
        subjects = JSON.parse(localStorage.getItem('secureNotes_subjects')) || defaultSubjects;
        homework = JSON.parse(localStorage.getItem('secureNotes_homework')) || defaultHomework;
        accountRequests = JSON.parse(localStorage.getItem('secureNotes_requests')) || [];
        chatMessages = JSON.parse(localStorage.getItem('secureNotes_chat')) || [];

        return true;
    } catch (error) {
        console.error('Failed to load data:', error);
        return false;
    }
}

function saveData(type, data) {
    try {
        localStorage.setItem(`secureNotes_${type}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Failed to save ${type}:`, error);
        return false;
    }
}

// File Upload Function (disabled for static hosting)
async function uploadFiles(files, subject) {
    // File upload not available in static hosting
    showMessage('File uploads are not available in this version', 'warning');
    return [];
}

// Simplified login management
function setUserLoggedIn(userId) {
    if (users[userId]) {
        users[userId].isLoggedIn = true;
        saveData('users', users);
    }
}

function logoutUser(userId) {
    if (users[userId]) {
        users[userId].isLoggedIn = false;
        saveData('users', users);
    }
}

// Account Request Management
function submitAccountRequest(fullName, rollNo, password) {
    const request = {
        id: Date.now(),
        fullName,
        rollNo,
        password,
        requestDate: new Date().toISOString(),
        status: 'pending'
    };

    accountRequests.push(request);
    saveData('requests', accountRequests);
    return request.id;
}

function approveAccountRequest(requestId) {
    const request = accountRequests.find(req => req.id === requestId);
    if (!request) return false;

    const userId = `student_${request.rollNo}`;

    if (users[userId]) {
        showMessage('User with this roll number already exists!', 'error');
        return false;
    }

    users[userId] = {
        password: request.password,
        name: request.fullName,
        role: 'student',
        devices: [],
        activeDevice: null,
        ipAddress: null,
        isLoggedIn: false,
        banned: false,
        homeworkHidden: false
    };

    request.status = 'approved';

    saveData('users', users);
    saveData('requests', accountRequests);

    return true;
}

function rejectAccountRequest(requestId) {
    const request = accountRequests.find(req => req.id === requestId);
    if (!request) return false;

    request.status = 'rejected';
    saveData('requests', accountRequests);
    return true;
}

// Screen Management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showMessage(message, type = 'info') {
    const messageEl = document.getElementById('loginMessage') || document.getElementById('requestMessage');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `message ${type}`;
        messageEl.style.display = 'block';

        setTimeout(() => {
            messageEl.style.display = 'none';
        }, 5000);
    }
}

// Subject Management
function loadSubjects() {
    const container = document.getElementById('subjectsContainer');
    const select = document.getElementById('homeworkSubject');
    const currentSubjectsDiv = document.getElementById('currentSubjects');

    // Clear existing content
    if (container) container.innerHTML = '';
    if (select) select.innerHTML = '<option value="">Select Subject</option>';
    if (currentSubjectsDiv) currentSubjectsDiv.innerHTML = '';

    // Load subject cards
    Object.keys(subjects).forEach(subjectCode => {
        const subject = subjects[subjectCode];

        // Add to main dashboard
        if (container) {
            const card = document.createElement('div');
            card.className = 'subject-card';
            card.setAttribute('data-subject', subjectCode);
            card.innerHTML = `
                <h3>${subject.name}</h3>
                <p>${subject.description}</p>
            `;
            card.addEventListener('click', () => showSubject(subjectCode));
            container.appendChild(card);
        }

        // Add to homework form select
        if (select) {
            const option = document.createElement('option');
            option.value = subjectCode;
            option.textContent = subject.name;
            select.appendChild(option);
        }

        // Add to current subjects list in admin
        if (currentSubjectsDiv) {
            const subjectItem = document.createElement('div');
            subjectItem.className = 'subject-item';
            subjectItem.innerHTML = `
                <div class="subject-info">
                    <div class="subject-name">${subject.name}</div>
                    <div class="subject-desc">${subject.description}</div>
                </div>
                <button onclick="removeSubject('${subjectCode}')" class="btn-danger">Remove</button>
            `;
            currentSubjectsDiv.appendChild(subjectItem);
        }
    });
}

async function addSubject(code, name, description) {
    if (subjects[code]) {
        showMessage('Subject code already exists!', 'error');
        return;
    }

    subjects[code] = { name, description };
    homework[code] = [];

    await saveData('subjects', subjects);
    await saveData('homework', homework);

    loadSubjects();
    showMessage('Subject added successfully!', 'success');
}

async function removeSubject(code) {
    if (confirm(`Are you sure you want to remove ${subjects[code].name}? This will delete all homework for this subject.`)) {
        delete subjects[code];
        delete homework[code];

        await saveData('subjects', subjects);
        await saveData('homework', homework);

        loadSubjects();
        showMessage('Subject removed successfully!', 'success');
    }
}

// File Display Function
function displayFiles(files) {
    if (!files || files.length === 0) return '';

    return `
        <div class="file-attachments">
            <h4>Attachments:</h4>
            ${files.map(file => {
                const fileUrl = file.url || file.data;
                if (file.mimetype && file.mimetype.startsWith('image/')) {
                    return `
                        <div class="file-attachment image">
                            <img src="${fileUrl}" alt="${file.name}" class="file-preview">
                            <div>${file.name}</div>
                        </div>
                    `;
                } else {
                    return `
                        <a href="${fileUrl}" download="${file.name}" class="file-attachment" target="_blank">
                            📎 ${file.name}
                        </a>
                    `;
                }
            }).join('')}
        </div>
    `;
}

// Remove homework function
async function removeHomework(subject, homeworkId) {
    if (!homework[subject]) return false;

    homework[subject] = homework[subject].filter(item => item.id !== homeworkId);
    await saveData('homework', homework);

    // Reload the homework list if we're currently viewing this subject
    if (currentSubject === subject) {
        loadHomework(subject);
    }

    showMessage('Homework removed successfully!', 'success');
    return true;
}

// Authentication
async function login(userId, password) {
    console.log('Login attempt for userId:', userId);
    console.log('Available users:', Object.keys(users));

    if (!users[userId]) {
        showMessage('User ID not found. Please check your credentials or request an account.', 'error');
        return false;
    }

    if (users[userId].password !== password) {
        showMessage('Incorrect password. Access denied.', 'error');
        return false;
    }

    if (users[userId].banned) {
        showMessage('Your account has been banned. Contact administrator.', 'error');
        return false;
    }

    await setUserLoggedIn(userId);
    currentUser = { id: userId, ...users[userId] };
    saveSession(userId);

    // Check if this user has an approved request to show notification
    const approvedRequest = accountRequests.find(req => 
        `student_${req.rollNo}` === userId && req.status === 'approved'
    );

    if (approvedRequest && !localStorage.getItem(`approval_shown_${userId}`)) {
        showApprovalNotification(userId, users[userId].password);
        localStorage.setItem(`approval_shown_${userId}`, 'true');
    } else {
        showDashboard();
    }

    return true;
}



async function logout() {
    if (currentUser) {
        await logoutUser(currentUser.id);
        clearSession();
    }
    currentUser = null;
    currentSubject = null;
    showScreen('loginScreen');
    document.getElementById('loginForm').reset();
}

function showDashboard() {
    showScreen('dashboardScreen');
    document.getElementById('userWelcome').textContent = `Welcome, ${currentUser.name}`;

    const adminBtn = document.getElementById('adminBtn');
    const clearChatBtn = document.getElementById('clearChatBtn');

    if (currentUser.role === 'admin') {
        adminBtn.style.display = 'block';
        clearChatBtn.style.display = 'block';
    } else {
        adminBtn.style.display = 'none';
        clearChatBtn.style.display = 'none';
    }

    loadSubjects();
}

function showSubject(subject) {
    currentSubject = subject;
    showScreen('subjectScreen');

    const subjectTitle = document.getElementById('subjectTitle');
    subjectTitle.textContent = subjects[subject]?.name || subject;
    loadHomework(subject);
}

function loadHomework(subject) {
    const homeworkList = document.getElementById('homeworkList');
    const items = homework[subject] || [];

    // Check if homework is hidden for this user
    if (currentUser && currentUser.role === 'student' && users[currentUser.id] && users[currentUser.id].homeworkHidden) {
        homeworkList.innerHTML = '<div class="homework-item"><h3>Homework temporarily unavailable</h3><p>Contact your teacher for more information.</p></div>';
        return;
    }

    if (items.length === 0) {
        homeworkList.innerHTML = '<div class="homework-item"><h3>No homework assigned yet</h3><p>Check back later for updates.</p></div>';
        return;
    }

    homeworkList.innerHTML = items.map(item => `
        <div class="homework-item">
            <div class="homework-header">
                <h3>${item.title}</h3>
                ${currentUser && currentUser.role === 'admin' ? 
                    `<button onclick="removeHomeworkItem('${subject}', ${item.id})" class="btn-danger homework-remove-btn">Delete</button>` 
                    : ''
                }
            </div>
            <div class="due-date">Due: ${new Date(item.dueDate).toLocaleDateString('en-IN')}</div>
            <div class="content">${item.content}</div>
            ${displayFiles(item.files)}
        </div>
    `).join('');
}

// Admin Functions
function showAdminPanel() {
    if (currentUser.role !== 'admin') {
        showMessage('Access denied. Admin privileges required.', 'error');
        return;
    }
    showScreen('adminScreen');
    loadSubjects();
    loadAccountRequests();
    loadUsersList();
}

function loadUsersList() {
    const usersContainer = document.getElementById('usersList');
    if (!usersContainer) return;

    const userEntries = Object.entries(users);

    if (userEntries.length === 0) {
        usersContainer.innerHTML = '<div class="user-item">No users found</div>';
        return;
    }

    usersContainer.innerHTML = userEntries.map(([userId, user]) => `
        <div class="user-item">
            <div class="user-info">
                <div class="user-name"><strong>${user.name}</strong></div>
                <div class="user-id">ID: ${userId}</div>
                <div class="user-role">Role: ${user.role}</div>
                <div class="user-status">Status: ${user.isLoggedIn ? 'Online' : 'Offline'}</div>
            </div>
            <div class="user-actions">
                <button onclick="toggleUserBan('${userId}')" class="btn-${user.banned ? 'primary' : 'danger'}">
                    ${user.banned ? 'Unban' : 'Ban'}
                </button>
                <button onclick="hideUserHomework('${userId}')" class="btn-secondary">Hide HW</button>
                <button onclick="showUserHomework('${userId}')" class="btn-primary">Show HW</button>
                <button onclick="deleteUser('${userId}')" class="btn-danger">Delete</button>
            </div>
        </div>
    `).join('');
}

async function toggleUserBan(userId) {
    if (!users[userId]) return;

    users[userId].banned = !users[userId].banned;

    if (users[userId].banned) {
        users[userId].isLoggedIn = false;
        users[userId].activeDevice = null;
        showMessage(`User ${users[userId].name} has been banned`, 'warning');
    } else {
        showMessage(`User ${users[userId].name} has been unbanned`, 'success');
    }

    // Save to local storage
    await saveData('users', users);

    // Save to server's users.json file
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(users)
        });

        if (!response.ok) {
            throw new Error('Failed to save user ban status to server');
        }

        loadUsersList();
    } catch (error) {
        console.error('Failed to save user ban status to server:', error);
        showMessage('Ban status updated locally but failed to save to server', 'warning');
    }
}

async function hideUserHomework(userId) {
    if (!users[userId]) return;

    users[userId].homeworkHidden = true;
    
    // Save to local storage
    await saveData('users', users);

    // Save to server's users.json file
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(users)
        });

        if (!response.ok) {
            throw new Error('Failed to save homework visibility to server');
        }

        showMessage(`Homework hidden for ${users[userId].name}`, 'warning');
        loadUsersList();
    } catch (error) {
        console.error('Failed to save homework visibility to server:', error);
        showMessage('Homework visibility updated locally but failed to save to server', 'warning');
    }
}

async function showUserHomework(userId) {
    if (!users[userId]) return;

    users[userId].homeworkHidden = false;
    
    // Save to local storage
    await saveData('users', users);

    // Save to server's users.json file
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(users)
        });

        if (!response.ok) {
            throw new Error('Failed to save homework visibility to server');
        }

        showMessage(`Homework shown for ${users[userId].name}`, 'success');
        loadUsersList();
    } catch (error) {
        console.error('Failed to save homework visibility to server:', error);
        showMessage('Homework visibility updated locally but failed to save to server', 'warning');
    }
}

async function deleteUser(userId) {
    if (!users[userId]) return;

    if (userId === currentUser.id) {
        showMessage('You cannot delete your own account!', 'error');
        return;
    }

    if (confirm(`Are you sure you want to delete user ${users[userId].name}? This action cannot be undone.`)) {
        delete users[userId];
        
        // Save to local storage
        await saveData('users', users);
        
        // Save to server's users.json file
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(users)
            });

            if (!response.ok) {
                throw new Error('Failed to save user deletion to server');
            }

            showMessage('User deleted successfully', 'success');
            loadUsersList();
        } catch (error) {
            console.error('Failed to save user deletion to server:', error);
            showMessage('User deleted locally but failed to save to server', 'warning');
        }
    }
}

function loadAccountRequests() {
    const requestsContainer = document.getElementById('accountRequestsList');
    if (!requestsContainer) return;

    const pendingRequests = accountRequests.filter(req => req.status === 'pending');

    if (pendingRequests.length === 0) {
        requestsContainer.innerHTML = '<div class="request-item">No pending requests</div>';
        return;
    }

    requestsContainer.innerHTML = pendingRequests.map(request => `
        <div class="request-item">
            <div class="request-info">
                <div class="request-name"><strong>${request.fullName}</strong></div>
                <div class="request-roll">Roll No: ${request.rollNo}</div>
                <div class="request-date">Requested: ${new Date(request.requestDate).toLocaleDateString()}</div>
            </div>
            <div class="request-actions">
                <button onclick="approveRequest(${request.id})" class="btn-primary">Approve</button>
                <button onclick="rejectRequest(${request.id})" class="btn-danger">Reject</button>
            </div>
        </div>
    `).join('');
}

window.approveRequest = function(requestId) {
    if (approveAccountRequest(requestId)) {
        showMessage('Account request approved successfully!', 'success');
        loadAccountRequests();
    }
}

window.rejectRequest = function(requestId) {
    if (rejectAccountRequest(requestId)) {
        showMessage('Account request rejected.', 'warning');
        loadAccountRequests();
    }
}



function showRequestForm() {
    showScreen('requestScreen');
}

function addHomework(subject, title, content, dueDate, files) {
    if (!homework[subject]) {
        homework[subject] = [];
    }

    const newHomework = {
        id: Date.now(),
        title,
        content,
        dueDate,
        files: files || []
    };

    homework[subject].push(newHomework);
    saveData('homework', homework);

    showMessage('Homework added successfully!', 'success');
}

async function addUser(userId, password, name, role) {
    if (users[userId]) {
        showMessage('User ID already exists', 'error');
        return;
    }

    users[userId] = {
        password: password,
        name: name,
        role: role,
        devices: [],
        activeDevice: null,
        ipAddress: null,
        isLoggedIn: false,
        banned: false,
        homeworkHidden: false
    };

    // Save to local storage
    saveData('users', users);

    // Save to server's users.json file
    try {
        const response = await fetch('/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(users)
        });

        if (!response.ok) {
            throw new Error('Failed to save user to server');
        }

        loadUsersList();
        showMessage('User added successfully', 'success');
    } catch (error) {
        console.error('Failed to save user to server:', error);
        showMessage('User added locally but failed to save to server', 'warning');
    }
}

// Session Management
function saveSession(userId) {
    localStorage.setItem('secureNotes_currentUser', userId);
}

function clearSession() {
    localStorage.removeItem('secureNotes_currentUser');
}

function getStoredSession() {
    return localStorage.getItem('secureNotes_currentUser');
}

async function restoreSession() {
    const storedUserId = getStoredSession();
    if (!storedUserId) return false;

    console.log('Attempting to restore session for:', storedUserId);

    if (!users[storedUserId]) {
        console.log('Stored user not found, clearing session');
        clearSession();
        return false;
    }

    const user = users[storedUserId];

    // Check if user is still logged in
    if (user.isLoggedIn) {
        console.log('Restoring user session:', storedUserId);
        currentUser = { id: storedUserId, ...user };
        showDashboard();
        return true;
    } else {
        console.log('Session expired, clearing session');
        clearSession();
        return false;
    }
}

// Initialize Application
function init() {
    // Load data from localStorage
    loadAllData();

    // Try to restore previous session
    restoreSession();

    // Event Listeners
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const password = document.getElementById('password').value;
        await login(userId, password);
    });

    document.getElementById('guestBtn').addEventListener('click', () => {
        showScreen('guestScreen');
    });

    document.getElementById('backToLoginBtn').addEventListener('click', () => {
        showScreen('loginScreen');
    });

    document.getElementById('requestAccountBtn').addEventListener('click', showRequestForm);

    document.getElementById('backToLoginFromRequest').addEventListener('click', () => {
        showScreen('loginScreen');
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);
    document.getElementById('logoutBtn2').addEventListener('click', logout);
    document.getElementById('logoutBtn3').addEventListener('click', logout);

    document.getElementById('adminBtn').addEventListener('click', showAdminPanel);

    document.getElementById('backToDashboard').addEventListener('click', showDashboard);
    document.getElementById('backFromAdmin').addEventListener('click', showDashboard);

    // Admin forms
    document.getElementById('addHomeworkForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const subject = document.getElementById('homeworkSubject').value;
        const title = document.getElementById('homeworkTitle').value;
        const content = document.getElementById('homeworkContent').value;
        const dueDate = document.getElementById('homeworkDue').value;
        const fileInput = document.getElementById('homeworkFiles');

        let files = [];
        if (fileInput.files.length > 0) {
            showMessage('Uploading files...', 'info');
            files = await uploadFiles(fileInput.files, subject);
        }

        await addHomework(subject, title, content, dueDate, files);
        e.target.reset();
    });

    document.getElementById('addUserForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('newUserId').value;
        const password = document.getElementById('newUserPassword').value;
        const name = document.getElementById('newUserName').value;
        const role = document.getElementById('newUserRole').value;

        await addUser(userId, password, name, role);
        e.target.reset();
    });

    document.getElementById('addSubjectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const code = document.getElementById('subjectCode').value.toLowerCase().replace(/\s+/g, '_');
        const name = document.getElementById('subjectName').value;
        const description = document.getElementById('subjectDescription').value;

        await addSubject(code, name, description);
        e.target.reset();
    });

    document.getElementById('accountRequestForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('requestFullName').value;
        const rollNo = document.getElementById('requestRollNo').value;
        const password = document.getElementById('requestPassword').value;
        const confirmPassword = document.getElementById('requestConfirmPassword').value;

        if (password !== confirmPassword) {
            showMessage('Passwords do not match!', 'error');
            return;
        }

        if (password.length < 6) {
            showMessage('Password must be at least 6 characters long!', 'error');
            return;
        }

        const requestId = await submitAccountRequest(fullName, rollNo, password);
        showMessage(`Account request submitted successfully! Request ID: ${requestId}`, 'success');
        document.getElementById('accountRequestForm').reset();

        setTimeout(() => {
            showScreen('loginScreen');
        }, 3000);
    });

    // Chat event listeners
    document.getElementById('chatForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const content = input.value.trim();

        if (content) {
            await sendMessage(content);
            input.value = '';
        }
    });

    loadSubjects();
}

// Chat Functions
async function sendMessage(content) {
    if (!currentUser || !content.trim()) return;

    const message = {
        id: Date.now(),
        userId: currentUser.id,
        userName: users[currentUser.id].name,
        userRole: currentUser.role,
        content: content.trim(),
        timestamp: new Date().toISOString(),
        edited: false,
        editedAt: null
    };

    chatMessages.push(message);
    await saveData('chat', chatMessages);
    loadChatMessages();
    return true;
}

async function editMessage(messageId, newContent) {
    if (!currentUser || !newContent.trim()) return false;

    const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return false;

    const message = chatMessages[messageIndex];

    // Check if user can edit this message
    if (message.userId !== currentUser.id && currentUser.role !== 'admin') {
        showMessage('You can only edit your own messages', 'error');
        return false;
    }

    message.content = newContent.trim();
    message.edited = true;
    message.editedAt = new Date().toISOString();

    await saveData('chat', chatMessages);
    loadChatMessages();
    showMessage('Message edited successfully', 'success');
    return true;
}

async function deleteMessage(messageId) {
    if (!currentUser) return false;

    const messageIndex = chatMessages.findIndex(msg => msg.id === messageId);
    if (messageIndex === -1) return false;

    const message = chatMessages[messageIndex];

    // Check if user can delete this message
    if (message.userId !== currentUser.id && currentUser.role !== 'admin') {
        showMessage('You can only delete your own messages', 'error');
        return false;
    }

    if (confirm('Are you sure you want to delete this message?')) {
        chatMessages.splice(messageIndex, 1);
        await saveData('chat', chatMessages);
        loadChatMessages();
        showMessage('Message deleted successfully', 'success');
        return true;
    }
    return false;
}

async function clearChat() {
    if (currentUser.role !== 'admin') {
        showMessage('Only admins can clear chat', 'error');
        return;
    }

    const confirmed = confirm('Are you absolutely sure you want to delete ALL chat messages? This action cannot be undone!');
    if (!confirmed) return;

    const doubleConfirm = confirm('This will permanently delete all chat history. Are you really sure?');
    if (!doubleConfirm) return;

    chatMessages = [];
    await saveData('chat', chatMessages);
    loadChatMessages();
    showMessage('Chat cleared successfully', 'success');
}

function loadChatMessages() {
    const chatContainer = document.getElementById('chatMessages');
    if (!chatContainer) return;

    if (chatMessages.length === 0) {
        chatContainer.innerHTML = '<div class="chat-message system">No messages yet. Start the conversation!</div>';
        return;
    }

    chatContainer.innerHTML = chatMessages.map(message => {
        const isAdmin = message.userRole === 'admin';
        const isOwnMessage = currentUser && message.userId === currentUser.id;
        const canEditDelete = isOwnMessage || (currentUser && currentUser.role === 'admin');
        const displayName = isAdmin ? '[Admin]' : message.userId;
        const nameClass = isAdmin ? 'admin-name' : 'user-name';
        const timeString = new Date(message.timestamp).toLocaleString();
        const messageClass = isOwnMessage ? 'own-message' : 'other-message';
        const editedText = message.edited ? ' (edited)' : '';

        return `
            <div class="chat-message ${messageClass}" data-message-id="${message.id}">
                <div class="message-header">
                    <span class="${nameClass}">${displayName}</span>
                    <div class="message-time-actions">
                        <span class="message-time">${timeString}${editedText}</span>
                        ${canEditDelete ? `
                            <div class="message-actions">
                                <button onclick="startEditMessage(${message.id})" class="message-action-btn edit-btn" title="Edit">✏️</button>
                                <button onclick="deleteMessage(${message.id})" class="message-action-btn delete-btn" title="Delete">🗑️</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="message-bubble">
                    <div class="message-content" id="content-${message.id}">${message.content}</div>
                    <div class="message-edit-form" id="edit-${message.id}" style="display: none;">
                        <textarea class="edit-textarea" id="edit-text-${message.id}">${message.content}</textarea>
                        <div class="edit-actions">
                            <button onclick="saveEditMessage(${message.id})" class="btn-primary btn-small">Save</button>
                            <button onclick="cancelEditMessage(${message.id})" class="btn-secondary btn-small">Cancel</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // Auto scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function toggleChat() {
    const chatPanel = document.getElementById('chatPanel');
    chatPanel.classList.toggle('active');

    if (chatPanel.classList.contains('active')) {
        loadChatMessages();
        document.getElementById('chatInput').focus();
    }
}

// Edit message UI functions
function startEditMessage(messageId) {
    const contentDiv = document.getElementById(`content-${messageId}`);
    const editForm = document.getElementById(`edit-${messageId}`);

    if (contentDiv && editForm) {
        contentDiv.style.display = 'none';
        editForm.style.display = 'block';

        const textarea = document.getElementById(`edit-text-${messageId}`);
        if (textarea) {
            textarea.focus();
            textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        }
    }
}

function cancelEditMessage(messageId) {
    const contentDiv = document.getElementById(`content-${messageId}`);
    const editForm = document.getElementById(`edit-${messageId}`);

    if (contentDiv && editForm) {
        contentDiv.style.display = 'block';
        editForm.style.display = 'none';
    }
}

async function saveEditMessage(messageId) {
    const textarea = document.getElementById(`edit-text-${messageId}`);
    if (!textarea) return;

    const newContent = textarea.value.trim();
    if (!newContent) {
        showMessage('Message cannot be empty', 'error');
        return;
    }

    if (await editMessage(messageId, newContent)) {
        cancelEditMessage(messageId);
    }
}

// Approval notification system
function showApprovalNotification(userId, password) {
    const modal = document.createElement('div');
    modal.className = 'modal approval-modal active';
    modal.innerHTML = `
        <div class="modal-content approval-content">
            <div class="approval-header">
                <h2>🎉 Account Approved!</h2>
            </div>
            <div class="approval-body">
                <p>Your account request has been approved successfully!</p>
                <div class="credential-info">
                    <div class="credential-item">
                        <strong>Your User ID:</strong> 
                        <code class="credential-value">${userId}</code>
                    </div>
                    <div class="credential-item">
                        <strong>Your Password:</strong> 
                        <code class="credential-value">${password}</code>
                    </div>
                </div>
                <p class="security-note">⚠️ Please save these credentials securely. You will need them for future logins.</p>
            </div>
            <div class="approval-actions">
                <button id="approvalUnderstood" class="btn-primary">I Understand</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('approvalUnderstood').onclick = () => {
        document.body.removeChild(modal);
        showDashboard();
    };
}

// Global functions for HTML onclick handlers
window.removeSubject = removeSubject;
window.removeHomeworkItem = async function(subject, homeworkId) {
    if (confirm('Are you sure you want to remove this homework?')) {
        await removeHomework(subject, homeworkId);
    }
};
window.toggleUserBan = toggleUserBan;
window.hideUserHomework = hideUserHomework;
window.showUserHomework = showUserHomework;
window.deleteUser = deleteUser;
window.sendMessage = sendMessage;
window.clearChat = clearChat;
window.toggleChat = toggleChat;
window.editMessage = editMessage;
window.deleteMessage = deleteMessage;
window.startEditMessage = startEditMessage;
window.cancelEditMessage = cancelEditMessage;
window.saveEditMessage = saveEditMessage;

// Start the application
document.addEventListener('DOMContentLoaded', init);