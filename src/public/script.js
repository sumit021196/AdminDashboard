document.addEventListener('DOMContentLoaded', () => {
    // Populate year dropdown
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= currentYear - 5; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // Handle form submission
    const uploadForm = document.getElementById('uploadForm');
    uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('year', document.getElementById('year').value);
        formData.append('quarter', document.getElementById('quarter').value);
        formData.append('website', document.getElementById('website').value);
        formData.append('pdf', document.getElementById('pdf').files[0]);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const result = await response.json();
            alert('File uploaded successfully!');
            uploadForm.reset();
            loadRecentUploads();
        } catch (error) {
            alert('Error uploading file: ' + error.message);
        }
    });

    // Load recent uploads
    async function loadRecentUploads() {
        try {
            const response = await fetch('/api/results?site=both');
            if (!response.ok) {
                throw new Error('Failed to load recent uploads');
            }

            const uploads = await response.json();
            const recentUploadsContainer = document.getElementById('recentUploads');
            recentUploadsContainer.innerHTML = '';

            uploads.forEach(upload => {
                const uploadItem = document.createElement('div');
                uploadItem.className = 'list-group-item';
                uploadItem.innerHTML = `
                    <div class="upload-item">
                        <div class="upload-info">
                            <h5>${upload.quarter} ${upload.year}</h5>
                            <p class="mb-0">Website: ${upload.website}</p>
                        </div>
                        <div class="upload-actions">
                            <a href="${upload.pdf_url}" class="btn btn-sm btn-primary" target="_blank">View PDF</a>
                        </div>
                    </div>
                `;
                recentUploadsContainer.appendChild(uploadItem);
            });
        } catch (error) {
            console.error('Error loading recent uploads:', error);
        }
    }

    // Initial load of recent uploads
    loadRecentUploads();
}); 