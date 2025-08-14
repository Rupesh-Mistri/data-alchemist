'use client'

import { useState, useCallback } from 'react'
import { Edit2, Check, X, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ValidationError } from '@/types'

interface DataTableProps {
    data: any[]
    title: string
    validationErrors?: ValidationError[]
    onDataChange?: (newData: any[]) => void
    searchQuery?: string
}

export default function DataTable({
    data,
    title,
    validationErrors = [],
    onDataChange,
    searchQuery = ''
}: DataTableProps) {
    const [editingCell, setEditingCell] = useState<{ row: number; col: string } | null>(null)
    const [editValue, setEditValue] = useState('')

    const columns = data.length > 0 ? Object.keys(data[0]) : []

    const getErrorForCell = useCallback((rowIndex: number, column: string) => {
        return validationErrors.find(error =>
            error.id.includes(data[rowIndex]?.id || rowIndex.toString()) &&
            error.field === column
        )
    }, [validationErrors, data])

    const handleEdit = useCallback((rowIndex: number, column: string, value: any) => {
        setEditingCell({ row: rowIndex, col: column })
        setEditValue(String(value || ''))
    }, [])

    const handleSave = useCallback(() => {
        if (!editingCell || !onDataChange) return

        const newData = [...data]
        const { row, col } = editingCell

        // Convert value based on column type
        let convertedValue: any = editValue
        if (col === 'priority' || col === 'phases' || col === 'estimatedHours' || col === 'availability' || col === 'maxLoad') {
            convertedValue = parseFloat(editValue) || 0
        } else if (col === 'skills' || col === 'requirements') {
            convertedValue = editValue.split(',').map((s: string) => s.trim()).filter(Boolean)
        }

        newData[row] = { ...newData[row], [col]: convertedValue }
        onDataChange(newData)

        setEditingCell(null)
        setEditValue('')
    }, [editingCell, editValue, data, onDataChange])

    const handleCancel = useCallback(() => {
        setEditingCell(null)
        setEditValue('')
    }, [])

    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }, [handleSave, handleCancel])

    const filteredData = data.filter(row => {
        if (!searchQuery) return true
        return Object.values(row).some(value =>
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
    })

    if (data.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-500 text-center py-8">No data available</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500">
                    {filteredData.length} of {data.length} records
                    {validationErrors.length > 0 && (
                        <span className="ml-2 text-red-600">
                            • {validationErrors.length} validation errors
                        </span>
                    )}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {column}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredData.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-gray-50">
                                {columns.map((column) => {
                                    const error = getErrorForCell(rowIndex, column)
                                    const isEditing = editingCell?.row === rowIndex && editingCell?.col === column
                                    const value = row[column]

                                    return (
                                        <td
                                            key={column}
                                            className={cn(
                                                "px-6 py-4 whitespace-nowrap text-sm",
                                                error && "bg-red-50 border-l-4 border-red-400"
                                            )}
                                        >
                                            {isEditing ? (
                                                <div className="flex items-center space-x-2">
                                                    <input
                                                        type="text"
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={handleKeyPress}
                                                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={handleSave}
                                                        className="text-green-600 hover:text-green-800"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-900">
                                                        {Array.isArray(value) ? value.join(', ') : String(value || '')}
                                                    </span>
                                                    {error && (
                                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    )
                                })}
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <button
                                        onClick={() => handleEdit(rowIndex, columns[0], row[columns[0]])}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
} 