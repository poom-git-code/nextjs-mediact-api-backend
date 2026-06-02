import Router from 'koa-router';
import { healthCheck, simpleHealthCheck, timeoutTest, heavyComputationTest, memoryTest, configDebug, memoryStats, forceGC } from '../controllers/healthController';

const router = new Router();

// Simple health check for DigitalOcean (no auth required)
router.get('/health', simpleHealthCheck);

// Detailed health check endpoint (no auth required)
router.get('/health/detailed', healthCheck);

// Configuration debug endpoint (no auth required for testing)
router.get('/debug/config', configDebug);

// Memory management endpoints
router.get('/debug/memory', memoryStats);
router.post('/debug/gc', forceGC);

// Timeout testing endpoints (no auth required for testing)
router.get('/test/timeout', timeoutTest);
router.get('/test/computation', heavyComputationTest);
router.get('/test/memory', memoryTest);

export default router;