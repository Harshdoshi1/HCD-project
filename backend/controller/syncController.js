/**
 * Sync Controller
 * 
 * Provides API endpoints to synchronize data between local MySQL database and Supabase.
 */

const supabaseService = require('../services/supabaseService');

/**
 * Sync all data from local database to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncAllData = async (req, res) => {
  try {
    console.log('Starting full data synchronization to Supabase...');
    const results = await supabaseService.syncAllData();
    
    if (results.success) {
      console.log('Full data synchronization completed successfully');
      res.status(200).json({
        message: 'Data synchronized successfully',
        results
      });
    } else {
      console.error('Full data synchronization failed:', results.error);
      res.status(500).json({
        message: 'Data synchronization failed',
        error: results.error,
        partialResults: results.results
      });
    }
  } catch (error) {
    console.error('Error in syncAllData controller:', error);
    res.status(500).json({
      message: 'Server error during synchronization',
      error: error.message || error
    });
  }
};

/**
 * Sync users data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncUsers = async (req, res) => {
  try {
    console.log('Syncing users to Supabase...');
    const results = await supabaseService.syncUsers();
    
    res.status(200).json({
      message: 'Users synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing users:', error);
    res.status(500).json({
      message: 'Error syncing users',
      error: error.message || error
    });
  }
};

/**
 * Sync batches data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncBatches = async (req, res) => {
  try {
    console.log('Syncing batches to Supabase...');
    const results = await supabaseService.syncBatches();
    
    res.status(200).json({
      message: 'Batches synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing batches:', error);
    res.status(500).json({
      message: 'Error syncing batches',
      error: error.message || error
    });
  }
};

/**
 * Sync semesters data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncSemesters = async (req, res) => {
  try {
    console.log('Syncing semesters to Supabase...');
    const results = await supabaseService.syncSemesters();
    
    res.status(200).json({
      message: 'Semesters synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing semesters:', error);
    res.status(500).json({
      message: 'Error syncing semesters',
      error: error.message || error
    });
  }
};

/**
 * Sync faculties data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncFaculties = async (req, res) => {
  try {
    console.log('Syncing faculties to Supabase...');
    const results = await supabaseService.syncFaculties();
    
    res.status(200).json({
      message: 'Faculties synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing faculties:', error);
    res.status(500).json({
      message: 'Error syncing faculties',
      error: error.message || error
    });
  }
};

/**
 * Sync subjects data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncSubjects = async (req, res) => {
  try {
    console.log('Syncing subjects to Supabase...');
    const results = await supabaseService.syncSubjects();
    
    res.status(200).json({
      message: 'Subjects synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing subjects:', error);
    res.status(500).json({
      message: 'Error syncing subjects',
      error: error.message || error
    });
  }
};

/**
 * Sync unique sub degrees data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncUniqueSubDegrees = async (req, res) => {
  try {
    console.log('Syncing unique sub degrees to Supabase...');
    const results = await supabaseService.syncUniqueSubDegrees();
    
    res.status(200).json({
      message: 'Unique sub degrees synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing unique sub degrees:', error);
    res.status(500).json({
      message: 'Error syncing unique sub degrees',
      error: error.message || error
    });
  }
};

/**
 * Sync unique sub diplomas data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncUniqueSubDiplomas = async (req, res) => {
  try {
    console.log('Syncing unique sub diplomas to Supabase...');
    const results = await supabaseService.syncUniqueSubDiplomas();
    
    res.status(200).json({
      message: 'Unique sub diplomas synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing unique sub diplomas:', error);
    res.status(500).json({
      message: 'Error syncing unique sub diplomas',
      error: error.message || error
    });
  }
};

/**
 * Sync assign subjects data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncAssignSubjects = async (req, res) => {
  try {
    console.log('Syncing assign subjects to Supabase...');
    const results = await supabaseService.syncAssignSubjects();
    
    res.status(200).json({
      message: 'Assign subjects synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing assign subjects:', error);
    res.status(500).json({
      message: 'Error syncing assign subjects',
      error: error.message || error
    });
  }
};

/**
 * Sync component weightages data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncComponentWeightages = async (req, res) => {
  try {
    console.log('Syncing component weightages to Supabase...');
    const results = await supabaseService.syncComponentWeightages();
    
    res.status(200).json({
      message: 'Component weightages synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing component weightages:', error);
    res.status(500).json({
      message: 'Error syncing component weightages',
      error: error.message || error
    });
  }
};

/**
 * Sync component marks data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncComponentMarks = async (req, res) => {
  try {
    console.log('Syncing component marks to Supabase...');
    const results = await supabaseService.syncComponentMarks();
    
    res.status(200).json({
      message: 'Component marks synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing component marks:', error);
    res.status(500).json({
      message: 'Error syncing component marks',
      error: error.message || error
    });
  }
};

/**
 * Sync students data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncStudents = async (req, res) => {
  try {
    console.log('Syncing students to Supabase...');
    const results = await supabaseService.syncStudents();
    
    res.status(200).json({
      message: 'Students synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing students:', error);
    res.status(500).json({
      message: 'Error syncing students',
      error: error.message || error
    });
  }
};

/**
 * Sync getted marks data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncGettedmarks = async (req, res) => {
  try {
    console.log('Syncing getted marks to Supabase...');
    const results = await supabaseService.syncGettedmarks();
    
    res.status(200).json({
      message: 'Getted marks synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing getted marks:', error);
    res.status(500).json({
      message: 'Error syncing getted marks',
      error: error.message || error
    });
  }
};

/**
 * Sync participation types data to Supabase
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
const syncParticipationTypes = async (req, res) => {
  try {
    console.log('Syncing participation types to Supabase...');
    const results = await supabaseService.syncParticipationTypes();
    
    res.status(200).json({
      message: 'Participation types synchronized successfully',
      results
    });
  } catch (error) {
    console.error('Error syncing participation types:', error);
    res.status(500).json({
      message: 'Error syncing participation types',
      error: error.message || error
    });
  }
};

module.exports = {
  syncAllData,
  syncUsers,
  syncBatches,
  syncSemesters,
  syncFaculties,
  syncSubjects,
  syncUniqueSubDegrees,
  syncUniqueSubDiplomas,
  syncAssignSubjects,
  syncComponentWeightages,
  syncComponentMarks,
  syncStudents,
  syncGettedmarks,
  syncParticipationTypes
};
