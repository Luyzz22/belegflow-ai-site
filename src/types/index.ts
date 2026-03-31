// src/types/index.ts

// Interfaces for TypeScript Enterprise Type Safety

/**
 * Represents a User in the system.
 */
export interface User {
    id: number;
    username: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Represents an authorization token for a user.
 */
export interface AuthToken {
    token: string;
    expiresAt: Date;
}

/**
 * Represents an Invoice in the system.
 */
export interface Invoice {
    id: number;
    amount: number;
    dueDate: Date;
    issuedAt: Date;
}

/**
 * Represents a suggestion for accounting entries.
 */
export interface KontierungSuggestion {
    id: number;
    suggestion: string;
    confidence: number;
}

/**
 * Represents an entry in the audit log.
 */
export interface AuditLog {
    id: number;
    action: string;
    userId: number;
    timestamp: Date;
}

/**
 * Represents an incident report in the system.
 */
export interface IncidentReport {
    id: number;
    description: string;
    reportedAt: Date;
    status: string;
}