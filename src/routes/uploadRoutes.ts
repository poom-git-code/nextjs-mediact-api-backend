import Router from "koa-router";
import { languageMiddleware } from '../middleware/languageMiddleware';
import { uploadFile } from "../controllers/fileUploadController";
import { uploadFilePublic,deleteFilePublic, uploadUserDataFile, getUserDataPresignedUrl, uploadUserDataFileNoWatermark } from "../controllers/uploadController";

const router = new Router();

// เพิ่ม language middleware ให้ทุก route
router.use(languageMiddleware);

router.post("/upload", uploadFile);

router.post("/upload-public", uploadFilePublic);
router.delete("/upload-public", deleteFilePublic);

router.post("/upload/user-data-private", uploadUserDataFile); // Assuming this is for user data uploads
router.post("/upload/user-data-private-no-watermark", uploadUserDataFileNoWatermark);
router.get("/upload/user-data-private/presigned-url", getUserDataPresignedUrl);


export default router;