const StudentPoints = require('./StudentPoints');
const EventMaster = require('./EventMaster');
const ParticipationType = require('./participationTypes');
const UniqueSubDegree = require('./uniqueSubDegree');
const CourseOutcome = require('./courseOutcome');
const ComponentWeightage = require('./componentWeightage');
const SubjectComponentCo = require('./subjectComponentCo');
const BloomsTaxonomy = require('./bloomsTaxonomy');
const CoBloomsTaxonomy = require('./coBloomsTaxonomy');
const Semester = require('./semester');
const Subject = require('./subject');
const Class = require('./class');
const Batch = require('./batch');

// Set up associations between StudentPoints and EventMaster without enforcing foreign key constraints
StudentPoints.belongsTo(EventMaster, {
  foreignKey: 'eventId',
  targetKey: 'eventId',
  as: 'event',
  constraints: false // Don't enforce foreign key constraints
});

// Set up associations between StudentPoints and ParticipationType without enforcing foreign key constraints
StudentPoints.belongsTo(ParticipationType, {
  foreignKey: 'participationTypeId',
  targetKey: 'id',
  as: 'participationType',
  constraints: false // Don't enforce foreign key constraints
});

// --- CourseOutcome Associations ---

// UniqueSubDegree (Subject) has many CourseOutcomes
UniqueSubDegree.hasMany(CourseOutcome, {
  foreignKey: 'subject_id',
  as: 'courseOutcomes' // Alias for fetching COs from a Subject
});
// CourseOutcome belongs to one UniqueSubDegree (Subject)
CourseOutcome.belongsTo(UniqueSubDegree, {
  foreignKey: 'subject_id',
  as: 'subject' // Alias for fetching Subject from a CO
});

// --- SubjectComponentCo Associations (Many-to-Many between ComponentWeightage and CourseOutcome) ---

// ComponentWeightage (Subject Component) can have many CourseOutcomes through SubjectComponentCo
ComponentWeightage.belongsToMany(CourseOutcome, {
  through: {
    model: SubjectComponentCo,
    uniqueConstraint: {
      name: 'idx_comp_co'
    }
  },
  foreignKey: 'subject_component_id',
  otherKey: 'course_outcome_id',
  as: 'associatedCourseOutcomes'
});

// CourseOutcome can be associated with many ComponentWeightages (Subject Components) through SubjectComponentCo
CourseOutcome.belongsToMany(ComponentWeightage, {
  through: {
    model: SubjectComponentCo,
    uniqueConstraint: {
      name: 'idx_comp_co'
    }
  },
  foreignKey: 'course_outcome_id',
  otherKey: 'subject_component_id',
  as: 'associatedComponents'
});

// Explicitly define relationships for the join table SubjectComponentCo
// SubjectComponentCo belongs to one ComponentWeightage
SubjectComponentCo.belongsTo(ComponentWeightage, {
  foreignKey: 'subject_component_id',
  as: 'componentWeightage'
});

// SubjectComponentCo belongs to one CourseOutcome
SubjectComponentCo.belongsTo(CourseOutcome, {
  foreignKey: 'course_outcome_id',
  as: 'courseOutcome'
});

// --- Blooms Taxonomy Associations ---

// CourseOutcome can have many Blooms Taxonomy levels through CoBloomsTaxonomy
CourseOutcome.belongsToMany(BloomsTaxonomy, {
  through: CoBloomsTaxonomy,
  foreignKey: 'course_outcome_id',
  otherKey: 'blooms_taxonomy_id',
  as: 'bloomsLevels'
});

// Blooms Taxonomy can be associated with many Course Outcomes through CoBloomsTaxonomy
BloomsTaxonomy.belongsToMany(CourseOutcome, {
  through: CoBloomsTaxonomy,
  foreignKey: 'blooms_taxonomy_id',
  otherKey: 'course_outcome_id',
  as: 'courseOutcomes'
});

// CoBloomsTaxonomy belongs to CourseOutcome
CoBloomsTaxonomy.belongsTo(CourseOutcome, {
  foreignKey: 'course_outcome_id',
  as: 'courseOutcome'
});

// CoBloomsTaxonomy belongs to BloomsTaxonomy
CoBloomsTaxonomy.belongsTo(BloomsTaxonomy, {
  foreignKey: 'blooms_taxonomy_id',
  as: 'bloomsTaxonomy'
});

// Define all associations
const defineAssociations = () => {
  // Semester associations
  Semester.hasMany(Subject, {
    foreignKey: 'semesterId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Semester.hasMany(Class, {
    foreignKey: 'semesterId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Subject associations
  Subject.belongsTo(Semester, {
    foreignKey: 'semesterId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Class associations
  Class.belongsTo(Semester, {
    foreignKey: 'semesterId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // Batch associations
  Batch.hasMany(Semester, {
    foreignKey: 'batchId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  Semester.belongsTo(Batch, {
    foreignKey: 'batchId',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

module.exports = defineAssociations;
