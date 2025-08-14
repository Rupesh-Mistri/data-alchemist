'use client'

import { useState } from 'react'
import { Sliders, TrendingUp, Users, Target, Clock } from 'lucide-react'
import { PrioritySettings as PrioritySettingsType } from '@/types'

interface PrioritySettingsProps {
    priorities: PrioritySettingsType
    onPrioritiesChange: (priorities: PrioritySettingsType) => void
}

export default function PrioritySettings({
    priorities,
    onPrioritiesChange
}: PrioritySettingsProps) {
    const [localPriorities, setLocalPriorities] = useState(priorities)

    const handleSliderChange = (key: keyof PrioritySettingsType, value: number) => {
        const newPriorities = { ...localPriorities, [key]: value }
        setLocalPriorities(newPriorities)
        onPrioritiesChange(newPriorities)
    }

    const priorityItems = [
        {
            key: 'clientValue' as const,
            label: 'Client Value Priority',
            description: 'Prioritize high-value clients',
            icon: TrendingUp,
            color: 'blue'
        },
        {
            key: 'workloadBalance' as const,
            label: 'Workload Balance',
            description: 'Distribute work evenly across workers',
            icon: Users,
            color: 'green'
        },
        {
            key: 'skillMatch' as const,
            label: 'Skill Match',
            description: 'Match tasks to workers with appropriate skills',
            icon: Target,
            color: 'purple'
        },
        {
            key: 'deadlineUrgency' as const,
            label: 'Deadline Urgency',
            description: 'Prioritize tasks with tight deadlines',
            icon: Clock,
            color: 'red'
        }
    ]

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'blue':
                return 'bg-blue-500'
            case 'green':
                return 'bg-green-500'
            case 'purple':
                return 'bg-purple-500'
            case 'red':
                return 'bg-red-500'
            default:
                return 'bg-gray-500'
        }
    }

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-6">
                <Sliders className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Priority Settings</h3>
            </div>

            <div className="space-y-6">
                {priorityItems.map((item) => {
                    const Icon = item.icon
                    const value = localPriorities[item.key]

                    return (
                        <div key={item.key} className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-lg ${getColorClasses(item.color)}`}>
                                    <Icon className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-gray-900">
                                        {item.label}
                                    </label>
                                    <p className="text-xs text-gray-500">
                                        {item.description}
                                    </p>
                                </div>
                                <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                                    {value}%
                                </span>
                            </div>

                            <div className="relative">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={value}
                                    onChange={(e) => handleSliderChange(item.key, parseInt(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                        background: `linear-gradient(to right, ${getColorClasses(item.color)} 0%, ${getColorClasses(item.color)} ${value}%, #e5e7eb ${value}%, #e5e7eb 100%)`
                                    }}
                                />
                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                    <span>Low</span>
                                    <span>High</span>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Priority Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                    {priorityItems.map((item) => (
                        <div key={item.key} className="flex justify-between">
                            <span className="text-gray-600">{item.label}:</span>
                            <span className="font-medium">{localPriorities[item.key]}%</span>
                        </div>
                    ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                    <div className="flex justify-between text-sm font-medium">
                        <span>Total:</span>
                        <span>{Object.values(localPriorities).reduce((sum, val) => sum + val, 0)}%</span>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
        </div>
    )
} 