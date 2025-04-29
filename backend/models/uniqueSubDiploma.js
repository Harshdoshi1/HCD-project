const supabase = require("../config/db");

const UniqueSubDiploma = {
  tableName: "UniqueSubDiplomas",

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

module.exports = { UniqueSubDiploma };
