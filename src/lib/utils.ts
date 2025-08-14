import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Client, Worker, Task, ValidationError, ColumnMapping } from "@/types"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// AI-assisted column mapping
export function suggestColumnMapping(originalColumns: string[], targetSchema: string[]): ColumnMapping[] {
    const mappings: ColumnMapping[] = []

    for (const original of originalColumns) {
        const normalized = original.toLowerCase().replace(/[^a-z0-9]/g, '')

        for (const target of targetSchema) {
            const targetNormalized = target.toLowerCase().replace(/[^a-z0-9]/g, '')

            if (normalized === targetNormalized) {
                mappings.push({
                    originalName: original,
                    mappedName: target,
                    confidence: 1.0
                })
                break
            } else if (normalized.includes(targetNormalized) || targetNormalized.includes(normalized)) {
                mappings.push({
                    originalName: original,
                    mappedName: target,
                    confidence: 0.8
                })
                break
            }
        }
    }

    return mappings
}

// Data validation functions
export function validateClients(clients: Client[], tasks: Task[]): ValidationError[] {
    const errors: ValidationError[] = []
    const clientIds = new Set<string>()

    for (const client of clients) {
        // Check for duplicate IDs
        if (clientIds.has(client.id)) {
            errors.push({
                id: `client-${client.id}`,
                type: 'duplicate-id',
                message: `Duplicate client ID: ${client.id}`,
                field: 'id',
                value: client.id
            })
        }
        clientIds.add(client.id)

        // Check for missing required fields
        if (!client.name) {
            errors.push({
                id: `client-${client.id}`,
                type: 'missing-column',
                message: `Missing name for client ${client.id}`,
                field: 'name'
            })
        }

        // Check for out-of-range values
        if (client.priority < 1 || client.priority > 10) {
            errors.push({
                id: `client-${client.id}`,
                type: 'out-of-range',
                message: `Priority must be between 1-10 for client ${client.id}`,
                field: 'priority',
                value: client.priority,
                suggestion: 'Set priority to a value between 1 and 10'
            })
        }
    }

    return errors
}

export function validateWorkers(workers: Worker[]): ValidationError[] {
    const errors: ValidationError[] = []
    const workerIds = new Set<string>()

    for (const worker of workers) {
        // Check for duplicate IDs
        if (workerIds.has(worker.id)) {
            errors.push({
                id: `worker-${worker.id}`,
                type: 'duplicate-id',
                message: `Duplicate worker ID: ${worker.id}`,
                field: 'id',
                value: worker.id
            })
        }
        workerIds.add(worker.id)

        // Check for missing required fields
        if (!worker.name) {
            errors.push({
                id: `worker-${worker.id}`,
                type: 'missing-column',
                message: `Missing name for worker ${worker.id}`,
                field: 'name'
            })
        }

        // Check for out-of-range values
        if (worker.availability < 0 || worker.availability > 100) {
            errors.push({
                id: `worker-${worker.id}`,
                type: 'out-of-range',
                message: `Availability must be between 0-100 for worker ${worker.id}`,
                field: 'availability',
                value: worker.availability,
                suggestion: 'Set availability to a percentage between 0 and 100'
            })
        }
    }

    return errors
}

export function validateTasks(tasks: Task[], clients: Client[], workers: Worker[]): ValidationError[] {
    const errors: ValidationError[] = []
    const taskIds = new Set<string>()
    const clientIds = new Set(clients.map(c => c.id))
    const workerSkills = new Set(workers.flatMap(w => w.skills))

    for (const task of tasks) {
        // Check for duplicate IDs
        if (taskIds.has(task.id)) {
            errors.push({
                id: `task-${task.id}`,
                type: 'duplicate-id',
                message: `Duplicate task ID: ${task.id}`,
                field: 'id',
                value: task.id
            })
        }
        taskIds.add(task.id)

        // Check for missing required fields
        if (!task.name) {
            errors.push({
                id: `task-${task.id}`,
                type: 'missing-column',
                message: `Missing name for task ${task.id}`,
                field: 'name'
            })
        }

        // Check for invalid client reference
        if (!clientIds.has(task.clientId)) {
            errors.push({
                id: `task-${task.id}`,
                type: 'invalid-reference',
                message: `Task ${task.id} references non-existent client ${task.clientId}`,
                field: 'clientId',
                value: task.clientId,
                suggestion: 'Check client ID or add missing client'
            })
        }

        // Check for missing skills
        for (const skill of task.skills) {
            if (!workerSkills.has(skill)) {
                errors.push({
                    id: `task-${task.id}`,
                    type: 'missing-skill',
                    message: `Task ${task.id} requires skill '${skill}' but no worker has it`,
                    field: 'skills',
                    value: skill,
                    suggestion: 'Add worker with this skill or modify task requirements'
                })
            }
        }

        // Check for out-of-range values
        if (task.phases < 1) {
            errors.push({
                id: `task-${task.id}`,
                type: 'out-of-range',
                message: `Task ${task.id} must have at least 1 phase`,
                field: 'phases',
                value: task.phases,
                suggestion: 'Set phases to at least 1'
            })
        }
    }

    return errors
}

// Natural language search
export function searchData(
    query: string,
    clients: Client[],
    workers: Worker[],
    tasks: Task[]
): { clients: Client[], workers: Worker[], tasks: Task[] } {
    const normalizedQuery = query.toLowerCase()

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(normalizedQuery) ||
        client.id.toLowerCase().includes(normalizedQuery)
    )

    const filteredWorkers = workers.filter(worker =>
        worker.name.toLowerCase().includes(normalizedQuery) ||
        worker.id.toLowerCase().includes(normalizedQuery) ||
        worker.skills.some(skill => skill.toLowerCase().includes(normalizedQuery))
    )

    const filteredTasks = tasks.filter(task =>
        task.name.toLowerCase().includes(normalizedQuery) ||
        task.id.toLowerCase().includes(normalizedQuery) ||
        task.clientId.toLowerCase().includes(normalizedQuery) ||
        task.skills.some(skill => skill.toLowerCase().includes(normalizedQuery))
    )

    // Handle specific search patterns
    if (normalizedQuery.includes('phase') && normalizedQuery.includes('>')) {
        const match = normalizedQuery.match(/phase.*?(\d+)/)
        if (match) {
            const phaseCount = parseInt(match[1])
            const phaseFilteredTasks = tasks.filter(task => task.phases > phaseCount)
            return { clients: [], workers: [], tasks: phaseFilteredTasks }
        }
    }

    return { clients: filteredClients, workers: filteredWorkers, tasks: filteredTasks }
}

// Export functions
export function exportToJSON(data: any, filename: string) {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

export function exportToCSV(data: any[], filename: string) {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
} 