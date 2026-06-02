import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as EventController from '../controllers/eventController';

const router = new Router({ prefix: "/events" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', EventController.getAllEvents);
router.get('/management', EventController.getAllEventsManagement);
router.get('/:id', EventController.getEventById);
router.post('/', EventController.createEvent);
router.post('/broadcast', EventController.createEventAndBroadcast);
router.put('/:id', EventController.updateEvent);
router.delete('/:id', EventController.deleteEvent);

router.post('/:id/broadcast', EventController.broadcastEvent)

export default router;