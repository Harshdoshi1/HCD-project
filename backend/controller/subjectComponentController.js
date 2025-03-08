const UniqueSubDegree = require('../models/uniqueSubDegree');
const ComponentWeightage = require('../models/component_weightage');
const ComponentMarks = require('../models/component_marks');
const sequelize = require('../config/db');

// Add subject with components (weightage and marks)
exports.addSubjectWithComponents = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { 
      code, // subject code
      name, // subject name
      credits, // subject credits
      type, // subject type (central or departmental)
      components // object containing component data
    } = req.body;

    console.log('Received data:', req.body);

    // Validate input
    if (!code || !name || !credits || !type || !components) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        received: { code, name, credits, type, components }
      });
    }

    // Map component names from frontend to database
    const componentMap = {
      'CA': 'cse', // Continuous Assessment maps to CSE in DB
      'ESE': 'ese', // End Semester Exam
      'IA': 'ia',   // Internal Assessment
      'TW': 'tw',   // Term Work
      'VIVA': 'viva' // Viva
    };

    // Create subject
    const subject = await UniqueSubDegree.create({
      sub_code: code,
      sub_name: name,
      sub_credit: credits,
      sub_level: type === 'central' ? 'central' : 'department'
    }, { transaction: t });

    // Prepare weightage and marks data
    const weightageData = { subjectId: code };
    const marksData = { subjectId: code };

    // Process each component
    Object.entries(components).forEach(([component, data]) => {
      if (data.enabled) {
        const dbField = componentMap[component];
        if (dbField) {
          weightageData[dbField] = data.weightage;
          marksData[dbField] = data.totalMarks;
        }
      }
    });

    // Create weightage
    const weightage = await ComponentWeightage.create(weightageData, { transaction: t });

    // Create marks
    const marks = await ComponentMarks.create(marksData, { transaction: t });

    await t.commit();

    res.status(201).json({
      subject,
      weightage,
      marks,
      message: 'Subject and components added successfully'
    });

  } catch (error) {
    await t.rollback();
    console.error('Error adding subject with components:', error);
    res.status(500).json({ 
      error: error.message,
      type: error.name,
      details: error.errors?.map(e => e.message) || []
    });
  }
};

// Get subject with components
exports.getSubjectWithComponents = async (req, res) => {
  try {
    const { subjectCode } = req.params;

    const subject = await UniqueSubDegree.findOne({
      where: { sub_code: subjectCode },
      include: [
        { model: ComponentWeightage, as: 'weightage' },
        { model: ComponentMarks, as: 'marks' }
      ]
    });

    if (!subject) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    res.status(200).json(subject);
  } catch (error) {
    console.error('Error getting subject with components:', error);
    res.status(500).json({ error: error.message });
  }
};
