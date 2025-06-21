const StudentPoints = require('./StudentPoints');
const EventMaster = require('./EventMaster');
const ParticipationType = require('./participationTypes');
const UniqueSubDegree = require('./uniqueSubDegree');
const CourseOutcome = require('./courseOutcome');
const ComponentWeightage = require('./componentWeightage');
const SubjectComponentCo = require('./subjectComponentCo');
const BloomsTaxonomy = require('./bloomsTaxonomy');
const CoBloomsTaxonomy = require('./coBloomsTaxonomy');
const ClassSection = require('./classSection');
const Semester = require('./semester');
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

// --- ClassSection Associations ---

// Semester has many ClassSections
Semester.hasMany(ClassSection, {
  foreignKey: 'semesterId',
  as: 'classSections'
});

// Batch has many ClassSections
Batch.hasMany(ClassSection, {
  foreignKey: 'batchId',
  as: 'classSections'
});

// ClassSection belongs to Semester
ClassSection.belongsTo(Semester, {
  foreignKey: 'semesterId',
  as: 'semester'
});

// ClassSection belongs to Batch
ClassSection.belongsTo(Batch, {
  foreignKey: 'batchId',
  as: 'batch'
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
  through: SubjectComponentCo,
  foreignKey: 'subject_component_id', // Foreign key in SubjectComponentCo linking to ComponentWeightage
  otherKey: 'course_outcome_id',    // Foreign key in SubjectComponentCo linking to CourseOutcome
  as: 'associatedCourseOutcomes'    // Alias for fetching COs from a ComponentWeightage
});

// CourseOutcome can be associated with many ComponentWeightages (Subject Components) through SubjectComponentCo
CourseOutcome.belongsToMany(ComponentWeightage, {
  through: SubjectComponentCo,
  foreignKey: 'course_outcome_id',       // Foreign key in SubjectComponentCo linking to CourseOutcome
  otherKey: 'subject_component_id', // Foreign key in SubjectComponentCo linking to ComponentWeightage
  as: 'associatedComponents'       // Alias for fetching ComponentWeightages from a CO
});

// Explicitly define relationships for the join table SubjectComponentCo
// SubjectComponentCo belongs to one ComponentWeightage
SubjectComponentCo.belongsTo(ComponentWeightage, {
  foreignKey: 'subject_component_id',
  as: 'componentWeightage' // Alias for fetching ComponentWeightage from SubjectComponentCo
});

// SubjectComponentCo belongs to one CourseOutcome
SubjectComponentCo.belongsTo(CourseOutcome, {
  foreignKey: 'course_outcome_id',
  as: 'courseOutcome' // Alias for fetching CourseOutcome from SubjectComponentCo
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

module.exports = {
  StudentPoints,
  EventMaster,
  ParticipationType,
  UniqueSubDegree,
  CourseOutcome,
  ComponentWeightage,
  SubjectComponentCo,
  BloomsTaxonomy,
  CoBloomsTaxonomy,
  ClassSection,
  Semester,
  Batch
};
