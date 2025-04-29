/**
 * Supabase Service
 * 
 * This service provides functions to sync data between the local MySQL database and Supabase.
 * It handles CRUD operations for all the tables defined in the project.
 */

const supabase = require('../supabaseClient');
const { 
  User, Batch, Semester, Faculty, Subject, 
  UniqueSubDegree, UniqueSubDiploma, AssignSubject, 
  ComponentWeightage, ComponentMarks, Student, 
  Gettedmarks, ParticipationType 
} = require('../models');

/**
 * Sync a single record to Supabase
 * @param {string} table - Supabase table name
 * @param {object} data - Data to sync
 * @param {string|number} id - Primary key value
 * @returns {Promise} - Supabase operation result
 */
const syncRecord = async (table, data, id) => {
  try {
    // Check if record exists in Supabase
    const { data: existingData, error: fetchError } = await supabase
      .from(table)
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error(`Error checking record in ${table}:`, fetchError);
      return { error: fetchError };
    }

    // If record exists, update it; otherwise, insert it
    if (existingData) {
      const { data: updatedData, error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select();

      if (updateError) {
        console.error(`Error updating record in ${table}:`, updateError);
        return { error: updateError };
      }
      
      return { data: updatedData, operation: 'update' };
    } else {
      const { data: insertedData, error: insertError } = await supabase
        .from(table)
        .insert(data)
        .select();

      if (insertError) {
        console.error(`Error inserting record in ${table}:`, insertError);
        return { error: insertError };
      }
      
      return { data: insertedData, operation: 'insert' };
    }
  } catch (error) {
    console.error(`Unexpected error in syncRecord for ${table}:`, error);
    return { error };
  }
};

/**
 * Delete a record from Supabase
 * @param {string} table - Supabase table name
 * @param {string|number} id - Primary key value
 * @returns {Promise} - Supabase operation result
 */
const deleteRecord = async (table, id) => {
  try {
    const { data, error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting record from ${table}:`, error);
      return { error };
    }
    
    return { data, operation: 'delete' };
  } catch (error) {
    console.error(`Unexpected error in deleteRecord for ${table}:`, error);
    return { error };
  }
};

/**
 * Sync all records from a local model to Supabase
 * @param {object} model - Sequelize model
 * @param {string} tableName - Supabase table name
 * @returns {Promise} - Operation results
 */
const syncAllRecords = async (model, tableName) => {
  try {
    // Get all records from local database
    const records = await model.findAll();
    
    // Convert records to plain objects
    const plainRecords = records.map(record => record.get({ plain: true }));
    
    // Track results
    const results = {
      success: 0,
      failed: 0,
      errors: []
    };
    
    // Sync each record to Supabase
    for (const record of plainRecords) {
      const { error } = await syncRecord(tableName, record, record.id);
      
      if (error) {
        results.failed++;
        results.errors.push({
          id: record.id,
          error: error.message || error
        });
      } else {
        results.success++;
      }
    }
    
    return results;
  } catch (error) {
    console.error(`Error syncing all records for ${tableName}:`, error);
    return { error };
  }
};

// Specific sync functions for each model
const syncUsers = async () => {
  return await syncAllRecords(User, 'Users');
};

const syncBatches = async () => {
  return await syncAllRecords(Batch, 'Batches');
};

const syncSemesters = async () => {
  return await syncAllRecords(Semester, 'Semesters');
};

const syncFaculties = async () => {
  return await syncAllRecords(Faculty, 'Faculties');
};

const syncSubjects = async () => {
  return await syncAllRecords(Subject, 'Subjects');
};

const syncUniqueSubDegrees = async () => {
  return await syncAllRecords(UniqueSubDegree, 'UniqueSubDegrees');
};

const syncUniqueSubDiplomas = async () => {
  return await syncAllRecords(UniqueSubDiploma, 'UniqueSubDiplomas');
};

const syncAssignSubjects = async () => {
  return await syncAllRecords(AssignSubject, 'AssignSubjects');
};

const syncComponentWeightages = async () => {
  return await syncAllRecords(ComponentWeightage, 'ComponentWeightages');
};

const syncComponentMarks = async () => {
  return await syncAllRecords(ComponentMarks, 'ComponentMarks');
};

const syncStudents = async () => {
  return await syncAllRecords(Student, 'Students');
};

const syncGettedmarks = async () => {
  return await syncAllRecords(Gettedmarks, 'Gettedmarks');
};

const syncParticipationTypes = async () => {
  return await syncAllRecords(ParticipationType, 'participation_types');
};

/**
 * Sync all data from local database to Supabase
 * @returns {Promise} - Operation results for all tables
 */
const syncAllData = async () => {
  const results = {};
  
  try {
    // Sync all tables
    results.users = await syncUsers();
    results.batches = await syncBatches();
    results.semesters = await syncSemesters();
    results.faculties = await syncFaculties();
    results.subjects = await syncSubjects();
    results.uniqueSubDegrees = await syncUniqueSubDegrees();
    results.uniqueSubDiplomas = await syncUniqueSubDiplomas();
    results.assignSubjects = await syncAssignSubjects();
    results.componentWeightages = await syncComponentWeightages();
    results.componentMarks = await syncComponentMarks();
    results.students = await syncStudents();
    results.gettedmarks = await syncGettedmarks();
    results.participationTypes = await syncParticipationTypes();
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error syncing all data:', error);
    return {
      success: false,
      error: error.message || error,
      results
    };
  }
};

module.exports = {
  syncRecord,
  deleteRecord,
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
  syncParticipationTypes,
  syncAllData
};
