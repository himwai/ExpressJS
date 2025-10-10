import { Request, Response } from "express";
import { Router } from 'express';

const apiRouter = Router();
const routerCache = new Map();
const validModulePattern = /^[a-zA-Z0-9_-]+$/; // Prevent directory traversal


// Get API
apiRouter.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    message: "API Service is healthy",
    timestamp: new Date().toISOString(),
  });
});

apiRouter.use('/:module', async (req, res, next) => {
  const moduleName = req.params.module;

  // Validate module name format
  if (!validModulePattern.test(moduleName)) {
    return res.status(404).send('Invalid module name');
  }

  try {
    // Check cache first
    if (routerCache.has(moduleName)) {
      const cachedRouter = routerCache.get(moduleName);
      return cachedRouter(req, res, next);
    }

    // Dynamically import module
    console.log(`Dynamically importing module: ${moduleName}`);
    const modulePath = `./${moduleName}`;
    const importedModule = await import(modulePath);
    
    // Validate module has a router
    if (!importedModule.default || typeof importedModule.default !== 'function') {
      throw new Error('Invalid router module');
    }

    // Cache the router
    routerCache.set(moduleName, importedModule.default);
    
    // Use the router
    importedModule.default(req, res, next);
  } catch (error) {
    if (error instanceof Error && 'code' in error) {
      // Handle different error types
      if (error.code === 'MODULE_NOT_FOUND') {
        res.status(404).send('Module not found');
      } else if (error.message === 'Invalid router module') {
        res.status(500).send('Invalid module structure');
      } else {
        console.error(`Error loading module ${moduleName}:`, error);
        res.status(500).send('Internal server error');
      }
    }
  }
});


export default apiRouter;