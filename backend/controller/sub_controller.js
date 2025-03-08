const UniqueSubDegree = require('../models/uniqueSubDegree');
const UniqueSubDiploma = require('../models/uniqueSubDiploma');
const Batch = require('../models/batch');
const Semester = require('../models/semester');
const AssignSubject = require('../models/assignSubject');
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

// Get all subjects from both degree and diploma
const getAllSubjects = async (req, res) => {
    try {
        const { batch, semester } = req.query;
        
        // Get all unique subjects
        const degreeSubjects = await UniqueSubDegree.findAll();
        const diplomaSubjects = await UniqueSubDiploma.findAll();
        
        let allSubjects = [
            ...degreeSubjects.map(subject => ({
                ...subject.toJSON(),
                courseType: 'degree'
            })),
            ...diplomaSubjects.map(subject => ({
                ...subject.toJSON(),
                courseType: 'diploma'
            }))
        ];

        // If batch and semester are specified, filter out assigned subjects
        if (batch !== 'all' && semester !== 'all') {
            try {
                // First get the batch ID
                const batchRecord = await Batch.findOne({
                    where: { batchName: batch }
                });

                if (!batchRecord) {
                    console.log('Batch not found:', batch);
                    return res.json(allSubjects); // Return all subjects if batch not found
                }

                // Then get the semester ID
                const semesterRecord = await Semester.findOne({
                    where: { 
                        batchId: batchRecord.id,
                        semesterNumber: parseInt(semester)
                    }
                });

                if (!semesterRecord) {
                    console.log('Semester not found:', semester, 'for batch:', batch);
                    return res.json(allSubjects); // Return all subjects if semester not found
                }

                // Get assigned subjects for this batch and semester
                const assignedSubjects = await AssignSubject.findAll({
                    where: {
                        batchId: batchRecord.id,
                        semesterId: semesterRecord.id
                    },
                    attributes: ['subjectCode']
                });

                // Filter out already assigned subjects
                const assignedSubjectCodes = assignedSubjects.map(s => s.subjectCode);
                allSubjects = allSubjects.filter(subject => !assignedSubjectCodes.includes(subject.sub_code));
            } catch (error) {
                console.error('Error filtering subjects:', error);
                return res.json(allSubjects); // Return all subjects in case of error
            }
        }

        res.json(allSubjects);
    } catch (error) {
        console.error('Error in getAllSubjects:', error);
        res.status(500).json({ error: 'Failed to fetch subjects', details: error.message });
    }
};

module.exports = { addSubject, getSubjectByCode, deleteSubject, getSubjects, getAllSubjects };