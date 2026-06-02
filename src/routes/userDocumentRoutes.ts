import Router from 'koa-router';
import * as UserDocumentController from '../controllers/userDocumentController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: '/user-documents' });

// Apply language middleware to all routes
router.use(languageMiddleware);

// CRUD operations
router.get('/', UserDocumentController.getUserDocuments);
/* 
// หน้าแรก
GET /user-documents?page=1&limit=20

// หน้าที่ 2  
GET /user-documents?page=2&limit=20

// หน้าที่ 3
GET /user-documents?page=3&limit=20
*/ 
router.get('/user', UserDocumentController.getUserDocumentsByUserId);                    // Get current user's documents from token
router.get('/user/:userId', UserDocumentController.getUserDocumentsByUserIdFromParams); // Get specific user's documents (admin)
router.get('/:id', UserDocumentController.getUserDocumentById);        
router.post('/', UserDocumentController.createUserDocument);           // Create document with file_url
router.post('/upload', UserDocumentController.createUserDocumentWithFile); // Create document with file upload
router.put('/:id', UserDocumentController.updateUserDocument);         
router.delete('/:id', UserDocumentController.deleteUserDocument);      

export default router;