const UniqueSubDegree = require('../models/uniqueSubDegree');
const UniqueSubDiploma = require('../models/uniqueDubDiploma');
const { Batch } = require('../models/batch');
const { Semester } = require('../models/semester');
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');

// Add Subject
const addSubject = async (req, res) => {
    try {
        const { name, code, courseType, credits, subjectType } = req.body;
        
        if (courseType === 'degree') {
            await UniqueSubDegree.create({
                sub_code: code,
                sub_name: name,
                sub_credit: credits,
                sub_level: subjectType
            });
        } else if (courseType === 'diploma') {
            await UniqueSubDiploma.create({
                sub_code: code,
                sub_name: name,
                sub_credit: credits,
                sub_level: subjectType
            });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        res.status(201).json({ message: 'Subject added successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding subject', details: error.message });
    }
};


// Get Subject by Code and Course Type
const getSubjectByCode = async (req, res) => {
    try {
        const { code, courseType } = req.params;
        let subject;

        if (courseType === 'degree') {
            subject = await UniqueSubDegree.findOne({ where: { sub_code: code } });
        } else if (courseType === 'diploma') {
            subject = await UniqueSubDiploma.findOne({ where: { sub_code: code } });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json(subject);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching subject', details: error.message });
    }
};

// Delete Subject
const deleteSubject = async (req, res) => {
    try {
        const { code, courseType } = req.params;
        let deleted;

        if (courseType === 'degree') {
            deleted = await UniqueSubDegree.destroy({ where: { sub_code: code } });
        } else if (courseType === 'diploma') {
            deleted = await UniqueSubDiploma.destroy({ where: { sub_code: code } });
        } else {
            return res.status(400).json({ error: 'Invalid course type' });
        }

        if (!deleted) {
            return res.status(404).json({ error: 'Subject not found' });
        }

        res.status(200).json({ message: 'Subject deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting subject', details: error.message });
    }
};

const getSubjects = async (req, res) => {
    try {
        const { program, batchId, semester } = req.params;
        let subjects;

        if (program === 'degree') {
            subjects = await UniqueSubDegree.findAll();
        } else if (program === 'diploma') {
            subjects = await UniqueSubDiploma.findAll();
        } else {
            return res.status(400).json({ error: 'Invalid program type' });
        }

        res.json(subjects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch subjects' });
    }
};

module.exports = { addSubject, getSubjectByCode, deleteSubject, getSubjects };


module.exports = router;