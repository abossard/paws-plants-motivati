import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Sparkle, CaretDown, CaretRight } from '@phosphor-icons/react'
import { Task } from '@/App'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskManagerProps {
  tasks: Task[]
  onAddTask: (text: string, parentId?: string) => void
  onCompleteTask: (taskId: string) => void
}

interface TaskItemProps {
  task: Task
  subtasks: Task[]
  onAddSubtask: (parentId: string, text: string) => void
  onCompleteTask: (taskId: string) => void
  level?: number
}

function TaskItem({ task, subtasks, onAddSubtask, onCompleteTask, level = 0 }: TaskItemProps) {
  const [showSubtasks, setShowSubtasks] = useState(true)
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [subtaskText, setSubtaskText] = useState('')

  const handleAddSubtask = () => {
    if (subtaskText.trim()) {
      onAddSubtask(task.id, subtaskText.trim())
      setSubtaskText('')
      setShowAddSubtask(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddSubtask()
    } else if (e.key === 'Escape') {
      setShowAddSubtask(false)
      setSubtaskText('')
    }
  }

  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  const allSubtasksCompleted = totalSubtasks > 0 && completedSubtasks === totalSubtasks

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={`${level > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}`}
    >
      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group">
        <Checkbox
          id={task.id}
          checked={task.completed}
          onCheckedChange={() => onCompleteTask(task.id)}
        />
        
        <div className="flex-1 flex items-center gap-2">
          {subtasks.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={() => setShowSubtasks(!showSubtasks)}
            >
              {showSubtasks ? (
                <CaretDown className="w-3 h-3" />
              ) : (
                <CaretRight className="w-3 h-3" />
              )}
            </Button>
          )}
          
          <label 
            htmlFor={task.id}
            className={`text-sm font-medium cursor-pointer flex-1 ${
              task.completed ? 'line-through opacity-60' : ''
            }`}
          >
            {task.text}
          </label>
          
          {totalSubtasks > 0 && (
            <span className="text-xs text-muted-foreground">
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!task.completed && (
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
              onClick={() => setShowAddSubtask(true)}
              title="Add subtask"
            >
              <Plus className="w-3 h-3" />
            </Button>
          )}
          <div className="text-xs text-accent font-medium">+10 🐾</div>
        </div>
      </div>

      <AnimatePresence>
        {showAddSubtask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 ml-6"
          >
            <div className="flex gap-2">
              <Input
                placeholder="Add a subtask..."
                value={subtaskText}
                onChange={(e) => setSubtaskText(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={() => {
                  if (!subtaskText.trim()) {
                    setShowAddSubtask(false)
                  }
                }}
                className="text-sm"
                autoFocus
              />
              <Button 
                size="sm"
                onClick={handleAddSubtask}
                disabled={!subtaskText.trim()}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubtasks && subtasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 space-y-2"
          >
            {subtasks.map((subtask) => (
              <TaskItem
                key={subtask.id}
                task={subtask}
                subtasks={[]} // Subtasks don't have their own subtasks for now
                onAddSubtask={onAddSubtask}
                onCompleteTask={onCompleteTask}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function TaskManager({ tasks, onAddTask, onCompleteTask }: TaskManagerProps) {
  const [newTaskText, setNewTaskText] = useState('')
  const [showCompleted, setShowCompleted] = useState(false)

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim())
      setNewTaskText('')
    }
  }

  const handleAddSubtask = (parentId: string, text: string) => {
    onAddTask(text, parentId)
  }

  const handleCompleteTask = (taskId: string) => {
    onCompleteTask(taskId)
    // Add a small celebration
    const confetti = document.createElement('div')
    confetti.textContent = '🎉'
    confetti.style.position = 'fixed'
    confetti.style.left = '50%'
    confetti.style.top = '20%'
    confetti.style.fontSize = '2rem'
    confetti.style.pointerEvents = 'none'
    confetti.style.zIndex = '1000'
    confetti.style.animation = 'fadeInUp 1s ease-out forwards'
    document.body.appendChild(confetti)
    
    setTimeout(() => {
      document.body.removeChild(confetti)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddTask()
    }
  }

  // Organize tasks into parent-child relationships
  const mainTasks = tasks.filter(task => !task.parentId)
  const getSubtasks = (parentId: string) => tasks.filter(task => task.parentId === parentId)

  const activeTasks = mainTasks.filter(task => !task.completed)
  const completedTasks = mainTasks.filter(task => task.completed)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add New Task
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="What would you like to accomplish today?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button 
              onClick={handleAddTask}
              disabled={!newTaskText.trim()}
              className="shrink-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Today's Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {activeTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkle className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p>No tasks yet! Add one above to start earning Paw Points.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {activeTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    subtasks={getSubtasks(task.id)}
                    onAddSubtask={handleAddSubtask}
                    onCompleteTask={handleCompleteTask}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {completedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle 
              className="cursor-pointer flex items-center justify-between"
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <span>Completed Tasks ({completedTasks.length})</span>
              <motion.div
                animate={{ rotate: showCompleted ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Plus className="w-4 h-4" />
              </motion.div>
            </CardTitle>
          </CardHeader>
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent>
                  <div className="space-y-2">
                    {completedTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        subtasks={getSubtasks(task.id)}
                        onAddSubtask={handleAddSubtask}
                        onCompleteTask={handleCompleteTask}
                      />
                    ))}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      )}
    </div>
  )
}