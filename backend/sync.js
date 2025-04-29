const { syncDB } = require('./models');
const supabaseService = require('./services/supabaseService');

// First sync the local database
console.log('Synchronizing local database...');
syncDB()
  .then(() => {
    console.log('Local database synchronized successfully');
    
    // Then sync data to Supabase
    console.log('Starting data synchronization to Supabase...');
    return supabaseService.syncAllData();
  })
  .then((results) => {
    if (results.success) {
      console.log('Data synchronized to Supabase successfully');
      console.log('Summary:');
      
      // Log summary of sync results
      Object.entries(results.results).forEach(([table, result]) => {
        console.log(`${table}: ${result.success} successful, ${result.failed} failed`);
        if (result.failed > 0) {
          console.log(`  Failed records: ${JSON.stringify(result.errors)}`);
        }
      });
    } else {
      console.error('Error synchronizing data to Supabase:', results.error);
    }
  })
  .catch((error) => {
    console.error('Synchronization failed:', error);
  });
