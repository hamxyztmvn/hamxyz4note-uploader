// Konfigurasi
const CONFIG = {
    MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
    MAX_COMMENT_LENGTH: 300,
    MAX_NAME_LENGTH: 30,
    FILES_PER_PAGE: 10,
    TELEGRAM_TOKEN: '8284681567:AAFc3bN5QUP2qisYYoJaVeAwHNCpmvn5gWc',
    TELEGRAM_CHAT_ID: '8200190115'
};

// State
let state = {
    files: JSON.parse(localStorage.getItem('hamxyz4note_files') || '[]'),
    comments: JSON.parse(localStorage.getItem('hamxyz4note_comments') || '[]'),
    darkMode: localStorage.getItem('darkMode') === 'true',
    currentPage: 1,
    currentFilter: 'all',
    currentFile: null,
    history: ['home'], // Track navigation history
    currentSection: 'home'
};

// DOM Elements
const elements = {
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    themeToggle: document.getElementById('themeToggle'),
    menuToggle: document.getElementById('menuToggle'),
    nav: document.querySelector('.nav'),
    backBtn: document.getElementById('backBtn'),
    
    // Upload
    uploadArea: document.getElementById('uploadArea'),
    fileInput: document.getElementById('fileInput'),
    quickBtns: document.querySelectorAll('.quick-btn'),
    progressContainer: document.getElementById('progressContainer'),
    progressFill: document.getElementById('progressFill'),
    progressText: document.getElementById('progressText'),
    
    // Result
    resultContainer: document.getElementById('resultContainer'),
    linkText: document.getElementById('linkText'),
    copyLinkBtn: document.getElementById('copyLinkBtn'),
    openLinkBtn: document.getElementById('openLinkBtn'),
    shareLinkBtn: document.getElementById('shareLinkBtn'),
    
    // Files
    filesList: document.getElementById('filesList'),
    searchInput: document.getElementById('searchInput'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    loadMoreBtn: document.getElementById('loadMoreBtn'),
    
    // Comments
    commentName: document.getElementById('commentName'),
    commentText: document.getElementById('commentText'),
    nameCount: document.getElementById('nameCount'),
    commentCount: document.getElementById('commentCount'),
    submitCommentBtn: document.getElementById('submitCommentBtn'),
    commentsList: document.getElementById('commentsList'),
    
    // Stats
    onlineCount: document.getElementById('onlineCount'),
    fileCount: document.getElementById('fileCount'),
    commentCountStat: document.getElementById('commentCount'),
    
    // Modal
    downloadModal: document.getElementById('downloadModal'),
    modalClose: document.getElementById('modalClose'),
    modalFileName: document.getElementById('modalFileName'),
    modalFileSize: document.getElementById('modalFileSize'),
    modalFileDate: document.getElementById('modalFileDate'),
    modalFileUser: document.getElementById('modalFileUser'),
    modalFileIcon: document.getElementById('modalFileIcon'),
    downloadBtn: document.getElementById('downloadBtn'),
    copyModalLinkBtn: document.getElementById('copyModalLinkBtn'),
    
    // Notification
    notification: document.getElementById('notification'),
    notificationText: document.getElementById('notificationText')
};

// Initialize
function init() {
    // Load state
    loadState();
    
    // Setup event listeners
    setupEventListeners();
    
    // Render initial data
    renderFiles();
    renderComments();
    updateStats();
    
    // Update back button visibility
    updateBackButton();
    
    // Show welcome message
    setTimeout(() => {
        showNotification('Selamat datang di Hamxyz4note Uploader!');
    }, 1000);
    
    // Handle browser back button
    setupBrowserBackButton();
}

// Load state from localStorage
function loadState() {
    if (state.darkMode) {
        document.body.classList.add('dark-mode');
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Simulate online users
    elements.onlineCount.textContent = Math.floor(Math.random() * 50) + 10;
}

// Setup event listeners
function setupEventListeners() {
    // Navigation
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);
            navigateTo(target);
            
            // Close mobile menu
            if (window.innerWidth < 768) {
                elements.nav.classList.remove('active');
            }
        });
    });
    
    // Theme toggle
    elements.themeToggle.addEventListener('click', toggleTheme);
    
    // Menu toggle
    elements.menuToggle.addEventListener('click', () => {
        elements.nav.classList.toggle('active');
        addClickEffect(elements.menuToggle);
    });
    
    // Back button
    elements.backBtn.addEventListener('click', goBack);
    
    // Upload
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.uploadArea.addEventListener('dragover', handleDragOver);
    elements.uploadArea.addEventListener('drop', handleDrop);
    elements.fileInput.addEventListener('change', handleFileSelect);
    
    // Quick buttons
    elements.quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            elements.fileInput.accept = btn.dataset.type;
            elements.fileInput.click();
            addClickEffect(btn);
        });
    });
    
    // Link buttons
    elements.copyLinkBtn.addEventListener('click', copyLink);
    elements.openLinkBtn.addEventListener('click', openLink);
    elements.shareLinkBtn.addEventListener('click', shareLink);
    
    // Comments
    elements.commentName.addEventListener('input', updateCharCounts);
    elements.commentText.addEventListener('input', updateCharCounts);
    elements.submitCommentBtn.addEventListener('click', submitComment);
    
    // Files
    elements.searchInput.addEventListener('input', filterFiles);
    elements.filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            elements.filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            state.currentFilter = tab.dataset.filter;
            state.currentPage = 1;
            renderFiles();
            addClickEffect(tab);
        });
    });
    
    elements.loadMoreBtn.addEventListener('click', loadMoreFiles);
    
    // Modal
    elements.modalClose.addEventListener('click', () => {
        elements.downloadModal.style.display = 'none';
    });
    
    elements.downloadBtn.addEventListener('click', downloadCurrentFile);
    elements.copyModalLinkBtn.addEventListener('click', copyModalLink);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.downloadModal) {
            elements.downloadModal.style.display = 'none';
        }
    });
    
    // Update char counts
    updateCharCounts();
}

// Setup browser back button handling
function setupBrowserBackButton() {
    // Handle popstate (browser back/forward)
    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.section) {
            navigateTo(event.state.section, false); // Don't push to history again
        } else {
            navigateTo('home', false);
        }
    });
}

// Navigation functions
function navigateTo(sectionId, pushToHistory = true) {
    // Update current section
    state.currentSection = sectionId;
    
    // Add to history if not going back
    if (pushToHistory && sectionId !== state.history[state.history.length - 1]) {
        state.history.push(sectionId);
        
        // Update URL hash
        window.location.hash = sectionId;
        
        // Push to browser history
        history.pushState({ section: sectionId }, '', `#${sectionId}`);
    }
    
    // Show section
    showSection(sectionId);
    
    // Update navigation
    updateNavigation();
    
    // Update back button
    updateBackButton();
}

function goBack() {
    // Remove current section from history
    state.history.pop();
    
    // If there's a previous section, go back
    if (state.history.length > 0) {
        const previousSection = state.history[state.history.length - 1];
        navigateTo(previousSection, false);
        
        // Update browser history
        history.back();
    } else {
        // Default to home
        navigateTo('home', false);
    }
    
    addClickEffect(elements.backBtn);
}

// Global goBack function for inline onclick
window.goBack = goBack;

function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function updateNavigation() {
    // Update active nav link
    elements.navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${state.currentSection}`) {
            link.classList.add('active');
        }
    });
}

function updateBackButton() {
    // Show back button if not on home page
    const showBack = state.currentSection !== 'home' && state.history.length > 1;
    
    if (showBack) {
        elements.backBtn.style.display = 'flex';
    } else {
        elements.backBtn.style.display = 'none';
    }
}

// Theme toggle
function toggleTheme() {
    state.darkMode = !state.darkMode;
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', state.darkMode);
    
    if (state.darkMode) {
        elements.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        showNotification('Mode gelap diaktifkan');
    } else {
        elements.themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        showNotification('Mode terang diaktifkan');
    }
    
    addClickEffect(elements.themeToggle);
}

// File handling
function handleDragOver(e) {
    e.preventDefault();
    elements.uploadArea.style.borderColor = 'var(--primary-dark)';
    elements.uploadArea.style.transform = 'scale(1.02)';
}

function handleDrop(e) {
    e.preventDefault();
    elements.uploadArea.style.borderColor = 'var(--primary)';
    elements.uploadArea.style.transform = 'scale(1)';
    
    if (e.dataTransfer.files.length) {
        handleFiles(e.dataTransfer.files);
    }
}

function handleFileSelect() {
    if (elements.fileInput.files.length) {
        handleFiles(elements.fileInput.files);
    }
}

function handleFiles(fileList) {
    const files = Array.from(fileList);
    
    files.forEach(file => {
        if (file.size > CONFIG.MAX_FILE_SIZE) {
            showNotification(`File ${file.name} terlalu besar (maks 100MB)`, 'error');
            return;
        }
        
        uploadFile(file);
    });
    
    elements.fileInput.value = '';
}

function uploadFile(file) {
    showProgress();
    
    // Simulate upload
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 15 + 5;
        if (progress > 100) progress = 100;
        
        updateProgress(progress, `Mengupload ${truncateText(file.name, 20)}...`);
        
        if (progress === 100) {
            clearInterval(interval);
            finishUpload(file);
        }
    }, 200);
}

function showProgress() {
    elements.progressContainer.style.display = 'block';
    elements.resultContainer.style.display = 'none';
    updateProgress(0, 'Mempersiapkan...');
}

function updateProgress(percent, text) {
    elements.progressFill.style.width = `${percent}%`;
    elements.progressText.textContent = text;
}

function finishUpload(file) {
    const fileId = generateId();
    const fileObj = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type,
        category: getFileCategory(file.name),
        uploadTime: new Date().toISOString(),
        uploader: 'Pengguna',
        downloads: 0,
        public: true
    };
    
    // Add to state
    state.files.unshift(fileObj);
    saveState();
    
    // Generate link
    generateLink(fileObj);
    
    // Send to Telegram
    sendToTelegram(fileObj);
    
    // Update UI
    updateStats();
    renderFiles();
    showNotification(`${file.name} berhasil diupload!`);
    
    // Hide progress after delay
    setTimeout(() => {
        elements.progressContainer.style.display = 'none';
    }, 1500);
}

function generateLink(file) {
    const baseUrl = window.location.origin + window.location.pathname;
    const link = `${baseUrl}#download=${file.id}`;
    
    elements.linkText.textContent = link;
    elements.resultContainer.style.display = 'block';
    
    // Scroll to result
    elements.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Link actions
function copyLink() {
    const link = elements.linkText.textContent;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Link berhasil disalin!');
        addClickEffect(elements.copyLinkBtn);
    });
}

function openLink() {
    const link = elements.linkText.textContent;
    window.open(link, '_blank');
    addClickEffect(elements.openLinkBtn);
}

function shareLink() {
    const link = elements.linkText.textContent;
    
    if (navigator.share) {
        navigator.share({
            title: 'File dari Hamxyz4note Uploader',
            text: 'Check out this file',
            url: link
        });
    } else {
        copyLink();
    }
    addClickEffect(elements.shareLinkBtn);
}

// Files management
function renderFiles() {
    elements.filesList.innerHTML = '';
    
    const filteredFiles = filterFilesBySearchAndFilter();
    const filesToShow = filteredFiles.slice(0, state.currentPage * CONFIG.FILES_PER_PAGE);
    
    if (filesToShow.length === 0) {
        elements.filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <p>Tidak ada file ditemukan</p>
            </div>
        `;
        elements.loadMoreBtn.style.display = 'none';
        return;
    }
    
    filesToShow.forEach(file => {
        const fileElement = createFileElement(file);
        elements.filesList.appendChild(fileElement);
    });
    
    elements.loadMoreBtn.style.display = 
        filteredFiles.length > filesToShow.length ? 'block' : 'none';
}

function createFileElement(file) {
    const element = document.createElement('div');
    element.className = 'file-item';
    element.dataset.id = file.id;
    
    const icon = getFileIcon(file.category);
    const size = formatFileSize(file.size);
    const time = formatTimeAgo(file.uploadTime);
    const color = generateColor(file.uploader);
    const initial = file.uploader.charAt(0).toUpperCase();
    
    element.innerHTML = `
        <div class="file-info">
            <div class="file-header">
                <div class="file-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="file-name" title="${file.name}">
                    ${truncateText(file.name, 25)}
                </div>
            </div>
            <div class="file-details">
                <span>${size}</span>
                <span>•</span>
                <span>${time}</span>
                <span>•</span>
                <span>${file.downloads} download</span>
            </div>
            <div class="file-uploader">
                <div class="user-avatar" style="background: ${color}">
                    ${initial}
                </div>
                <div class="user-name">${file.uploader}</div>
            </div>
        </div>
        <div class="file-actions">
            <button class="btn btn-sm btn-outline" onclick="downloadFile('${file.id}')" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="btn btn-sm btn-outline" onclick="previewFile('${file.id}')" title="Preview">
                <i class="fas fa-eye"></i>
            </button>
        </div>
    `;
    
    return element;
}

function filterFiles() {
    state.currentPage = 1;
    renderFiles();
}

function filterFilesBySearchAndFilter() {
    const searchTerm = elements.searchInput.value.toLowerCase();
    const filter = state.currentFilter;
    
    return state.files.filter(file => {
        const matchesSearch = file.name.toLowerCase().includes(searchTerm);
        const matchesFilter = filter === 'all' || file.category === filter;
        return matchesSearch && matchesFilter;
    });
}

function loadMoreFiles() {
    state.currentPage++;
    renderFiles();
    addClickEffect(elements.loadMoreBtn);
}

// Comments management
function updateCharCounts() {
    const nameLength = elements.commentName.value.length;
    const commentLength = elements.commentText.value.length;
    
    elements.nameCount.textContent = `${nameLength}/${CONFIG.MAX_NAME_LENGTH}`;
    elements.commentCount.textContent = `${commentLength}/${CONFIG.MAX_COMMENT_LENGTH}`;
}

function submitComment() {
    const name = elements.commentName.value.trim() || 'Anonim';
    const text = elements.commentText.value.trim();
    
    if (!text) {
        showNotification('Harap isi komentar terlebih dahulu', 'error');
        return;
    }
    
    if (text.length > CONFIG.MAX_COMMENT_LENGTH) {
        showNotification(`Komentar terlalu panjang (maks ${CONFIG.MAX_COMMENT_LENGTH} karakter)`, 'error');
        return;
    }
    
    if (name.length > CONFIG.MAX_NAME_LENGTH) {
        showNotification(`Nama terlalu panjang (maks ${CONFIG.MAX_NAME_LENGTH} karakter)`, 'error');
        return;
    }
    
    const comment = {
        id: generateId(),
        name: name,
        text: text,
        time: new Date().toISOString(),
        color: generateColor(name)
    };
    
    // Add to state
    state.comments.unshift(comment);
    saveState();
    
    // Update UI
    renderComments();
    updateStats();
    
    // Clear form
    elements.commentName.value = '';
    elements.commentText.value = '';
    updateCharCounts();
    
    // Show notification
    showNotification('Komentar berhasil dikirim!');
    addClickEffect(elements.submitCommentBtn);
}

function renderComments() {
    elements.commentsList.innerHTML = '<h4 class="comments-title">Komentar Terbaru</h4>';
    
    const commentsToShow = state.comments.slice(0, 10);
    
    if (commentsToShow.length === 0) {
        elements.commentsList.innerHTML += `
            <div class="empty-state">
                <i class="fas fa-comment-slash"></i>
                <p>Belum ada komentar. Jadilah yang pertama!</p>
            </div>
        `;
        return;
    }
    
    commentsToShow.forEach(comment => {
        const commentElement = createCommentElement(comment);
        elements.commentsList.appendChild(commentElement);
    });
}

function createCommentElement(comment) {
    const element = document.createElement('div');
    element.className = 'comment-item';
    
    const timeAgo = formatTimeAgo(comment.time);
    const initial = comment.name.charAt(0).toUpperCase();
    
    element.innerHTML = `
        <div class="comment-header">
            <div class="comment-avatar" style="background: ${comment.color}">
                ${initial}
            </div>
            <div class="comment-info">
                <div class="comment-name">${comment.name}</div>
                <div class="comment-time">${timeAgo}</div>
            </div>
        </div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
    `;
    
    return element;
}

// Modal functions
function previewFile(fileId) {
    const file = state.files.find(f => f.id === fileId);
    if (!file) return;
    
    state.currentFile = file;
    
    // Update modal content
    elements.modalFileName.textContent = file.name;
    elements.modalFileSize.textContent = formatFileSize(file.size);
    elements.modalFileDate.textContent = new Date(file.uploadTime).toLocaleDateString('id-ID');
    elements.modalFileUser.textContent = file.uploader;
    
    // Set icon
    const icon = getFileIcon(file.category);
    elements.modalFileIcon.innerHTML = `<i class="${icon}"></i>`;
    
    // Show modal
    elements.downloadModal.style.display = 'block';
}

function downloadCurrentFile() {
    if (!state.currentFile) return;
    
    // Simulate download
    const content = `File: ${state.currentFile.name}\nSize: ${formatFileSize(state.currentFile.size)}\nUploaded: ${new Date(state.currentFile.uploadTime).toLocaleString()}\n\nThis is a sample file from Hamxyz4note Uploader.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = state.currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update download count
    state.currentFile.downloads = (state.currentFile.downloads || 0) + 1;
    saveState();
    renderFiles();
    
    showNotification(`Mendownload ${state.currentFile.name}...`);
    addClickEffect(elements.downloadBtn);
}

function copyModalLink() {
    if (!state.currentFile) return;
    
    const link = `${window.location.origin}${window.location.pathname}#download=${state.currentFile.id}`;
    navigator.clipboard.writeText(link).then(() => {
        showNotification('Link download disalin!');
        addClickEffect(elements.copyModalLinkBtn);
    });
}

// Telegram integration
function sendToTelegram(file) {
    if (!CONFIG.TELEGRAM_TOKEN || CONFIG.TELEGRAM_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
        return;
    }
    
    const message = `
📁 *File Baru Diupload*
━━━━━━━━━━━━━━━━━━━━
📝 *Nama:* ${file.name}
📊 *Ukuran:* ${formatFileSize(file.size)}
📄 *Tipe:* ${getFileType(file.name)}
⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}
👤 *Uploader:* ${file.uploader}
━━━━━━━━━━━━━━━━━━━━
`;
    
    const url = `https://api.telegram.org/bot${CONFIG.TELEGRAM_TOKEN}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            chat_id: CONFIG.TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    }).catch(error => {
        console.error('Error sending to Telegram:', error);
    });
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileCategory(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
        return 'image';
    } else if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
        return 'video';
    } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
        return 'audio';
    } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
        return 'zip';
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        return 'doc';
    }
    
    return 'other';
}

function getFileIcon(category) {
    const icons = {
        'image': 'fas fa-file-image',
        'video': 'fas fa-file-video',
        'audio': 'fas fa-file-audio',
        'zip': 'fas fa-file-archive',
        'doc': 'fas fa-file-alt',
        'other': 'fas fa-file'
    };
    return icons[category] || icons.other;
}

function getFileType(filename) {
    const ext = filename.split('.').pop().toUpperCase();
    return ext ? `${ext} File` : 'Unknown File';
}

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) return 'baru saja';
    if (diffMin < 60) return `${diffMin}m lalu`;
    if (diffHour < 24) return `${diffHour}j lalu`;
    if (diffDay < 7) return `${diffDay}h lalu`;
    return date.toLocaleDateString('id-ID');
}

function generateColor(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 70%, 60%)`;
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateStats() {
    elements.fileCount.textContent = state.files.length;
    elements.commentCountStat.textContent = state.comments.length;
}

function saveState() {
    localStorage.setItem('hamxyz4note_files', JSON.stringify(state.files));
    localStorage.setItem('hamxyz4note_comments', JSON.stringify(state.comments));
}

function showNotification(message, type = 'success') {
    elements.notificationText.textContent = message;
    
    // Set color based on type
    const colors = {
        success: 'var(--success)',
        error: 'var(--danger)',
        warning: 'var(--warning)'
    };
    
    elements.notification.style.background = colors[type] || colors.success;
    elements.notification.style.display = 'block';
    
    // Auto hide
    setTimeout(() => {
        elements.notification.style.display = 'none';
    }, 3000);
}

function addClickEffect(element) {
    if (!element) return;
    
    element.style.transform = 'scale(0.95)';
    setTimeout(() => {
        element.style.transform = '';
    }, 150);
}

// Global functions for inline event handlers
window.downloadFile = function(fileId) {
    const file = state.files.find(f => f.id === fileId);
    if (!file) return;
    
    previewFile(fileId);
};

window.previewFile = previewFile;

// Handle hash navigation on load
function handleHashNavigation() {
    const hash = window.location.hash;
    
    if (hash.startsWith('#download=')) {
        const fileId = hash.split('=')[1];
        const file = state.files.find(f => f.id === fileId);
        if (file) {
            previewFile(fileId);
        }
    } else if (hash) {
        const target = hash.substring(1);
        if (['home', 'upload', 'files', 'comments'].includes(target)) {
            navigateTo(target, false);
        }
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    init();
    handleHashNavigation();
});

// Handle hash changes
window.addEventListener('hashchange', handleHashNavigation);

// Handle file download from URL
window.addEventListener('load', () => {
    if (window.location.hash.startsWith('#download=')) {
        setTimeout(handleHashNavigation, 500);
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
        navigateTo(e.state.section, false);
    } else if (window.location.hash) {
        handleHashNavigation();
    } else {
        navigateTo('home', false);
    }
});