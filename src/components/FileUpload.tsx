'use client'

import { useState, useCallback } from 'react'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
    onFileUpload: (data: any[], filename: string) => void
    acceptedTypes?: string[]
    maxFiles?: number
}

export default function FileUpload({
    onFileUpload,
    acceptedTypes = ['.csv', '.xlsx', '.xls'],
    maxFiles = 3
}: FileUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([])

    const processFile = useCallback(async (file: File) => {
        const reader = new FileReader()

        reader.onload = async (e) => {
            try {
                let data: any[] = []

                if (file.name.endsWith('.csv')) {
                    const Papa = (await import('papaparse')).default
                    const result = Papa.parse(e.target?.result as string, { header: true })
                    data = result.data
                } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                    const XLSX = await import('xlsx')
                    const workbook = XLSX.read(e.target?.result, { type: 'binary' })
                    const sheetName = workbook.SheetNames[0]
                    const worksheet = workbook.Sheets[sheetName]
                    data = XLSX.utils.sheet_to_json(worksheet)
                }

                onFileUpload(data, file.name)
                setUploadedFiles(prev => [...prev, file.name])
            } catch (error) {
                console.error('Error processing file:', error)
                alert('Error processing file. Please check the file format.')
            }
        }

        if (file.name.endsWith('.csv')) {
            reader.readAsText(file)
        } else {
            reader.readAsBinaryString(file)
        }
    }, [onFileUpload])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const files = Array.from(e.dataTransfer.files)
        files.slice(0, maxFiles).forEach(processFile)
    }, [processFile, maxFiles])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        files.slice(0, maxFiles).forEach(processFile)
    }, [processFile, maxFiles])

    const removeFile = useCallback((filename: string) => {
        setUploadedFiles(prev => prev.filter(f => f !== filename))
    }, [])

    return (
        <div className="w-full">
            <div
                className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragOver
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400",
                    uploadedFiles.length >= maxFiles && "opacity-50 pointer-events-none"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">
                        Upload your spreadsheets
                    </p>
                    <p className="text-sm text-gray-500">
                        Drag and drop your CSV or Excel files here, or click to browse
                    </p>
                    <p className="text-xs text-gray-400">
                        Accepted formats: {acceptedTypes.join(', ')} (Max {maxFiles} files)
                    </p>
                </div>

                <input
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                />
                <label
                    htmlFor="file-upload"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                    Choose Files
                </label>
            </div>

            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h3 className="text-sm font-medium text-gray-900">Uploaded Files:</h3>
                    {uploadedFiles.map((filename) => (
                        <div
                            key={filename}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                            <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-700">{filename}</span>
                            </div>
                            <button
                                onClick={() => removeFile(filename)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
} 