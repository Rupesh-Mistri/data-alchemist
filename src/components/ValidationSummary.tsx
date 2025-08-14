'use client'

import { useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Info, ChevronDown, ChevronRight } from 'lucide-react'
import { ValidationError } from '@/types'
import { cn } from '@/lib/utils'

interface ValidationSummaryProps {
    errors: ValidationError[]
    onFixSuggestion?: (error: ValidationError, suggestion: string) => void
}

export default function ValidationSummary({
    errors,
    onFixSuggestion
}: ValidationSummaryProps) {
    const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set())

    const toggleError = (errorId: string) => {
        const newExpanded = new Set(expandedErrors)
        if (newExpanded.has(errorId)) {
            newExpanded.delete(errorId)
        } else {
            newExpanded.add(errorId)
        }
        setExpandedErrors(newExpanded)
    }

    const getErrorIcon = (type: ValidationError['type']) => {
        switch (type) {
            case 'missing-column':
                return <XCircle className="h-4 w-4 text-red-500" />
            case 'duplicate-id':
                return <AlertTriangle className="h-4 w-4 text-orange-500" />
            case 'invalid-reference':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'out-of-range':
                return <Info className="h-4 w-4 text-blue-500" />
            case 'missing-skill':
                return <AlertTriangle className="h-4 w-4 text-purple-500" />
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500" />
        }
    }

    const getErrorColor = (type: ValidationError['type']) => {
        switch (type) {
            case 'missing-column':
                return 'border-red-200 bg-red-50'
            case 'duplicate-id':
                return 'border-orange-200 bg-orange-50'
            case 'invalid-reference':
                return 'border-yellow-200 bg-yellow-50'
            case 'out-of-range':
                return 'border-blue-200 bg-blue-50'
            case 'missing-skill':
                return 'border-purple-200 bg-purple-50'
            default:
                return 'border-gray-200 bg-gray-50'
        }
    }

    const getErrorTypeLabel = (type: ValidationError['type']) => {
        switch (type) {
            case 'missing-column':
                return 'Missing Column'
            case 'duplicate-id':
                return 'Duplicate ID'
            case 'invalid-reference':
                return 'Invalid Reference'
            case 'out-of-range':
                return 'Out of Range'
            case 'missing-skill':
                return 'Missing Skill'
            default:
                return 'Validation Error'
        }
    }

    const errorCounts = errors.reduce((acc, error) => {
        acc[error.type] = (acc[error.type] || 0) + 1
        return acc
    }, {} as Record<string, number>)

    if (errors.length === 0) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-green-800 font-medium">All data is valid!</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Summary Header */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                Validation Summary
                            </h3>
                            <p className="text-sm text-gray-500">
                                {errors.length} issue{errors.length !== 1 ? 's' : ''} found
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-4 text-sm">
                        {Object.entries(errorCounts).map(([type, count]) => (
                            <div key={type} className="flex items-center space-x-1">
                                {getErrorIcon(type as ValidationError['type'])}
                                <span className="text-gray-600">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Details */}
            <div className="space-y-2">
                {errors.map((error) => (
                    <div
                        key={error.id}
                        className={cn(
                            "border rounded-lg p-4 cursor-pointer transition-colors",
                            getErrorColor(error.type)
                        )}
                        onClick={() => toggleError(error.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                {getErrorIcon(error.type)}
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {getErrorTypeLabel(error.type)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {error.message}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {error.suggestion && (
                                    <span className="text-xs text-gray-500">
                                        Has suggestion
                                    </span>
                                )}
                                {expandedErrors.has(error.id) ? (
                                    <ChevronDown className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <ChevronRight className="h-4 w-4 text-gray-500" />
                                )}
                            </div>
                        </div>

                        {/* Expanded Error Details */}
                        {expandedErrors.has(error.id) && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <div className="space-y-2">
                                    {error.field && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-medium text-gray-500">Field:</span>
                                            <span className="text-xs text-gray-700">{error.field}</span>
                                        </div>
                                    )}
                                    {error.value && (
                                        <div className="flex items-center space-x-2">
                                            <span className="text-xs font-medium text-gray-500">Value:</span>
                                            <span className="text-xs text-gray-700">{String(error.value)}</span>
                                        </div>
                                    )}
                                    {error.suggestion && (
                                        <div className="mt-3 p-3 bg-white border border-gray-200 rounded-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs font-medium text-gray-700 mb-1">
                                                        Suggested Fix:
                                                    </p>
                                                    <p className="text-sm text-gray-900">
                                                        {error.suggestion}
                                                    </p>
                                                </div>
                                                {onFixSuggestion && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onFixSuggestion(error, error.suggestion!)
                                                        }}
                                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                                    >
                                                        Apply Fix
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h4>
                <div className="flex space-x-2">
                    <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Fix All Auto-Fixable
                    </button>
                    <button className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700">
                        Export Error Report
                    </button>
                </div>
            </div>
        </div>
    )
} 