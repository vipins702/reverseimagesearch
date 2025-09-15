import { Router } from 'express';

const router = Router();

// Route to generate a report
router.post('/generate', (req, res) => {
    const { imageId, analysisResults } = req.body;

    // Demo response structure
    const report = {
        reportId: 'report-12345',
        imageId,
        analysisResults,
        createdAt: new Date().toISOString(),
    };

    res.status(201).json(report);
});

// Route to fetch a report by ID
router.get('/:reportId', (req, res) => {
    const { reportId } = req.params;

    // Demo response structure
    const report = {
        reportId,
        imageId: 'image-12345',
        analysisResults: {
            authenticity: 'High',
            confidenceScore: 0.95,
        },
        createdAt: new Date().toISOString(),
    };

    res.status(200).json(report);
});

export default router;