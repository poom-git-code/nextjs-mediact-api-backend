import Router from 'koa-router';
import { languageMiddleware } from '../middleware/languageMiddleware';
import * as NewsController from '../controllers/newsController';

const router = new Router({ prefix: "/news" });

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.get('/', NewsController.getAllNews);
router.get('/management', NewsController.getAllNewsManagement);
router.get('/:id', NewsController.getNewsById);
router.post('/', NewsController.createNews);
router.put('/:id', NewsController.updateNews);
router.delete('/:id', NewsController.deleteNews);

router.post('/:id/broadcast', NewsController.broadcastNews)

router.post('/broadcast', NewsController.createNewsAndBroadcast);

export default router;