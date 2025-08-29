import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Sparkle } from '@phosphor-icons/react'
import { Task } from '@/App'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskManagerProps {
  tasks: Task[]
  onAddTask: (text: string) => void
  onCompleteTask: (taskId: string) => void
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

  const activeTasks = tasks.filter(task => !task.completed)
  const completedTasks = tasks.filter(task => task.completed)

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
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={task.id}
                      checked={task.completed}
                      onCheckedChange={() => handleCompleteTask(task.id)}
                    />
                    <label 
                      htmlFor={task.id}
                      className="flex-1 text-sm font-medium cursor-pointer"
                    >
                      {task.text}
                    </label>
                    <div className="text-xs text-accent font-medium">+10 🐾</div>
                  </motion.div>
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
                      <div
                        key={task.id}
                        className="flex items-center gap-3 p-2 rounded opacity-60"
                      >
                        <Checkbox checked={true} disabled />
                        <span className="flex-1 text-sm line-through">
                          {task.text}
                        </span>
                        <div className="text-xs text-green-600">✓ +10 🐾</div>
                      </div>
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