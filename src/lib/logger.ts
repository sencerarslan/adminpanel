type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    timestamp: string;
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'test') return;

    const entry: LogEntry = {
        level,
        message,
        context,
        timestamp: new Date().toISOString(),
    };

    if (process.env.NODE_ENV === 'production') {
        process.stdout.write(JSON.stringify(entry) + '\n');
    } else {
        const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
        if (level === 'debug') {
            console.log(`${prefix} ${message}`, context ?? '');
        } else if (level === 'info') {
            console.info(`${prefix} ${message}`, context ?? '');
        } else if (level === 'warn') {
            console.warn(`${prefix} ${message}`, context ?? '');
        } else {
            console.error(`${prefix} ${message}`, context ?? '');
        }
    }
}

export const logger = {
    debug: (msg: string, ctx?: Record<string, unknown>): void => log('debug', msg, ctx),
    info: (msg: string, ctx?: Record<string, unknown>): void => log('info', msg, ctx),
    warn: (msg: string, ctx?: Record<string, unknown>): void => log('warn', msg, ctx),
    error: (msg: string, ctx?: Record<string, unknown>): void => log('error', msg, ctx),
};
