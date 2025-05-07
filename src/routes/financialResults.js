const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed'));
        }
    }
});

// GET /results?site=site1
router.get('/results', async (req, res) => {
    try {
        const { site } = req.query;
        
        if (!site) {
            return res.status(400).json({ error: 'Site parameter is required' });
        }

        const { data, error } = await supabase
            .from('financial_results')
            .select('*')
            .or(`website.eq.${site},website.eq.both`)
            .order('year', { ascending: false })
            .order('quarter', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ error: error.message });
    }
});

// POST /upload
router.post('/upload', upload.single('pdf'), async (req, res) => {
    try {
        const { year, quarter, website } = req.body;
        const file = req.file;

        if (!file || !year || !quarter || !website) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const bucketName = process.env.SUPABASE_STORAGE_BUCKET || 'financial-results';
        const fileName = `financial-results-${year}-${quarter}.pdf`;

        // First, try to upload the file
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
                contentType: 'application/pdf',
                upsert: true // This will overwrite if file exists
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            throw new Error(`Failed to upload file: ${uploadError.message}`);
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        // Store metadata in database
        const { data: dbData, error: dbError } = await supabase
            .from('financial_results')
            .insert([
                {
                    year: parseInt(year),
                    quarter,
                    pdf_url: publicUrl,
                    website,
                },
            ]);

        if (dbError) {
            console.error('Database error:', dbError);
            throw new Error(`Failed to store metadata: ${dbError.message}`);
        }

        res.json({ message: 'File uploaded successfully', data: dbData });
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ 
            error: error.message,
            details: error.details || 'Unknown error occurred'
        });
    }
});

module.exports = router; 