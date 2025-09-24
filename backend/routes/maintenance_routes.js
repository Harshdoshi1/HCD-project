const express = require('express');
const router = express.Router();
const { fixComponentCoAssociations, displayCurrentAssociations } = require('../scripts/fix_component_co_associations');
const { fixSpecificSubjectAssociations } = require('../scripts/fix_specific_subject_associations');
const { comprehensiveFixAssociations } = require('../scripts/comprehensive_fix_associations');

// Endpoint to fix component-CO associations
router.post('/fix-component-co-associations', async (req, res) => {
    try {
        console.log('🔧 Starting Component-CO Association Fix via API...');
        await fixComponentCoAssociations();
        res.status(200).json({
            success: true,
            message: 'Component-CO associations have been fixed successfully'
        });
    } catch (error) {
        console.error('Error fixing component-CO associations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix component-CO associations',
            error: error.message
        });
    }
});

// Endpoint to display current associations for debugging
router.get('/display-associations/:subjectId?', async (req, res) => {
    try {
        const { subjectId } = req.params;
        console.log('📊 Displaying current associations...');
        
        // Capture console output
        const originalLog = console.log;
        let output = '';
        console.log = (message) => {
            output += message + '\n';
            originalLog(message);
        };
        
        await displayCurrentAssociations(subjectId);
        
        // Restore console.log
        console.log = originalLog;
        
        res.status(200).json({
            success: true,
            message: 'Associations displayed successfully',
            output: output
        });
    } catch (error) {
        console.error('Error displaying associations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to display associations',
            error: error.message
        });
    }
});

// Endpoint to fix the specific subject shown in the images
router.post('/fix-specific-subject', async (req, res) => {
    try {
        console.log('🔧 Starting Specific Subject Fix via API...');
        await fixSpecificSubjectAssociations();
        res.status(200).json({
            success: true,
            message: 'Specific subject associations have been fixed successfully'
        });
    } catch (error) {
        console.error('Error fixing specific subject associations:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fix specific subject associations',
            error: error.message
        });
    }
});

// Comprehensive fix endpoint
router.post('/comprehensive-fix', async (req, res) => {
    try {
        console.log('🔧 Starting Comprehensive Fix via API...');
        await comprehensiveFixAssociations();
        res.status(200).json({
            success: true,
            message: 'Comprehensive fix completed successfully'
        });
    } catch (error) {
        console.error('Error in comprehensive fix:', error);
        res.status(500).json({
            success: false,
            message: 'Comprehensive fix failed',
            error: error.message
        });
    }
});

module.exports = router;
