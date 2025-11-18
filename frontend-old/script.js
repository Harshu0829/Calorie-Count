const API_BASE_URL = 'http://localhost:8000';

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabId}-tab`).classList.add('active');
        
        // Hide results when switching tabs
        document.getElementById('results').style.display = 'none';
    });
});

// Camera functionality
let stream = null;
let capturedImageData = null;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const startCameraBtn = document.getElementById('start-camera');
const captureBtn = document.getElementById('capture');
const stopCameraBtn = document.getElementById('stop-camera');
const cameraPreview = document.getElementById('camera-preview');
const capturedImage = document.getElementById('captured-image');
const retakeBtn = document.getElementById('retake');
const analyzeCaptureBtn = document.getElementById('analyze-capture');

startCameraBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            } 
        });
        
        video.srcObject = stream;
        startCameraBtn.disabled = true;
        captureBtn.disabled = false;
        stopCameraBtn.disabled = false;
        cameraPreview.style.display = 'none';
    } catch (error) {
        showError('Error accessing camera: ' + error.message);
    }
});

stopCameraBtn.addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
        startCameraBtn.disabled = false;
        captureBtn.disabled = true;
        stopCameraBtn.disabled = true;
        cameraPreview.style.display = 'none';
    }
});

captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    capturedImageData = canvas.toDataURL('image/jpeg');
    capturedImage.src = capturedImageData;
    cameraPreview.style.display = 'flex';
    video.style.display = 'none';
});

retakeBtn.addEventListener('click', () => {
    cameraPreview.style.display = 'none';
    video.style.display = 'block';
    capturedImageData = null;
});

analyzeCaptureBtn.addEventListener('click', async () => {
    if (!capturedImageData) {
        showError('Please capture an image first');
        return;
    }
    
    await analyzeImageFromDataUrl(capturedImageData);
});

// File upload functionality
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const uploadPreview = document.getElementById('upload-preview');
const uploadedImage = document.getElementById('uploaded-image');
const removeImageBtn = document.getElementById('remove-image');
const analyzeUploadBtn = document.getElementById('analyze-upload');

uploadArea.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#4CAF50';
    uploadArea.style.background = 'rgba(76, 175, 80, 0.1)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = 'var(--border-color)';
    uploadArea.style.background = 'var(--bg-color)';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--border-color)';
    uploadArea.style.background = 'var(--bg-color)';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFileSelect(files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
});

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        showError('Please select an image file');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        uploadedImage.src = e.target.result;
        uploadArea.style.display = 'none';
        uploadPreview.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

removeImageBtn.addEventListener('click', () => {
    uploadPreview.style.display = 'none';
    uploadArea.style.display = 'block';
    fileInput.value = '';
});

analyzeUploadBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        showError('Please upload an image first');
        return;
    }
    
    await analyzeImageFromFile(file);
});

// Image analysis
async function analyzeImageFromFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    await analyzeImage(formData);
}

async function analyzeImageFromDataUrl(dataUrl) {
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const formData = new FormData();
    formData.append('file', blob, 'captured-image.jpg');
    
    await analyzeImage(formData);
}

async function analyzeImage(formData) {
    const resultsContainer = document.getElementById('results');
    const loading = document.getElementById('loading');
    const resultsContent = document.getElementById('results-content');
    const errorMsg = document.getElementById('error-message');
    
    // Hide previous error
    errorMsg.style.display = 'none';
    
    // Show loading
    resultsContainer.style.display = 'block';
    loading.style.display = 'block';
    resultsContent.style.display = 'none';
    
    // Scroll to results
    resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Hide loading, show results
        loading.style.display = 'none';
        resultsContent.style.display = 'block';
        
        displayResults(data);
    } catch (error) {
        loading.style.display = 'none';
        showError('Error analyzing image: ' + error.message);
        console.error('Error:', error);
    }
}

function displayResults(data) {
    const foodsList = document.getElementById('foods-list');
    foodsList.innerHTML = '';
    
    // Display detected foods
    data.detected_foods.forEach(food => {
        const foodItem = document.createElement('div');
        foodItem.className = 'food-item';
        
        foodItem.innerHTML = `
            <div class="food-info">
                <div class="food-name">${food.food.replace(/_/g, ' ')}</div>
                <div class="food-details">
                    <span>Weight: ${food.weight_grams}g</span>
                    <span>Protein: ${food.protein}g</span>
                    <span>Carbs: ${food.carbs}g</span>
                    <span>Fat: ${food.fat}g</span>
                    <span>Confidence: ${(food.confidence * 100).toFixed(0)}%</span>
                </div>
            </div>
            <div class="food-calories">${food.calories} kcal</div>
        `;
        
        foodsList.appendChild(foodItem);
    });
    
    // Display totals
    document.getElementById('total-calories').textContent = data.totals.calories.toFixed(1);
    document.getElementById('total-protein').textContent = data.totals.protein.toFixed(1);
    document.getElementById('total-carbs').textContent = data.totals.carbs.toFixed(1);
    document.getElementById('total-fat').textContent = data.totals.fat.toFixed(1);
}

function showError(message) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
    errorMsg.style.display = 'block';
    
    setTimeout(() => {
        errorMsg.style.display = 'none';
    }, 5000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

