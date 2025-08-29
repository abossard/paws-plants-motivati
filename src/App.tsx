import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare, TreePine, Heart, ShoppingBag } from '@phosphor-icons/react'
import { Toaster } from '@/components/ui/sonner'
import TaskManager from '@/components/TaskManager'
import CatAvatar from '@/components/CatAvatar'
import CatShop from '@/components/CatShop'
import Forest from '@/components/Forest'

export interface Task {
  id: string
  text: string
  completed: boolean
  createdAt: number
  parentId?: string // For subtasks
}

export interface Tree {
  id: string
  type: 'oak' | 'pine' | 'cherry' | 'willow' | 'maple' | 'birch' | 'cypress' | 'bamboo'
  plantedAt: number
  growth: number
  catBlessings: number
  position?: {
    x: number // Percentage from left (0-100)
    y: number // Percentage from bottom (0-100)
  }
  lastHarvest?: number // When fruits were last harvested
  fruitCount?: number // Current fruit count (0-3)
}

export interface CatState {
  mood: 'happy' | 'neutral' | 'sad'
  lastFed: number
  lastPlayed: number
  blessingsGiven: number
  lastBlessing: number
}

export interface CatItem {
  id: string
  name: string
  type: 'toy' | 'accessory' | 'food'
  icon: string
  description: string
  cost: number
  effects: {
    moodBoost?: number
    specialAbility?: string
  }
}

export interface FruitItem {
  id: string
  name: string
  icon: string
  description: string
  value: number // Paw points when consumed/sold
  treeType: Tree['type']
  rarity: 'common' | 'rare' | 'legendary'
  effects?: {
    pointBonus?: number
    specialEffect?: string
  }
}

export interface CatInventory {
  [itemId: string]: {
    item: CatItem
    quantity: number
    lastUsed?: number
  }
}

export interface FruitInventory {
  [fruitId: string]: {
    fruit: FruitItem
    quantity: number
  }
}

// Available shop items
const SHOP_ITEMS: CatItem[] = [
  {
    id: 'yarn-ball',
    name: 'Yarn Ball',
    type: 'toy',
    icon: '🧶',
    description: 'A soft yarn ball that keeps your cat entertained longer',
    cost: 15,
    effects: { moodBoost: 2 }
  },
  {
    id: 'catnip',
    name: 'Premium Catnip',
    type: 'toy',
    icon: '🌿',
    description: 'High-quality catnip that makes your cat extra happy',
    cost: 20,
    effects: { moodBoost: 3, specialAbility: 'Extended happiness duration' }
  },
  {
    id: 'collar',
    name: 'Magical Collar',
    type: 'accessory',
    icon: '📿',
    description: 'A mystical collar that enhances forest blessing power',
    cost: 50,
    effects: { specialAbility: 'Forest blessings cost 5 fewer points' }
  },
  {
    id: 'scratching-post',
    name: 'Scratching Post',
    type: 'toy',
    icon: '🪵',
    description: 'Helps your cat stay active and maintain good mood',
    cost: 30,
    effects: { moodBoost: 1, specialAbility: 'Slower mood decay' }
  },
  {
    id: 'crown',
    name: 'Royal Crown',
    type: 'accessory',
    icon: '👑',
    description: 'Makes your cat feel like royalty',
    cost: 75,
    effects: { moodBoost: 4, specialAbility: 'Doubled blessing power' }
  },
  {
    id: 'fish-treats',
    name: 'Gourmet Fish Treats',
    type: 'food',
    icon: '🐟',
    description: 'Delicious treats that provide lasting satisfaction',
    cost: 12,
    effects: { moodBoost: 2, specialAbility: 'Feeding lasts longer' }
  }
]

// Fruit types that trees can produce
const FRUIT_TYPES: FruitItem[] = [
  // Oak fruits
  {
    id: 'acorn',
    name: 'Golden Acorn',
    icon: '🌰',
    description: 'A shiny acorn that grants extra points',
    value: 5,
    treeType: 'oak',
    rarity: 'common',
    effects: { pointBonus: 2 }
  },
  {
    id: 'oak-apple',
    name: 'Mystical Oak Apple',
    icon: '🍎',
    description: 'A rare fruit that boosts your cat\'s mood',
    value: 15,
    treeType: 'oak',
    rarity: 'rare',
    effects: { specialEffect: 'Cat happiness boost' }
  },
  // Pine fruits
  {
    id: 'pine-cone',
    name: 'Silver Pine Cone',
    icon: '🌰',
    description: 'A decorative cone with natural beauty',
    value: 3,
    treeType: 'pine',
    rarity: 'common'
  },
  {
    id: 'pine-nuts',
    name: 'Premium Pine Nuts',
    icon: '🥜',
    description: 'Nutritious nuts that provide sustained energy',
    value: 8,
    treeType: 'pine',
    rarity: 'rare'
  },
  // Cherry fruits
  {
    id: 'cherry',
    name: 'Sakura Cherry',
    icon: '🍒',
    description: 'Sweet cherries that bring joy',
    value: 6,
    treeType: 'cherry',
    rarity: 'common'
  },
  {
    id: 'crystal-cherry',
    name: 'Crystal Cherry',
    icon: '💎',
    description: 'A legendary crystallized cherry',
    value: 25,
    treeType: 'cherry',
    rarity: 'legendary',
    effects: { pointBonus: 10, specialEffect: 'Double task rewards for 1 hour' }
  },
  // Willow fruits
  {
    id: 'willow-bark',
    name: 'Healing Willow Bark',
    icon: '🌿',
    description: 'Medicinal bark with calming properties',
    value: 4,
    treeType: 'willow',
    rarity: 'common'
  },
  {
    id: 'wisdom-leaves',
    name: 'Leaves of Wisdom',
    icon: '🍃',
    description: 'Ancient leaves that enhance understanding',
    value: 12,
    treeType: 'willow',
    rarity: 'rare',
    effects: { specialEffect: 'Reveals hidden task completion bonuses' }
  },
  // Maple fruits
  {
    id: 'maple-syrup',
    name: 'Pure Maple Syrup',
    icon: '🍯',
    description: 'Sweet syrup that energizes',
    value: 7,
    treeType: 'maple',
    rarity: 'common'
  },
  {
    id: 'flame-leaf',
    name: 'Flame Maple Leaf',
    icon: '🔥',
    description: 'A leaf that burns with inner fire',
    value: 18,
    treeType: 'maple',
    rarity: 'rare',
    effects: { pointBonus: 5, specialEffect: 'Faster tree growth for all trees' }
  },
  // Birch fruits
  {
    id: 'birch-sap',
    name: 'Crystal Birch Sap',
    icon: '💧',
    description: 'Pure sap with refreshing qualities',
    value: 5,
    treeType: 'birch',
    rarity: 'common'
  },
  {
    id: 'moonbeam-bark',
    name: 'Moonbeam Bark',
    icon: '🌙',
    description: 'Bark that glows with moonlight',
    value: 20,
    treeType: 'birch',
    rarity: 'legendary',
    effects: { specialEffect: 'Cat can bless trees for free once' }
  },
  // Cypress fruits
  {
    id: 'cypress-oil',
    name: 'Sacred Cypress Oil',
    icon: '🫒',
    description: 'Aromatic oil with mystical properties',
    value: 9,
    treeType: 'cypress',
    rarity: 'common'
  },
  {
    id: 'eternal-branch',
    name: 'Eternal Branch',
    icon: '🌿',
    description: 'A branch that never withers',
    value: 30,
    treeType: 'cypress',
    rarity: 'legendary',
    effects: { specialEffect: 'Prevents one tree from ever stopping fruit production' }
  },
  // Bamboo fruits
  {
    id: 'bamboo-shoot',
    name: 'Lucky Bamboo Shoot',
    icon: '🎋',
    description: 'A tender shoot that brings good fortune',
    value: 4,
    treeType: 'bamboo',
    rarity: 'common'
  },
  {
    id: 'zen-bamboo',
    name: 'Zen Bamboo',
    icon: '☯️',
    description: 'Bamboo that radiates peace and balance',
    value: 16,
    treeType: 'bamboo',
    rarity: 'rare',
    effects: { specialEffect: 'Cat stays happy longer' }
  }
]

function App() {
  const [pawPoints, setPawPoints] = useKV("paw-points", 0)
  const [tasks, setTasks] = useKV<Task[]>("tasks", [])
  const [trees, setTrees] = useKV<Tree[]>("trees", [])
  const [catInventory, setCatInventory] = useKV<CatInventory>("cat-inventory", {})
  const [fruitInventory, setFruitInventory] = useKV<FruitInventory>("fruit-inventory", {})
  const [catState, setCatState] = useKV<CatState>("cat-state", {
    mood: 'neutral',
    lastFed: Date.now(),
    lastPlayed: Date.now(),
    blessingsGiven: 0,
    lastBlessing: 0
  })

  // Migrate existing trees to have position data and fruit system
  useEffect(() => {
    setTrees(currentTrees => 
      currentTrees.map((tree, index) => {
        let updatedTree = { ...tree }
        
        // Add position if missing
        if (!tree.position) {
          const seed = parseInt(tree.id) || index
          const x = (seed * 9301 + 49297) % 233280
          const groundLevels = [15, 18, 12, 20, 16, 14]
          const groundLevel = groundLevels[index % groundLevels.length]
          
          updatedTree.position = {
            x: (x / 233280) * 80 + 10, // 10-90% horizontal range
            y: groundLevel // Ground level from bottom
          }
        }
        
        // Initialize fruit system for existing trees
        if (updatedTree.lastHarvest === undefined) {
          updatedTree.lastHarvest = Date.now()
          updatedTree.fruitCount = 0
        }
        
        return updatedTree
      })
    )
  }, [])

  // Fruit production system - check for fruit generation
  useEffect(() => {
    const interval = setInterval(() => {
      setTrees(currentTrees => 
        currentTrees.map(tree => {
          const stage = getGrowthStage(tree)
          
          // Only mature and ancient trees produce fruits
          if (stage !== 'mature' && stage !== 'ancient') {
            return tree
          }
          
          const now = Date.now()
          const timeSinceLastHarvest = now - (tree.lastHarvest || now)
          const hoursPassesSinceHarvest = timeSinceLastHarvest / (1000 * 60 * 60)
          
          // Generate fruits based on time and tree stage
          let newFruitCount = tree.fruitCount || 0
          const maxFruits = stage === 'ancient' ? 3 : 2
          
          // Fruit generation rate: 1 fruit per 2 hours for mature, 1 per 1.5 hours for ancient
          const fruitGenerationHours = stage === 'ancient' ? 1.5 : 2
          const possibleNewFruits = Math.floor(hoursPassesSinceHarvest / fruitGenerationHours)
          
          if (possibleNewFruits > 0 && newFruitCount < maxFruits) {
            newFruitCount = Math.min(maxFruits, newFruitCount + possibleNewFruits)
            
            return {
              ...tree,
              fruitCount: newFruitCount,
              lastHarvest: tree.lastHarvest || now
            }
          }
          
          return tree
        })
      )
    }, 5 * 60 * 1000) // Check every 5 minutes
    
    return () => clearInterval(interval)
  }, [])

  // Helper function to get growth stage (moved here to be accessible in useEffect)
  const getGrowthStage = (tree: Tree) => {
    const daysSincePlanted = (Date.now() - tree.plantedAt) / (1000 * 60 * 60 * 24)
    
    // Cat blessings accelerate growth (each blessing reduces required time by 20%)
    const accelerationFactor = 1 - (tree.catBlessings * 0.2)
    
    const adjustedDays = daysSincePlanted / Math.max(accelerationFactor, 0.3)
    
    if (adjustedDays < 1) return 'seedling'
    if (adjustedDays < 3) return 'young'
    if (adjustedDays < 7) return 'mature'
    return 'ancient'
  }

  const completeTask = (taskId: string) => {
    setTasks(currentTasks => {
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      )
      
      // Check if completing this task should auto-complete parent
      const completedTask = updatedTasks.find(t => t.id === taskId)
      if (completedTask?.parentId) {
        const siblings = updatedTasks.filter(t => t.parentId === completedTask.parentId)
        const allSiblingsCompleted = siblings.every(t => t.completed)
        
        if (allSiblingsCompleted) {
          // Auto-complete parent task
          return updatedTasks.map(task =>
            task.id === completedTask.parentId ? { ...task, completed: true } : task
          )
        }
      }
      
      return updatedTasks
    })
    
    // Award points for completion
    setPawPoints(current => current + 10)
  }

  const uncompleteTask = (taskId: string) => {
    setTasks(currentTasks => {
      const updatedTasks = currentTasks.map(task => 
        task.id === taskId ? { ...task, completed: false } : task
      )
      
      // If uncompleting a parent task, uncomplete all its subtasks
      const uncomplotedTask = updatedTasks.find(t => t.id === taskId)
      if (uncomplotedTask && !uncomplotedTask.parentId) {
        const subtasks = updatedTasks.filter(t => t.parentId === taskId)
        return updatedTasks.map(task => 
          subtasks.some(st => st.id === task.id) 
            ? { ...task, completed: false } 
            : task
        )
      }
      
      // If uncompleting a subtask, uncomplete the parent task too
      if (uncomplotedTask?.parentId) {
        return updatedTasks.map(task =>
          task.id === uncomplotedTask.parentId ? { ...task, completed: false } : task
        )
      }
      
      return updatedTasks
    })
  }

  const addTask = (text: string, parentId?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text,
      completed: false,
      createdAt: Date.now(),
      parentId
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
        position: { x: randomX, y: randomY },
        lastHarvest: Date.now(),
        fruitCount: 0
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
    // Check for magical collar discount
    const hasCollar = catInventory['collar']?.quantity > 0
    const cost = hasCollar ? 20 : 25
    
    if (pawPoints >= cost && catState.mood === 'happy') {
      if (spendPoints(cost)) {
        // Check for crown bonus (doubled power)
        const hasCrown = catInventory['crown']?.quantity > 0
        const blessingPower = hasCrown ? 2 : 1
        
        // Apply blessing to all trees (faster growth)
        setTrees(currentTrees => 
          currentTrees.map(tree => ({
            ...tree,
            catBlessings: tree.catBlessings + blessingPower
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

  const buyItem = (itemId: string) => {
    const item = SHOP_ITEMS.find(i => i.id === itemId)
    if (!item) return false
    
    if (spendPoints(item.cost)) {
      setCatInventory(current => ({
        ...current,
        [itemId]: {
          item,
          quantity: (current[itemId]?.quantity || 0) + 1,
          lastUsed: current[itemId]?.lastUsed
        }
      }))
      return true
    }
    return false
  }

  const useItem = (itemId: string) => {
    const inventoryItem = catInventory[itemId]
    if (!inventoryItem || inventoryItem.quantity <= 0) return false
    
    // Apply item effects
    setCatState(current => ({
      ...current,
      mood: 'happy', // Items make cat happy
      lastPlayed: Date.now() // Reset interaction timer
    }))
    
    // Consume the item (except accessories which are permanent)
    if (inventoryItem.item.type !== 'accessory') {
      setCatInventory(current => ({
        ...current,
        [itemId]: {
          ...inventoryItem,
          quantity: inventoryItem.quantity - 1,
          lastUsed: Date.now()
        }
      }))
    } else {
      // For accessories, just update last used time
      setCatInventory(current => ({
        ...current,
        [itemId]: {
          ...inventoryItem,
          lastUsed: Date.now()
        }
      }))
    }
    
    return true
  }

  const harvestFruit = (treeId: string) => {
    const tree = trees.find(t => t.id === treeId)
    if (!tree || !tree.fruitCount || tree.fruitCount <= 0) return false
    
    const stage = getGrowthStage(tree)
    if (stage !== 'mature' && stage !== 'ancient') return false
    
    // Determine fruit type based on tree and rarity
    const availableFruits = FRUIT_TYPES.filter(f => f.treeType === tree.type)
    if (availableFruits.length === 0) return false
    
    const harvestedFruits: FruitItem[] = []
    
    // Harvest each fruit with rarity chances
    for (let i = 0; i < tree.fruitCount; i++) {
      const rareChance = tree.catBlessings > 0 ? 0.25 : 0.15 // Cat blessings increase rare chance
      const legendaryChance = stage === 'ancient' ? 0.05 : 0.02
      const randomValue = Math.random()
      
      let selectedFruit: FruitItem
      
      if (randomValue < legendaryChance) {
        // Legendary fruit
        const legendaryFruits = availableFruits.filter(f => f.rarity === 'legendary')
        selectedFruit = legendaryFruits[Math.floor(Math.random() * legendaryFruits.length)] || availableFruits[0]
      } else if (randomValue < rareChance) {
        // Rare fruit
        const rareFruits = availableFruits.filter(f => f.rarity === 'rare')
        selectedFruit = rareFruits[Math.floor(Math.random() * rareFruits.length)] || availableFruits[0]
      } else {
        // Common fruit
        const commonFruits = availableFruits.filter(f => f.rarity === 'common')
        selectedFruit = commonFruits[Math.floor(Math.random() * commonFruits.length)] || availableFruits[0]
      }
      
      harvestedFruits.push(selectedFruit)
    }
    
    // Add fruits to inventory
    setFruitInventory(current => {
      const updated = { ...current }
      harvestedFruits.forEach(fruit => {
        if (updated[fruit.id]) {
          updated[fruit.id].quantity += 1
        } else {
          updated[fruit.id] = { fruit, quantity: 1 }
        }
      })
      return updated
    })
    
    // Reset tree fruit count and harvest time
    setTrees(currentTrees => 
      currentTrees.map(t => 
        t.id === treeId 
          ? { ...t, fruitCount: 0, lastHarvest: Date.now() }
          : t
      )
    )
    
    // Award base points for harvesting
    const totalValue = harvestedFruits.reduce((sum, fruit) => sum + fruit.value, 0)
    setPawPoints(current => current + totalValue)
    
    return { fruits: harvestedFruits, totalValue }
  }

  const consumeFruit = (fruitId: string) => {
    const inventoryItem = fruitInventory[fruitId]
    if (!inventoryItem || inventoryItem.quantity <= 0) return false
    
    const fruit = inventoryItem.fruit
    
    // Apply fruit effects
    if (fruit.effects?.pointBonus) {
      setPawPoints(current => current + fruit.effects.pointBonus)
    }
    
    if (fruit.effects?.specialEffect) {
      // Apply special effects (simplified for now)
      setCatState(current => ({ ...current, mood: 'happy' }))
    }
    
    // Consume the fruit
    setFruitInventory(current => ({
      ...current,
      [fruitId]: {
        ...inventoryItem,
        quantity: inventoryItem.quantity - 1
      }
    }))
    
    // Award base fruit value
    setPawPoints(current => current + fruit.value)
    
    return true
  }

  const getTreeCost = (type: Tree['type']) => {
    const costs = { 
      oak: 25, 
      pine: 20, 
      cherry: 35, 
      willow: 30,
      maple: 40,
      birch: 28,
      cypress: 45,
      bamboo: 22
    }
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
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="tasks" className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-700 data-[state=active]:border-blue-300">
              <CheckSquare className="w-4 h-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="cat" className="flex items-center gap-2 data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700 data-[state=active]:border-yellow-300">
              <Heart className="w-4 h-4" />
              Cat Care
            </TabsTrigger>
            <TabsTrigger value="shop" className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-700 data-[state=active]:border-red-300">
              <ShoppingBag className="w-4 h-4" />
              Shop
            </TabsTrigger>
            <TabsTrigger value="forest" className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:border-green-300">
              <TreePine className="w-4 h-4" />
              Forest
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <TaskManager 
              tasks={tasks}
              onAddTask={addTask}
              onCompleteTask={completeTask}
              onUncompleteTask={uncompleteTask}
            />
          </TabsContent>

          <TabsContent value="cat">
            <CatAvatar 
              catState={catState}
              pawPoints={pawPoints}
              catInventory={catInventory}
              onCareCat={careCat}
              onBlessForest={blessForest}
              onUseItem={useItem}
              trees={trees}
            />
          </TabsContent>

          <TabsContent value="shop">
            <CatShop 
              pawPoints={pawPoints}
              catInventory={catInventory}
              onBuyItem={buyItem}
              shopItems={SHOP_ITEMS}
            />
          </TabsContent>

          <TabsContent value="forest">
            <Forest 
              trees={trees}
              pawPoints={pawPoints}
              fruitInventory={fruitInventory}
              onPlantTree={plantTree}
              onUpdateTreePosition={updateTreePosition}
              onHarvestFruit={harvestFruit}
              onConsumeFruit={consumeFruit}
              getTreeCost={getTreeCost}
              getGrowthStage={getGrowthStage}
            />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  )
}

export default App