import Router from 'koa-router';
import * as DocumentSubTypesController from '../controllers/documentSubTypesController';
import { languageMiddleware } from '../middleware/languageMiddleware';

const router = new Router({ prefix: '/document-sub-types' });

// Apply language middleware to all routes
router.use(languageMiddleware);

// All routes (authentication handled globally in app.ts)
router.get('/', DocumentSubTypesController.getDocumentSubTypes);              
router.get('/active', DocumentSubTypesController.getActiveDocumentSubTypes);  
router.get('/user/role', DocumentSubTypesController.getDocumentSubTypesByUserRole);
router.get('/:id', DocumentSubTypesController.getDocumentSubTypeById);        
router.get('/code/:code', DocumentSubTypesController.getDocumentSubTypeByCode); 
router.get('/role/:role_id', DocumentSubTypesController.getDocumentSubTypesByRoleId); 
router.post('/', DocumentSubTypesController.createDocumentSubType);           
router.put('/:id', DocumentSubTypesController.updateDocumentSubType);         
router.delete('/:id', DocumentSubTypesController.deleteDocumentSubType);      

export default router;