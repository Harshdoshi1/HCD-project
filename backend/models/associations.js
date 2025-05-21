const StudentPoints = require('./StudentPoints');
const EventMaster = require('./EventMaster');
const ParticipationType = require('./participationTypes');

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

module.exports = {
  StudentPoints,
  EventMaster,
  ParticipationType
};
