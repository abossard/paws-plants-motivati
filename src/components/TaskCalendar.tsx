import { useState, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock, Target } from '@phosphor-icons/react'
import { Task } from '@/App'
import { toast } from 'sonner'

interface PlannedTask {
  id: string
  text: string
  plannedDate: string // YYYY-MM-DD format
  createdAt: number
  priority: 'low' | 'medium' | 'high'
  completed?: boolean
  actualTaskId?: string // Link to actual task when moved to today
}

interface TaskCalendarProps {
  tasks: Task[]
  onAddTask: (text: string, parentId?: string) => void
}

function TaskCalendar({ tasks, onAddTask }: TaskCalendarProps) {
  const [plannedTasks, setPlannedTasks] = useKV<PlannedTask[]>("planned-tasks", [])
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [newTaskText, setNewTaskText] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<PlannedTask['priority']>('medium')
  
  // Calendar navigation
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }
  
  // Get calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // Start from Sunday
    
    const weeks = []
    const currentWeek = []
    
    for (let i = 0; i < 42; i++) { // 6 weeks * 7 days
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      
      currentWeek.push(day)
      
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek])
        currentWeek.length = 0
      }
    }
    
    return { weeks, month, year, firstDay, lastDay }
  }, [currentDate])
  
  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return plannedTasks.filter(task => task.plannedDate === dateStr)
  }
  
  // Get actual completed tasks for a date
  const getCompletedTasksForDate = (date: Date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setHours(23, 59, 59, 999)
    
    return tasks.filter(task => {
      const taskDate = new Date(task.createdAt)
      return taskDate >= dayStart && taskDate <= dayEnd && task.completed && !task.parentId
    }).length
  }
  
  // Add a planned task
  const addPlannedTask = () => {
    if (!newTaskText.trim() || !selectedDate) return
    
    const plannedTask: PlannedTask = {
      id: Date.now().toString(),
      text: newTaskText.trim(),
      plannedDate: selectedDate,
      createdAt: Date.now(),
      priority: newTaskPriority
    }
    
    setPlannedTasks(current => [...current, plannedTask])
    setNewTaskText('')
    toast.success('Task planned successfully!')
  }
  
  // Move planned task to today's actual tasks
  const moveToToday = (plannedTaskId: string) => {
    const plannedTask = plannedTasks.find(t => t.id === plannedTaskId)
    if (!plannedTask) return
    
    // Add to actual tasks
    onAddTask(plannedTask.text)
    
    // Mark planned task as moved
    setPlannedTasks(current => 
      current.map(task => 
        task.id === plannedTaskId 
          ? { ...task, completed: true }
          : task
      )
    )
    
    toast.success('Task moved to today!')
  }
  
  // Delete planned task
  const deletePlannedTask = (plannedTaskId: string) => {
    setPlannedTasks(current => current.filter(task => task.id !== plannedTaskId))
    toast.success('Planned task deleted')
  }
  
  // Get today's date string
  const today = new Date().toISOString().split('T')[0]
  
  // Calculate upcoming tasks (next 7 days)
  const upcomingTasks = useMemo(() => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    return plannedTasks.filter(task => {
      const taskDate = new Date(task.plannedDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      return taskDate >= today && taskDate <= nextWeek && !task.completed
    }).sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
  }, [plannedTasks])
  
  const getPriorityColor = (priority: PlannedTask['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-300'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low': return 'bg-green-100 text-green-700 border-green-300'
    }
  }
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Task Calendar</h2>
        <p className="text-muted-foreground">Plan your tasks ahead of time</p>
      </div>
      
      {/* Upcoming Tasks */}
      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Upcoming Tasks (Next 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span className="font-medium">{task.text}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(task.plannedDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => moveToToday(task.id)}
                      className="text-xs"
                    >
                      Move to Today
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => deletePlannedTask(task.id)}
                      className="text-xs"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Calendar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {calendarData.firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar weeks */}
            {calendarData.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid grid-cols-7 gap-1">
                {week.map((day, dayIndex) => {
                  const dateStr = day.toISOString().split('T')[0]
                  const isCurrentMonth = day.getMonth() === calendarData.month
                  const isToday = dateStr === today
                  const dayTasks = getTasksForDate(day)
                  const completedCount = getCompletedTasksForDate(day)
                  const isSelected = selectedDate === dateStr
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`
                        relative p-2 min-h-[80px] border rounded-lg cursor-pointer transition-all
                        ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                        ${isToday ? 'ring-2 ring-primary' : ''}
                        ${isSelected ? 'bg-primary/10 border-primary' : 'border-border'}
                        hover:bg-muted/50
                      `}
                      onClick={() => setSelectedDate(dateStr)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {day.getDate()}
                        </span>
                        {completedCount > 0 && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            ✓{completedCount}
                          </Badge>
                        )}
                      </div>
                      
                      {/* Planned tasks for this day */}
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded truncate ${
                              task.completed ? 'bg-green-100 text-green-700 line-through' : getPriorityColor(task.priority)
                            }`}
                            title={task.text}
                          >
                            {task.text}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayTasks.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Add Task Form */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-500" />
              Plan Task for {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter task description..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPlannedTask()}
                className="flex-1"
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as PlannedTask['priority'])}
                className="px-3 py-2 border border-input rounded-md bg-background"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              <Button onClick={addPlannedTask}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            {/* Tasks for selected date */}
            {selectedDate && (
              <div className="space-y-2">
                <h4 className="font-medium">Tasks for this day:</h4>
                {getTasksForDate(new Date(selectedDate)).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      <span className={task.completed ? 'line-through text-muted-foreground' : ''}>
                        {task.text}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {!task.completed && selectedDate === today && (
                        <Button size="sm" onClick={() => moveToToday(task.id)}>
                          Add to Today
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deletePlannedTask(task.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default TaskCalendar