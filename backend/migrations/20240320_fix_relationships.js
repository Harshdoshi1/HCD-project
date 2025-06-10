'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // First, drop existing foreign key constraints if they exist
        try {
            await queryInterface.removeConstraint('Subjects', 'Subjects_semesterId_fkey');
        } catch (error) {
            console.log('No existing constraint to remove for Subjects');
        }

        try {
            await queryInterface.removeConstraint('Classes', 'Classes_semesterId_fkey');
        } catch (error) {
            console.log('No existing constraint to remove for Classes');
        }

        // Add foreign key constraints with proper settings
        await queryInterface.addConstraint('Subjects', {
            fields: ['semesterId'],
            type: 'foreign key',
            name: 'Subjects_semesterId_fkey',
            references: {
                table: 'Semesters',
                field: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        await queryInterface.addConstraint('Classes', {
            fields: ['semesterId'],
            type: 'foreign key',
            name: 'Classes_semesterId_fkey',
            references: {
                table: 'Semesters',
                field: 'id'
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    },

    down: async (queryInterface, Sequelize) => {
        // Remove the constraints in reverse order
        try {
            await queryInterface.removeConstraint('Subjects', 'Subjects_semesterId_fkey');
        } catch (error) {
            console.log('Error removing Subjects constraint:', error);
        }

        try {
            await queryInterface.removeConstraint('Classes', 'Classes_semesterId_fkey');
        } catch (error) {
            console.log('Error removing Classes constraint:', error);
        }
    }
}; 