import * as winston from 'winston';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const sensitiveKeys = [
  'password',
  'contrasena',
  'contraseña',
  'email',
  'correo',
  'curp',
  'token',
];

const sanitizeObject = (obj: any) => {
  if (typeof obj !== 'object' || obj === null) {
    return;
  }
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (sensitiveKeys.includes(key.toLowerCase())) {
        obj[key] = '[CENSORED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  }
};

const sanitizeFormat = winston.format((info) => {
  sanitizeObject(info);
  return info;
});

export const winstonConfig: winston.LoggerOptions = {
  level: 'info',
  format: winston.format.combine(
    sanitizeFormat(),
    winston.format.timestamp(),
    winston.format.ms(),
    nestWinstonModuleUtilities.format.nestLike('CosasDeCasa', {
      colors: true,
      prettyPrint: true,
      processId: true,
      appName: true,
    }),
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'logs/audit-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),
  ],
};
