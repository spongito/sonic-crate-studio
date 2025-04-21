
import { useCallback } from 'react';
import { logger, LogLevel } from '@/services/LoggingService';

export const useLogger = (module: string) => {
  const debug = useCallback((message: string, data?: any) => {
    logger.debug(module, message, data);
  }, [module]);

  const info = useCallback((message: string, data?: any) => {
    logger.info(module, message, data);
  }, [module]);

  const warning = useCallback((message: string, data?: any) => {
    logger.warning(module, message, data);
  }, [module]);

  const error = useCallback((message: string, data?: any) => {
    logger.error(module, message, data);
  }, [module]);

  const success = useCallback((message: string, data?: any) => {
    logger.success(module, message, data);
  }, [module]);

  return {
    debug,
    info,
    warning,
    error,
    success,
    LogLevel
  };
};
