/**
 * Supabase Sync Middleware
 * 
 * This middleware automatically syncs data to Supabase after changes are made to the local database.
 * It can be applied to specific routes or globally to ensure data consistency between MySQL and Supabase.
 */

const supabaseService = require('../services/supabaseService');

/**
 * Middleware to sync specific model data to Supabase after a request is processed
 * @param {string} modelType - The type of model to sync (e.g., 'users', 'students')
 * @returns {function} Express middleware function
 */
const syncAfterRequest = (modelType) => {
  return async (req, res, next) => {
    // Store the original send function
    const originalSend = res.send;
    
    // Override the send function
    res.send = function(body) {
      // Call the original send function
      originalSend.call(this, body);
      
      // Only sync if the request was successful (status code 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Perform sync asynchronously (don't wait for it to complete)
        (async () => {
          try {
            console.log(`Auto-syncing ${modelType} to Supabase after request...`);
            
            // Determine which sync function to call based on modelType
            let syncFunction;
            switch (modelType) {
              case 'users':
                syncFunction = supabaseService.syncUsers;
                break;
              case 'batches':
                syncFunction = supabaseService.syncBatches;
                break;
              case 'semesters':
                syncFunction = supabaseService.syncSemesters;
                break;
              case 'faculties':
                syncFunction = supabaseService.syncFaculties;
                break;
              case 'subjects':
                syncFunction = supabaseService.syncSubjects;
                break;
              case 'uniqueSubDegrees':
                syncFunction = supabaseService.syncUniqueSubDegrees;
                break;
              case 'uniqueSubDiplomas':
                syncFunction = supabaseService.syncUniqueSubDiplomas;
                break;
              case 'assignSubjects':
                syncFunction = supabaseService.syncAssignSubjects;
                break;
              case 'componentWeightages':
                syncFunction = supabaseService.syncComponentWeightages;
                break;
              case 'componentMarks':
                syncFunction = supabaseService.syncComponentMarks;
                break;
              case 'students':
                syncFunction = supabaseService.syncStudents;
                break;
              case 'gettedmarks':
                syncFunction = supabaseService.syncGettedmarks;
                break;
              case 'participationTypes':
                syncFunction = supabaseService.syncParticipationTypes;
                break;
              default:
                console.warn(`No sync function found for model type: ${modelType}`);
                return;
            }
            
            // Call the sync function
            const result = await syncFunction();
            console.log(`Auto-sync of ${modelType} completed:`, result);
          } catch (error) {
            console.error(`Error during auto-sync of ${modelType}:`, error);
          }
        })();
      }
      
      return this;
    };
    
    next();
  };
};

/**
 * Apply sync middleware to all routes for a specific router
 * @param {object} router - Express router
 * @param {string} modelType - The type of model handled by this router
 */
const applySyncMiddleware = (router, modelType) => {
  // Get all routes from the router
  const routes = router.stack
    .filter(layer => layer.route)
    .map(layer => layer.route);
  
  // Add the sync middleware to all routes that modify data (POST, PUT, DELETE)
  routes.forEach(route => {
    const methods = Object.keys(route.methods);
    
    if (methods.includes('post') || methods.includes('put') || methods.includes('delete')) {
      route.stack.unshift({
        handle: syncAfterRequest(modelType),
        name: 'syncAfterRequest'
      });
    }
  });
};

module.exports = {
  syncAfterRequest,
  applySyncMiddleware
};
