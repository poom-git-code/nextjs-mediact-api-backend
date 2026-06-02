import Router from 'koa-router';
import * as DocumentTypeController from '../controllers/documentTypeController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: '/document-types' });

// Apply language middleware to all routes
router.use(languageMiddleware);

// CRUD operations
router.get('/', DocumentTypeController.getDocumentTypes);              
router.get('/active', DocumentTypeController.getActiveDocumentTypes);  
router.get('/:id', DocumentTypeController.getDocumentTypeById);        
router.get('/code/:code', DocumentTypeController.getDocumentTypeByCode); 
router.post('/', DocumentTypeController.createDocumentType);           
router.put('/:id', DocumentTypeController.updateDocumentType);         
router.delete('/:id', DocumentTypeController.deleteDocumentType);      

export default router;