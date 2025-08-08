import { Express } from 'express';
// Import all route modules
import { profileGeneratorRoutes } from './AI/profileGenerator';
import authRoutes from './cv-generator/routes/auth.routes';
import { collectionRoutes } from './cv-generator/routes/collection.routes';
import { CVGeneratorRoutes } from './cv-generator/routes/CV-GeneratorRoutes';
import downloadRoutes from './cv-generator/routes/download.routes';
import reviewRoutes from './his-majesty/routes/review.routes';
import authautostatRoutes from "./autostat-web/routes/auth-autostat.routes";
import matchprocessesRoutes from "./autostat-web/routes/match-process.routes";
import autostatutilsroutes from "./autostat-web/routes/autostat-utils.routes";
import { callbackCors } from './central';


export const setupRoutes = async (app: Express) => {
  // Dynamically import Schedulr routes (these need database connections)
  const { default: GoogleAuthRoutes } = await import('./schedulr/routes/google-auth.routes');
  const { default: SchedulrUserRoutes } = await import('./schedulr/routes/user.routes');
  console.log('✅ Schedulr routes imported successfully');

  // CV Generator & AI routes
  app.use('/api/cv-generator', CVGeneratorRoutes);
  app.use('/api/cv-gen/download', downloadRoutes);
  app.use('/api/ai', profileGeneratorRoutes);
  
  // Auth & Collections
  app.use('/api/auth', authRoutes);
  app.use('/api/collections', collectionRoutes);
  
  // Schedulr routes
  app.use('/api/schedulr/google-auth', GoogleAuthRoutes);
  app.use('/api/schedulr/user', SchedulrUserRoutes);
  console.log('✅ Schedulr routes registered at /api/schedulr/google-auth');
  
  // AutoStat routes
  app.use('/api/autostat-web/auth', authautostatRoutes);
  app.use('/api/autostat-web/match-processes', matchprocessesRoutes);
  app.use('/api/autostat-web/utils', autostatutilsroutes);
  
  // Other services
  app.use('/api/his-majesty/reviews', reviewRoutes);
  
  
  console.log('All routes have been set up successfully');
};