'use client'

import { useState, useCallback } from 'react'
import { Plus, Trash2, Settings, MessageSquare } from 'lucide-react'
import { BusinessRule } from '@/types'

interface BusinessRulesProps {
    rules: BusinessRule[]
    onRulesChange: (rules: BusinessRule[]) => void
    tasks: any[]
    workers: any[]
}

export default function BusinessRules({
    rules,
    onRulesChange,
    tasks,
    workers
}: BusinessRulesProps) {
    const [showAddRule, setShowAddRule] = useState(false)
    const [naturalLanguageInput, setNaturalLanguageInput] = useState('')
    const [selectedRuleType, setSelectedRuleType] = useState<BusinessRule['type']>('co-run')

    const addRule = useCallback((rule: Omit<BusinessRule, 'id'>) => {
        const newRule: BusinessRule = {
            ...rule,
            id: `rule-${Date.now()}`,
            enabled: true
        }
        onRulesChange([...rules, newRule])
        setShowAddRule(false)
    }, [rules, onRulesChange])

    const removeRule = useCallback((ruleId: string) => {
        onRulesChange(rules.filter(rule => rule.id !== ruleId))
    }, [rules, onRulesChange])

    const toggleRule = useCallback((ruleId: string) => {
        onRulesChange(rules.map(rule =>
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
        ))
    }, [rules, onRulesChange])

    const parseNaturalLanguage = useCallback((input: string) => {
        const lowerInput = input.toLowerCase()

        // Co-run rule
        if (lowerInput.includes('co-run') || lowerInput.includes('run together')) {
            const taskMatch = input.match(/task\s+(\w+)/gi)
            if (taskMatch && taskMatch.length >= 2) {
                const taskIds = taskMatch.map(match => match.replace(/task\s+/i, '').trim())
                return {
                    type: 'co-run' as const,
                    description: `Tasks ${taskIds.join(' and ')} must run together`,
                    config: { taskIds }
                }
            }
        }

        // Load limit rule
        if (lowerInput.includes('limit') && lowerInput.includes('load')) {
            const workerMatch = input.match(/worker\s+(\w+)/i)
            const limitMatch = input.match(/(\d+)\s+slots?/i)
            if (workerMatch && limitMatch) {
                return {
                    type: 'load-limit' as const,
                    description: `Worker ${workerMatch[1]} limited to ${limitMatch[1]} slots per phase`,
                    config: { workerId: workerMatch[1], maxSlots: parseInt(limitMatch[1]) }
                }
            }
        }

        // Phase restriction rule
        if (lowerInput.includes('phase') && (lowerInput.includes('only') || lowerInput.includes('restrict'))) {
            const taskMatch = input.match(/task\s+(\w+)/i)
            const phaseMatch = input.match(/phase\s+(\d+)/i)
            if (taskMatch && phaseMatch) {
                return {
                    type: 'phase-restriction' as const,
                    description: `Task ${taskMatch[1]} only runs in Phase ${phaseMatch[1]}`,
                    config: { taskId: taskMatch[1], allowedPhases: [parseInt(phaseMatch[1])] }
                }
            }
        }

        // Skill requirement rule
        if (lowerInput.includes('skill') && lowerInput.includes('require')) {
            const skillMatch = input.match(/skill\s+(\w+)/i)
            const taskMatch = input.match(/task\s+(\w+)/i)
            if (skillMatch && taskMatch) {
                return {
                    type: 'skill-requirement' as const,
                    description: `Task ${taskMatch[1]} requires skill ${skillMatch[1]}`,
                    config: { taskId: taskMatch[1], requiredSkill: skillMatch[1] }
                }
            }
        }

        return null
    }, [])

    const handleNaturalLanguageSubmit = useCallback(() => {
        const parsedRule = parseNaturalLanguage(naturalLanguageInput)
        if (parsedRule) {
            addRule({ ...parsedRule, enabled: true })
            setNaturalLanguageInput('')
        } else {
            alert('Could not parse the rule. Please try a different format.')
        }
    }, [naturalLanguageInput, parseNaturalLanguage, addRule])

    const renderRuleForm = () => {
        switch (selectedRuleType) {
            case 'co-run':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Tasks</label>
                            <select multiple className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                {tasks.map(task => (
                                    <option key={task.id} value={task.id}>{task.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )

            case 'load-limit':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Worker</label>
                            <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                {workers.map(worker => (
                                    <option key={worker.id} value={worker.id}>{worker.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Max Slots per Phase</label>
                            <input
                                type="number"
                                min="1"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="2"
                            />
                        </div>
                    </div>
                )

            case 'phase-restriction':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Task</label>
                            <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                {tasks.map(task => (
                                    <option key={task.id} value={task.id}>{task.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Allowed Phases</label>
                            <input
                                type="text"
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                                placeholder="1,2,3"
                            />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Business Rules</h3>
                <button
                    onClick={() => setShowAddRule(true)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                </button>
            </div>

            {/* Natural Language Input */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center mb-2">
                    <MessageSquare className="h-4 w-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">Natural Language Rule</label>
                </div>
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={naturalLanguageInput}
                        onChange={(e) => setNaturalLanguageInput(e.target.value)}
                        placeholder="e.g., 'Task T3 runs only in Phase 2' or 'Worker W1 limited to 2 slots per phase'"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleNaturalLanguageSubmit}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                        Parse
                    </button>
                </div>
            </div>

            {/* Rules List */}
            <div className="space-y-3">
                {rules.map((rule) => (
                    <div
                        key={rule.id}
                        className={`p-4 border rounded-lg ${rule.enabled ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Settings className="h-4 w-4 text-gray-500" />
                                <div>
                                    <p className={`text-sm font-medium ${rule.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                        {rule.description}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Type: {rule.type.replace('-', ' ')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => toggleRule(rule.id)}
                                    className={`px-2 py-1 text-xs rounded ${rule.enabled
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {rule.enabled ? 'Enabled' : 'Disabled'}
                                </button>
                                <button
                                    onClick={() => removeRule(rule.id)}
                                    className="text-red-600 hover:text-red-800"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {rules.length === 0 && (
                    <p className="text-gray-500 text-center py-8">No business rules defined yet.</p>
                )}
            </div>

            {/* Add Rule Modal */}
            {showAddRule && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Add Business Rule</h4>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Rule Type</label>
                            <select
                                value={selectedRuleType}
                                onChange={(e) => setSelectedRuleType(e.target.value as BusinessRule['type'])}
                                className="block w-full border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="co-run">Co-run Tasks</option>
                                <option value="load-limit">Load Limit</option>
                                <option value="phase-restriction">Phase Restriction</option>
                                <option value="skill-requirement">Skill Requirement</option>
                            </select>
                        </div>

                        {renderRuleForm()}

                        <div className="flex justify-end space-x-3 mt-6">
                            <button
                                onClick={() => setShowAddRule(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    // Add rule logic here
                                    setShowAddRule(false)
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                Add Rule
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
} 