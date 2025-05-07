import { LogLevel } from '@nestjs/common';

export function isLogLevel(value: string | undefined): value is LogLevel {
  return (
    value === 'log' ||
    value === 'error' ||
    value === 'warn' ||
    value === 'debug' ||
    value === 'verbose' ||
    value === 'fatal'
  );
}
