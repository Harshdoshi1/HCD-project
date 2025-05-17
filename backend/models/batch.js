const { supabase } = require("../config/supabaseClient");

<<<<<<< HEAD
const Batch = {
  tableName: "batches",

  async findAll() {
    try {
      const { data, error } = await supabase.from(this.tableName).select("*");

      if (error) {
        console.error("Error in Batch.findAll:", error);
        return { error };
      }

      if (!data || data.length === 0) {
        return { data: [] };
      }
      
      // Map database field names to frontend field names
      const mappedData = data.map(batch => ({
        id: batch.id,
        batchName: batch.batch_name,
        batchStart: batch.batch_start,
        batchEnd: batch.batch_end,
        courseType: batch.course_type,
        createdAt: batch.created_at
      }));

      return { data: mappedData };
    } catch (error) {
      console.error("Unexpected error in Batch.findAll:", error);
      return { error };
    }
  },
=======
const Batch = sequelize.define('Batch', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    batchName: { type: DataTypes.STRING, allowNull: false },
    batchStart: { type: DataTypes.DATE, allowNull: false },
    batchEnd: { type: DataTypes.DATE, allowNull: false },
    currentSemester: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    courseType: {
        type: DataTypes.ENUM('Degree', 'Diploma'),
        allowNull: false
    }
}, {
    tableName: 'Batches',
    timestamps: false
});
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

  async findOne(conditions) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select("*")
        .match(conditions)
        .single();

      if (error) {
        console.error("Error in Batch.findOne:", error);
        return { error };
      }
      
      if (!data) {
        return { data: null };
      }
      
      // Map database field names to frontend field names
      const mappedData = {
        id: data.id,
        batchName: data.batch_name,
        batchStart: data.batch_start,
        batchEnd: data.batch_end,
        courseType: data.course_type,
        createdAt: data.created_at
      };

      return { data: mappedData };
    } catch (error) {
      console.error("Unexpected error in Batch.findOne:", error);
      return { error };
    }
  },

  async create(record) {
    try {
      // Map frontend field names to database field names
      const dbRecord = {
        batch_name: record.batchName,
        batch_start: record.batchStart,
        batch_end: record.batchEnd,
        course_type: record.courseType
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .insert(dbRecord)
        .select();

      if (error) {
        console.error("Error in Batch.create:", error);
        return { error };
      }

      if (!data || data.length === 0) {
        return { data: [] };
      }
      
      // Map database field names back to frontend field names
      const mappedData = data.map(batch => ({
        id: batch.id,
        batchName: batch.batch_name,
        batchStart: batch.batch_start,
        batchEnd: batch.batch_end,
        courseType: batch.course_type,
        createdAt: batch.created_at
      }));

      return { data: mappedData };
    } catch (error) {
      console.error("Unexpected error in Batch.create:", error);
      return { error };
    }
  },

  async update(conditions, updates) {
    try {
      // Map frontend field names to database field names
      const dbUpdates = {
        batch_name: updates.batchName,
        batch_start: updates.batchStart,
        batch_end: updates.batchEnd,
        course_type: updates.courseType
      };

      const { data, error } = await supabase
        .from(this.tableName)
        .update(dbUpdates)
        .match(conditions)
        .select();

      if (error) {
        console.error("Error in Batch.update:", error);
        return { error };
      }

      if (!data || data.length === 0) {
        return { data: [] };
      }
      
      // Map database field names back to frontend field names
      const mappedData = data.map(batch => ({
        id: batch.id,
        batchName: batch.batch_name,
        batchStart: batch.batch_start,
        batchEnd: batch.batch_end,
        courseType: batch.course_type,
        createdAt: batch.created_at
      }));

      return { data: mappedData };
    } catch (error) {
      console.error("Unexpected error in Batch.update:", error);
      return { error };
    }
  },

  async delete(conditions) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .delete()
        .match(conditions)
        .select();

      if (error) {
        console.error("Error in Batch.delete:", error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error("Unexpected error in Batch.delete:", error);
      return { error };
    }
  }
};

module.exports = { Batch };
