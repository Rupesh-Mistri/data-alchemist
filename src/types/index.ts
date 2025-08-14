export interface Client {
    id: string;
    name: string;
    priority: number;
    value: number;
    requirements?: string[];
}

export interface Worker {
    id: string;
    name: string;
    skills: string[];
    availability: number;
    maxLoad: number;
}

export interface Task {
    id: string;
    name: string;
    clientId: string;
    phases: number;
    skills: string[];
    priority: number;
    estimatedHours: number;
}

export interface BusinessRule {
    id: string;
    type: 'co-run' | 'load-limit' | 'phase-restriction' | 'skill-requirement';
    description: string;
    config: Record<string, any>;
    enabled: boolean;
}

export interface ValidationError {
    id: string;
    type: 'missing-column' | 'duplicate-id' | 'invalid-reference' | 'out-of-range' | 'missing-skill';
    message: string;
    field?: string;
    value?: any;
    suggestion?: string;
}

export interface ColumnMapping {
    originalName: string;
    mappedName: string;
    confidence: number;
}

export interface PrioritySettings {
    clientValue: number;
    workloadBalance: number;
    skillMatch: number;
    deadlineUrgency: number;
}

export interface ExportData {
    clients: Client[];
    workers: Worker[];
    tasks: Task[];
    rules: BusinessRule[];
    priorities: PrioritySettings;
    validationErrors: ValidationError[];
} 