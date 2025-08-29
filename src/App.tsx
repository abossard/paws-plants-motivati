import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, TreePine, Heart } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import TaskManager from '@/components/TaskManager'
import CatAvatar from '@/components/CatAvatar'
import Forest from '@/components/Forest'

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export interface Tree {
  id: string
  type: 'oak' | 'pine' | 'cherry' | 'willow'
  plantedAt: number
  growth: number
  catBlessings: number
  position?: {
    x: number // Percentage from left (0-100)
    y: number // Percentage from bottom (0-100)
  }
}

export interface CatState {
  mood: 'happy' | 'neutral' | 'sad'
  lastFed: number
  lastPlayed: number
  blessingsGiven: number
  lastBlessing: number
}

function App() {
  const [pawPoints, setPawPoints] = useKV("paw-points", 0)
  const [tasks, setTasks] = useKV<Task[]>("tasks", [])
  const [trees, setTrees] = useKV<Tree[]>("trees", [])
  const [catState, setCatState] = useKV<CatState>("cat-state", {
    mood: 'neutral',
    lastFed: Date.now(),
    lastPlayed: Date.now(),
    blessingsGiven: 0,
    lastBlessing: 0
  })

  // Migrate existing trees to have position data
  useEffect(() => {
    setTrees(currentTrees => 
      currentTrees.map((tree, index) => {
        if (!tree.position) {
          // Generate default position for existing trees
          const seed = parseInt(tree.id) || index
          const x = (seed * 9301 + 49297) % 233280
          const groundLevels = [15, 18, 12, 20, 16, 14]
          const groundLevel = groundLevels[index % groundLevels.length]
          
          return {
            ...tree,
            position: {
              x: (x / 233280) * 80 + 10, // 10-90% horizontal range
              y: groundLevel // Ground level from bottom
            }
          }
        }
        return tree
      })
    )
  }, [])

  const completeTask = (taskId: string) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
    )
    setPawPoints(current => current + 10)
  }

  const addTask = (text: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now()
    }
    setTasks(currentTasks => [...currentTasks, newTask])
  }

  const spendPoints = (amount: number) => {
    if (pawPoints >= amount) {
      setPawPoints(current => current - amount)
      return true
    }
    return false
  }

  const plantTree = (type: Tree['type']) => {
    const cost = getTreeCost(type)
    if (spendPoints(cost)) {
      // Generate random position for new tree
      const randomX = Math.random() * 80 + 10 // 10-90% from left
      const randomY = Math.random() * 20 + 10 // 10-30% from bottom
      
      const newTree: Tree = {
        id: Date.now().toString(),
        type,
        plantedAt: Date.now(),
        growth: 0,
        catBlessings: 0,
        position: { x: randomX, y: randomY }
      }
      setTrees(currentTrees => [...currentTrees, newTree])
      return true
    }
    return false
  }

  const updateTreePosition = (treeId: string, x: number, y: number) => {
    setTrees(currentTrees => 
      currentTrees.map(tree => 
        tree.id === treeId 
          ? { ...tree, position: { x, y } }
          : tree
      )
    )
  }

  const careCat = (action: 'feed' | 'play') => {
    const cost = action === 'feed' ? 10 : 5
    if (spendPoints(cost)) {
      setCatState(current => ({
        ...current,
        mood: 'happy',
        [action === 'feed' ? 'lastFed' : 'lastPlayed']: Date.now()
      }))
      return true
    }
    return false
  }

  const blessForest = () => {
    const cost = 25
    if (pawPoints >= cost && catState.mood === 'happy') {
      if (spendPoints(cost)) {
        // Apply blessing to all trees (faster growth)
        setTrees(currentTrees => 
          currentTrees.map(tree => ({
            ...tree,
            catBlessings: tree.catBlessings + 1
          }))
        )
        
        setCatState(current => ({
          ...current,
          blessingsGiven: current.blessingsGiven + 1,
          lastBlessing: Date.now()
        }))
        return true
      }
    }
    return false
  }

  const getTreeCost = (type: Tree['type']) => {
    const costs = { oak: 25, pine: 20, cherry: 35, willow: 30 }
    return costs[type]
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Paws & Plants</h1>
          <p className="text-muted-foreground mb-4">Grow your productivity garden with your feline friend</p>
          <Card className="inline-block">
            <CardContent className="p-4">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Heart className="w-5 h-5 mr-2 text-accent" weight="fill" />
                {pawPoints} Paw Points
              </Badge>
            </CardContent>
          </Card>
        </header>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="cat" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Cat Care
            </TabsTrigger>
            <TabsTrigger value="forest" className="flex items-center gap-2">
              <TreePine className="w-4 h-4" />
              Forest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskManager 
              tasks={tasks}
              onAddTask={addTask}
              onCompleteTask={completeTask}
            />
          </TabsContent>

          <TabsContent value="cat">
            <CatAvatar 
              catState={catState}
              pawPoints={pawPoints}
              onCareCat={careCat}
              onBlessForest={blessForest}
              trees={trees}
            />
          </TabsContent>

          <TabsContent value="forest">
            <Forest 
              trees={trees}
              pawPoints={pawPoints}
              onPlantTree={plantTree}
              onUpdateTreePosition={updateTreePosition}
              getTreeCost={getTreeCost}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App