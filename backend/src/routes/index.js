const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

const authController = require('../controllers/authController');
const childrenController = require('../controllers/childrenController');
const staffController = require('../controllers/staffController');
const donationsController = require('../controllers/donationsController');
const inventoryController = require('../controllers/inventoryController');
const healthController = require('../controllers/healthController');
const dashboardController = require('../controllers/dashboardController');
const reportsController = require('../controllers/reportsController');
const activitiesController = require('../controllers/activitiesController');
const incidentsController = require('../controllers/incidentsController');

// Auth
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticate, authController.getMe);
router.put('/auth/password', authenticate, authController.changePassword);

// Dashboard
router.get('/dashboard/stats', authenticate, dashboardController.getStats);
router.get('/dashboard/alerts', authenticate, dashboardController.getAlerts);

// Children
router.get('/children', authenticate, childrenController.getAll);
router.get('/children/stats', authenticate, childrenController.getStats);
router.get('/children/:id', authenticate, childrenController.getOne);
router.post('/children', authenticate, childrenController.create);
router.put('/children/:id', authenticate, childrenController.update);
router.delete('/children/:id', authenticate, authorize('admin', 'manager'), childrenController.delete);

// Staff
router.get('/staff', authenticate, staffController.getAll);
router.post('/staff', authenticate, authorize('admin'), staffController.create);
router.put('/staff/:id', authenticate, authorize('admin'), staffController.update);
router.post('/staff/attendance', authenticate, staffController.markAttendance);
router.get('/staff/attendance', authenticate, staffController.getAttendance);

// Health
router.get('/health/:child_id', authenticate, healthController.getByChild);
router.post('/health', authenticate, healthController.create);
router.post('/health/vaccination', authenticate, healthController.addVaccination);

// Activities
router.get('/activities', authenticate, activitiesController.getAll);
router.post('/activities', authenticate, activitiesController.create);

// Donations
router.get('/donations', authenticate, donationsController.getAll);
router.post('/donations', authenticate, donationsController.create);
router.get('/donations/summary', authenticate, donationsController.getSummary);

// Inventory
router.get('/inventory', authenticate, inventoryController.getAll);
router.post('/inventory', authenticate, inventoryController.create);
router.put('/inventory/:id/stock', authenticate, inventoryController.updateStock);

// Incidents
router.get('/incidents', authenticate, incidentsController.getAll);
router.post('/incidents', authenticate, incidentsController.create);
router.put('/incidents/:id/resolve', authenticate, incidentsController.resolve);

// Reports
router.get('/reports/children', authenticate, authorize('admin', 'manager'), reportsController.childrenReport);
router.get('/reports/financial', authenticate, authorize('admin', 'manager'), reportsController.financialReport);
router.get('/reports/audit', authenticate, authorize('admin'), reportsController.auditReport);

module.exports = router;
