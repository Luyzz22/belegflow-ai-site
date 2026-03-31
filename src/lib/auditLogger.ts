// auditLogger.ts

// Interface for each log entry
interface AuditLogEntry {
    timestamp: string; // YYYY-MM-DD HH:MM:SS
    user: string;
    action: string;
    details: string;
}

class AuditLogger {
    private logs: AuditLogEntry[];

    constructor() {
        this.logs = [];
    }

    // Log authentication events
    public logAuthentication(user: string, action: string): void {
        this.logs.push({
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: user,
            action: action,
            details: 'Authentication event logged.'
        });
    }

    // Log data access
    public logDataAccess(user: string, action: string, details: string): void {
        this.logs.push({
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: user,
            action: action,
            details: details
        });
    }

    // Retrieve logs
    public getLogs(): AuditLogEntry[] {
        return this.logs;
    }
}

export default AuditLogger;
