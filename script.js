// Main JavaScript for Hamxyz4note Uploader

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const themeSwitch = document.getElementById('theme-switch');
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadProgress = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progressDetails = document.getElementById('progressDetails');
    const cancelUpload = document.getElementById('cancelUpload');
    const filesList = document.getElementById('filesList');
    const sortButtons = document.querySelectorAll('.sort-button');
    const notification = document.getElementById('notification');
    const notificationText = document.querySelector('.notification-text');
    const notificationIcon = document.querySelector('.notification-icon');
    const fileModal = document.getElementById('fileModal');
    const closeModal = document.getElementById('closeModal');
    const downloadUrl = document.getElementById('downloadUrl');
    const copyButton = document.getElementById('copyButton');
    const downloadButton = document.getElementById('downloadButton');
    const fileName = document.getElementById('fileName');
    const fileDate = document.getElementById('fileDate');
    const fileSize = document.getElementById('fileSize');
    const fileTypeIcon = document.getElementById('fileTypeIcon');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Current files data
    let filesData = [];
    let currentSort = 'date';
    let uploadInProgress = false;
    let currentFile = null;
    
    // Initialize the app
    function initApp() {
        // Load saved files from localStorage
        loadFilesFromStorage();
        
        // Apply saved theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            themeSwitch.checked = true;
        }
        
        // Set up event listeners
        setupEventListeners();
        
        // Display files
        renderFiles();
    }
    
    // Load files from localStorage
    function loadFilesFromStorage() {
        const savedFiles = localStorage.getItem('hamxyz4note_files');
        if (savedFiles) {
            filesData = JSON.parse(savedFiles);
        }
    }
    
    // Save files to localStorage
    function saveFilesToStorage() {
        localStorage.setItem('hamxyz4note_files', JSON.stringify(filesData));
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Theme toggle
        themeSwitch.addEventListener('change', toggleTheme);
        
        // Upload area click
        uploadArea.addEventListener('click', () => {
            if (!uploadInProgress) {
                fileInput.click();
            }
        });
        
        // File input change
        fileInput.addEventListener('change', handleFileSelect);
        
        // Drag and drop
        uploadArea.addEventListener('dragover', handleDragOver);
        uploadArea.addEventListener('dragleave', handleDragLeave);
        uploadArea.addEventListener('drop', handleDrop);
        
        // Cancel upload
        cancelUpload.addEventListener('click', cancelCurrentUpload);
        
        // Sort buttons
        sortButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sortType = button.getAttribute('data-sort');
                setSortType(sortType);
            });
        });
        
        // Close modal
        closeModal.addEventListener('click', () => {
            fileModal.style.display = 'none';
        });
        
        // Copy link button
        copyButton.addEventListener('click', copyDownloadLink);
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === fileModal) {
                fileModal.style.display = 'none';
            }
        });
    }
    
    // Toggle theme
    function toggleTheme() {
        if (themeSwitch.checked) {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    }
    
    // Set sort type
    function setSortType(sortType) {
        currentSort = sortType;
        
        // Update active button
        sortButtons.forEach(button => {
            if (button.getAttribute('data-sort') === sortType) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Sort and render files
        sortFiles();
        renderFiles();
    }
    
    // Sort files based on current sort type
    function sortFiles() {
        switch (currentSort) {
            case 'name':
                filesData.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'size':
                filesData.sort((a, b) => b.size - a.size);
                break;
            case 'date':
            default:
                filesData.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
        }
    }
    
    // Render files to the list
    function renderFiles() {
        if (filesData.length === 0) {
            filesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-import"></i>
                    <h3>Belum ada file</h3>
                    <p>Unggah file pertama Anda untuk melihatnya di sini</p>
                </div>
            `;
            return;
        }
        
        filesList.innerHTML = '';
        
        filesData.forEach((file, index) => {
            const fileElement = createFileElement(file, index);
            filesList.appendChild(fileElement);
        });
    }
    
    // Create file element
    function createFileElement(file, index) {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';
        fileElement.setAttribute('data-index', index);
        
        // Get file icon based on type
        const fileIcon = getFileIcon(file.type);
        
        // Format file size
        const formattedSize = formatFileSize(file.size);
        
        // Format date
        const formattedDate = formatDate(file.date);
        
        fileElement.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <i class="${fileIcon}"></i>
                </div>
                <div class="file-details">
                    <h3>${file.name}</h3>
                    <div class="file-meta">
                        <span><i class="fas fa-calendar"></i> ${formattedDate}</span>
                        <span><i class="fas fa-weight-hanging"></i> ${formattedSize}</span>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <button class="action-button view-button" title="Lihat">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-button share-button" title="Bagikan">
                    <i class="fas fa-share-alt"></i>
                </button>
                <button class="action-button delete-button" title="Hapus">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners to buttons
        const viewButton = fileElement.querySelector('.view-button');
        const shareButton = fileElement.querySelector('.share-button');
        const deleteButton = fileElement.querySelector('.delete-button');
        
        viewButton.addEventListener('click', (e) => {
            e.stopPropagation();
            showFileModal(file);
        });
        
        shareButton.addEventListener('click', (e) => {
            e.stopPropagation();
            shareFile(file);
        });
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFile(index);
        });
        
        // Click on file item to show modal
        fileElement.addEventListener('click', () => {
            showFileModal(file);
        });
        
        return fileElement;
    }
    
    // Get file icon based on type
    function getFileIcon(fileType) {
        if (fileType.includes('image')) return 'fas fa-file-image';
        if (fileType.includes('video')) return 'fas fa-file-video';
        if (fileType.includes('audio')) return 'fas fa-file-audio';
        if (fileType.includes('pdf')) return 'fas fa-file-pdf';
        if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('tar')) return 'fas fa-file-archive';
        if (fileType.includes('text')) return 'fas fa-file-alt';
        if (fileType.includes('word')) return 'fas fa-file-word';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return 'fas fa-file-excel';
        if (fileType.includes('powerpoint') || fileType.includes('presentation')) return 'fas fa-file-powerpoint';
        return 'fas fa-file';
    }
    
    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            return 'Hari ini';
        } else if (diffDays === 1) {
            return 'Kemarin';
        } else if (diffDays < 7) {
            return `${diffDays} hari lalu`;
        } else {
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        }
    }
    
    // Show file modal
    function showFileModal(file) {
        // Set modal content
        fileName.textContent = file.name;
        fileDate.textContent = formatDate(file.date);
        fileSize.textContent = formatFileSize(file.size);
        
        // Set file icon
        const iconClass = getFileIcon(file.type);
        fileTypeIcon.className = iconClass;
        
        // Set download URL
        const baseUrl = window.location.origin;
        const fileUrl = `${baseUrl}/download/${file.id}`;
        downloadUrl.value = fileUrl;
        
        // Set download button href
        downloadButton.href = fileUrl;
        
        // Show modal
        fileModal.style.display = 'flex';
    }
    
    // Copy download link
    function copyDownloadLink() {
        downloadUrl.select();
        document.execCommand('copy');
        
        // Show notification
        showNotification('Link berhasil disalin!', 'success');
        
        // Change button text temporarily
        const originalHTML = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i> Tersalin!';
        
        setTimeout(() => {
            copyButton.innerHTML = originalHTML;
        }, 2000);
    }
    
    // Share file
    function shareFile(file) {
        const baseUrl = window.location.origin;
        const fileUrl = `${baseUrl}/download/${file.id}`;
        
        if (navigator.share) {
            navigator.share({
                title: `Unduh ${file.name}`,
                text: `Unduh file ${file.name} dari Hamxyz4note Uploader`,
                url: fileUrl
            });
        } else {
            // Fallback to copying link
            downloadUrl.value = fileUrl;
            downloadUrl.select();
            document.execCommand('copy');
            showNotification('Link berhasil disalin!', 'success');
        }
    }
    
    // Delete file
    function deleteFile(index) {
        if (confirm('Apakah Anda yakin ingin menghapus file ini?')) {
            filesData.splice(index, 1);
            saveFilesToStorage();
            renderFiles();
            showNotification('File berhasil dihapus!', 'success');
        }
    }
    
    // Handle file selection
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            uploadFiles(files);
        }
    }
    
    // Handle drag over
    function handleDragOver(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-dark)';
        uploadArea.style.transform = 'scale(1.02)';
    }
    
    // Handle drag leave
    function handleDragLeave(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.transform = 'scale(1)';
    }
    
    // Handle drop
    function handleDrop(e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary-color)';
        uploadArea.style.transform = 'scale(1)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFiles(files);
        }
    }
    
    // Upload files
    function uploadFiles(files) {
        if (uploadInProgress) {
            showNotification('Sedang mengunggah file lain, tunggu sampai selesai.', 'warning');
            return;
        }
        
        // Reset file input
        fileInput.value = '';
        
        // Show progress
        uploadProgress.style.display = 'block';
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
        progressDetails.textContent = 'Mempersiapkan unggahan...';
        uploadInProgress = true;
        
        // Simulate upload process
        let uploadedCount = 0;
        const totalFiles = files.length;
        
        // Process each file
        Array.from(files).forEach((file, index) => {
            // Simulate upload delay
            setTimeout(() => {
                simulateFileUpload(file, index, totalFiles, () => {
                    uploadedCount++;
                    
                    if (uploadedCount === totalFiles) {
                        // All files uploaded
                        setTimeout(() => {
                            uploadProgress.style.display = 'none';
                            uploadInProgress = false;
                            showNotification(`${totalFiles} file berhasil diunggah!`, 'success');
                        }, 500);
                    }
                });
            }, index * 300);
        });
    }
    
    // Simulate file upload
    function simulateFileUpload(file, index, totalFiles, callback) {
        currentFile = file;
        
        // Show loading overlay for Telegram sending
        setTimeout(() => {
            loadingOverlay.style.display = 'flex';
        }, 1000);
        
        // Update progress
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 100) progress = 100;
            
            const overallProgress = Math.round((index / totalFiles) * 100 + (progress / totalFiles));
            progressBar.style.width = `${overallProgress}%`;
            progressText.textContent = `${overallProgress}%`;
            progressDetails.textContent = `Mengunggah: ${file.name} (${formatFileSize(file.size)})`;
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                
                // Hide loading overlay
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    
                    // Send to Telegram (simulated)
                    sendToTelegram(file);
                    
                    // Add file to list
                    addFileToList(file);
                    
                    callback();
                }, 500);
            }
        }, 100);
    }
    
    // Send file to Telegram
    function sendToTelegram(file) {
        // In a real implementation, this would send the file to Telegram via a bot
        // For demo purposes, we'll simulate it
        
        console.log(`Mengirim file ke Telegram: ${file.name}`);
        
        // Simulate API call to Telegram bot
        setTimeout(() => {
            console.log(`File ${file.name} berhasil dikirim ke Telegram`);
        }, 1000);
    }
    
    // Add file to list
    function addFileToList(file) {
        const newFile = {
            id: generateFileId(),
            name: file.name,
            size: file.size,
            type: file.type,
            date: new Date().toISOString(),
            url: `https://hamxyz4note-uploader.com/download/${generateFileId()}`
        };
        
        filesData.unshift(newFile);
        saveFilesToStorage();
        renderFiles();
    }
    
    // Generate file ID
    function generateFileId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    // Cancel current upload
    function cancelCurrentUpload() {
        if (uploadInProgress) {
            uploadProgress.style.display = 'none';
            uploadInProgress = false;
            showNotification('Unggahan dibatalkan', 'warning');
        }
    }
    
    // Show notification
    function showNotification(message, type) {
        notificationText.textContent = message;
        
        // Set icon based on type
        if (type === 'success') {
            notificationIcon.className = 'fas fa-check-circle notification-icon';
            notificationIcon.style.color = 'var(--success-color)';
        } else if (type === 'warning') {
            notificationIcon.className = 'fas fa-exclamation-triangle notification-icon';
            notificationIcon.style.color = 'var(--warning-color)';
        } else {
            notificationIcon.className = 'fas fa-info-circle notification-icon';
            notificationIcon.style.color = 'var(--primary-color)';
        }
        
        notification.style.display = 'flex';
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
    
    // Initialize the app
    initApp();
});