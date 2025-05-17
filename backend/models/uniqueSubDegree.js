const supabase = require("../config/db");

<<<<<<< HEAD
const UniqueSubDegree = {
  tableName: "UniqueSubDegrees",
=======
const UniqueSubDegree = sequelize.define('UniqueSubDegree', {
    sub_code: { type: DataTypes.STRING, primaryKey: true },
    sub_level: { 
        type: DataTypes.ENUM('department', 'central'), 
        allowNull: false 
    },
    sub_name: { type: DataTypes.STRING, allowNull: false },
    sub_credit: { type: DataTypes.INTEGER, allowNull: false },
    program: { 
        type: DataTypes.ENUM('Degree', 'Diploma'), 
        allowNull: false 
    }
}, { timestamps: false });
>>>>>>> 41bcf10cc980c47716367a6d8012822c23d622b4

  async findAll() {
    const { data, error } = await supabase.from(this.tableName).select("*");

    if (error) throw error;
    return data;
  },

  async findOne(conditions) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select("*")
      .match(conditions)
      .single();

    if (error) throw error;
    return data;
  },

  async create(record) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(record)
      .select();

    if (error) throw error;
    return data;
  },

  async update(conditions, updates) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .match(conditions)
      .select();

    if (error) throw error;
    return data;
  },

  async delete(conditions) {
    const { data, error } = await supabase
      .from(this.tableName)
      .delete()
      .match(conditions)
      .select();

    if (error) throw error;
    return data;
  },
};

module.exports = { UniqueSubDegree };
