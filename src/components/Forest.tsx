import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TreePine, Sparkle, Hand, Cloud, Sun, CloudRain, CloudSnow, Fruit, Package } from '@phosphor-icons/react'
import { Tree, FruitInventory, FruitItem } from '@/App'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ForestProps {
  trees: Tree[]
  pawPoints: number
  fruitInventory: FruitInventory
  onPlantTree: (type: Tree['type']) => boolean
  onUpdateTreePosition: (treeId: string, x: number, y: number) => void
  onHarvestFruit: (treeId: string) => { fruits: FruitItem[], totalValue: number } | false
  onConsumeFruit: (fruitId: string) => boolean
  getTreeCost: (type: Tree['type']) => number
  getGrowthStage: (tree: Tree) => 'seedling' | 'young' | 'mature' | 'ancient'
}

type WeatherType = 'sunny' | 'cloudy' | 'rainy' | 'snowy'

const treeTypes = {
  oak: { emoji: '🌳', name: 'Oak Tree', description: 'Strong and enduring' },
  pine: { emoji: '🌲', name: 'Pine Tree', description: 'Evergreen and resilient' },
  cherry: { emoji: '🌸', name: 'Cherry Tree', description: 'Beautiful and delicate' },
  willow: { emoji: '🌿', name: 'Willow Tree', description: 'Graceful and flexible' },
  maple: { emoji: '🍁', name: 'Maple Tree', description: 'Vibrant autumn beauty' },
  birch: { emoji: '🌳', name: 'Birch Tree', description: 'Elegant white bark' },
  cypress: { emoji: '🌲', name: 'Cypress Tree', description: 'Tall and majestic' },
  bamboo: { emoji: '🎋', name: 'Bamboo Grove', description: 'Fast-growing and zen' }
}

const weatherEffects = {
  sunny: {
    name: 'Sunny',
    icon: Sun,
    bgGradient: 'from-sky-200 via-sky-100 to-green-50',
    description: '☀️ Perfect weather for growth!'
  },
  cloudy: {
    name: 'Cloudy',
    icon: Cloud, 
    bgGradient: 'from-gray-200 via-gray-100 to-green-100',
    description: '☁️ Peaceful and calm'
  },
  rainy: {
    name: 'Rainy',
    icon: CloudRain,
    bgGradient: 'from-slate-300 via-slate-200 to-green-200',
    description: '🌧️ Nourishing rain helps trees grow!'
  },
  snowy: {
    name: 'Snowy', 
    icon: CloudSnow,
    bgGradient: 'from-slate-100 via-white to-green-50',
    description: '❄️ Quiet winter slows growth'
  }
}

export default function Forest({ 
  trees, 
  pawPoints, 
  fruitInventory, 
  onPlantTree, 
  onUpdateTreePosition, 
  onHarvestFruit, 
  onConsumeFruit, 
  getTreeCost,
  getGrowthStage
}: ForestProps) {
  const [selectedType, setSelectedType] = useState<Tree['type'] | null>(null)
  const [draggedTree, setDraggedTree] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [currentWeather, setCurrentWeather] = useState<WeatherType>('sunny')
  const forestRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update tree growth over time
    const interval = setInterval(() => {
      // This would trigger a re-render to show growth progress
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  // Weather cycling effect
  useEffect(() => {
    const weatherCycle = () => {
      const weathers: WeatherType[] = ['sunny', 'cloudy', 'rainy', 'snowy']
      const randomWeather = weathers[Math.floor(Math.random() * weathers.length)]
      
      // Weight sunny weather more heavily for better game experience
      const weightedWeather = Math.random() < 0.4 ? 'sunny' : randomWeather
      setCurrentWeather(weightedWeather)
    }

    // Change weather every 2-5 minutes
    const weatherInterval = setInterval(weatherCycle, (2 + Math.random() * 3) * 60 * 1000)
    
    // Set initial weather
    weatherCycle()

    return () => clearInterval(weatherInterval)
  }, [])

  // Weather particle effects components
  const RainDrops = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-6 bg-blue-400 opacity-60"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: '-10px',
            opacity: 0.4 + Math.random() * 0.4
          }}
          animate={{ 
            y: '400px',
            opacity: 0
          }}
          transition={{ 
            duration: 1 + Math.random() * 1,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'linear'
          }}
          style={{
            left: Math.random() * 100 + '%',
            transform: 'rotate(10deg)'
          }}
        />
      ))}
    </div>
  )

  const SnowFlakes = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-white opacity-80 select-none"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: '-20px',
            rotate: 0
          }}
          animate={{ 
            y: '400px',
            x: `${Math.random() * 100}%`,
            rotate: 360,
            opacity: [0.8, 0.3, 0.8]
          }}
          transition={{ 
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: 'easeInOut'
          }}
          style={{
            fontSize: Math.random() * 8 + 8 + 'px'
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  )

  const MovingClouds = () => (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute top-4 w-20 h-10 bg-white rounded-full opacity-50 shadow-sm"
        initial={{ x: '-100px' }}
        animate={{ x: '420px' }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: 'linear' 
        }}
      />
      <motion.div
        className="absolute top-12 w-16 h-8 bg-white rounded-full opacity-40 shadow-sm"
        initial={{ x: '-80px' }}
        animate={{ x: '400px' }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: 'linear',
          delay: 5
        }}
      />
      <motion.div
        className="absolute top-8 w-14 h-7 bg-white rounded-full opacity-45 shadow-sm"
        initial={{ x: '-70px' }}
        animate={{ x: '390px' }}
        transition={{ 
          duration: 20, 
          repeat: Infinity, 
          ease: 'linear',
          delay: 10
        }}
      />
    </div>
  )

  const handlePlantTree = (type: Tree['type']) => {
    const cost = getTreeCost(type)
    if (pawPoints < cost) {
      toast.error(`Not enough Paw Points! You need ${cost} points to plant a ${treeTypes[type].name}.`)
      return
    }
    
    const success = onPlantTree(type)
    if (success) {
      toast.success(`🌱 You planted a ${treeTypes[type].name}! It will grow over time.`)
      setSelectedType(null)
    }
  }

  const handleHarvestFruit = (treeId: string) => {
    const result = onHarvestFruit(treeId)
    if (result) {
      const { fruits, totalValue } = result
      const fruitNames = fruits.map(f => f.name).join(', ')
      toast.success(`🍎 Harvested: ${fruitNames}! (+${totalValue} Paw Points)`)
    } else {
      toast.error('No fruits to harvest on this tree!')
    }
  }

  const getTreeDisplay = (tree: Tree) => {
    const stage = getGrowthStage(tree)
    const baseEmoji = treeTypes[tree.type].emoji
    const isBlessed = tree.catBlessings > 0
    const hasFruit = tree.fruitCount && tree.fruitCount > 0
    
    let display = ''
    
    switch (stage) {
      case 'seedling': 
        display = isBlessed ? '🌱✨' : '🌱'
        break
      case 'young': 
        if (tree.type === 'cherry') display = isBlessed ? '🌸✨' : '🌸'
        else if (tree.type === 'maple') display = isBlessed ? '🍂✨' : '🍂'
        else if (tree.type === 'bamboo') display = isBlessed ? '🎍✨' : '🎍'
        else display = isBlessed ? '🌿✨' : '🌿'
        break
      case 'mature': 
        display = isBlessed ? baseEmoji + '✨' : baseEmoji
        break
      case 'ancient': 
        display = isBlessed ? baseEmoji + '🌟' : baseEmoji + '✨'
        break
      default: 
        display = baseEmoji
    }
    
    // Add fruit indicators for mature/ancient trees
    if (hasFruit && (stage === 'mature' || stage === 'ancient')) {
      display += '🍎'.repeat(Math.min(tree.fruitCount || 0, 3))
    }
    
    return display
  }

  const getGrowthDescription = (tree: Tree) => {
    const stage = getGrowthStage(tree)
    const daysSincePlanted = Math.floor((Date.now() - tree.plantedAt) / (1000 * 60 * 60 * 24))
    const blessingsText = tree.catBlessings > 0 ? ` (${tree.catBlessings} cat blessing${tree.catBlessings > 1 ? 's' : ''})` : ''
    const fruitText = tree.fruitCount && tree.fruitCount > 0 ? ` - ${tree.fruitCount} fruit${tree.fruitCount > 1 ? 's' : ''} ready!` : ''
    
    switch (stage) {
      case 'seedling': return `Just sprouted ${daysSincePlanted === 0 ? 'today' : `${daysSincePlanted} day(s) ago`}${blessingsText}`
      case 'young': return `Growing strong (${daysSincePlanted} days old)${blessingsText}`
      case 'mature': return `Fully grown (${daysSincePlanted} days old)${blessingsText}${fruitText}`
      case 'ancient': return `Ancient and wise (${daysSincePlanted} days old)${blessingsText}${fruitText}`
      default: return 'Growing...'
    }
  }

  // Generate default position for trees without stored position
  const getDefaultPosition = (index: number) => {
    const seed = parseInt(trees[index]?.id) || index
    const x = (seed * 9301 + 49297) % 233280
    const groundLevels = [15, 18, 12, 20, 16, 14]
    const groundLevel = groundLevels[index % groundLevels.length]
    
    return {
      x: (x / 233280) * 80 + 10, // 10-90% horizontal range
      y: groundLevel // Ground level from bottom
    }
  }

  const handleMouseDown = (e: React.MouseEvent, treeId: string) => {
    e.preventDefault()
    setDraggedTree(treeId)
    
    const rect = e.currentTarget.getBoundingClientRect()
    const forestRect = forestRef.current?.getBoundingClientRect()
    
    if (forestRect) {
      const offsetX = e.clientX - rect.left - rect.width / 2
      const offsetY = e.clientY - rect.top - rect.height / 2
      setDragOffset({ x: offsetX, y: offsetY })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedTree && forestRef.current) {
        const forestRect = forestRef.current.getBoundingClientRect()
        const x = ((e.clientX - dragOffset.x - forestRect.left) / forestRect.width) * 100
        const y = ((forestRect.bottom - e.clientY + dragOffset.y) / forestRect.height) * 100
        
        // Constrain to forest bounds
        const constrainedX = Math.max(5, Math.min(95, x))
        const constrainedY = Math.max(5, Math.min(35, y))
        
        onUpdateTreePosition(draggedTree, constrainedX, constrainedY)
      }
    }

    const handleMouseUp = () => {
      if (draggedTree) {
        setDraggedTree(null)
        setDragOffset({ x: 0, y: 0 })
        toast.success('🌲 Tree repositioned!')
      }
    }

    if (draggedTree) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [draggedTree, dragOffset, onUpdateTreePosition])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-primary" />
            Plant New Trees
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {Object.entries(treeTypes).map(([type, info]) => {
              const cost = getTreeCost(type as Tree['type'])
              const canAfford = pawPoints >= cost
              
              return (
                <motion.div
                  key={type}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all ${
                      selectedType === type ? 'ring-2 ring-primary' : ''
                    } ${canAfford ? 'hover:shadow-md' : 'opacity-60'}`}
                    onClick={() => canAfford && setSelectedType(type as Tree['type'])}
                  >
                    <CardContent className="p-4 text-center space-y-2">
                      <div className="text-3xl">{info.emoji}</div>
                      <div className="text-sm font-medium">{info.name}</div>
                      <div className="text-xs text-muted-foreground">{info.description}</div>
                      <Badge variant={canAfford ? "secondary" : "outline"} className="text-xs">
                        {cost} 🐾
                      </Badge>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>
          
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-center"
            >
              <Button 
                onClick={() => handlePlantTree(selectedType)}
                className="w-full max-w-md"
              >
                Plant {treeTypes[selectedType].name} for {getTreeCost(selectedType)} 🐾
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Your Forest
              {trees.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  <Hand className="w-3 h-3 mr-1" />
                  Drag to move
                </Badge>
              )}
            </CardTitle>
            <Badge variant="secondary" className="flex items-center gap-2">
              {(() => {
                const WeatherIcon = weatherEffects[currentWeather].icon
                return <WeatherIcon className="w-4 h-4" />
              })()}
              {weatherEffects[currentWeather].name}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {weatherEffects[currentWeather].description}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Forest Scene - 2D Side View - Always visible */}
            <div 
              ref={forestRef}
              className={`relative min-h-96 bg-gradient-to-b ${weatherEffects[currentWeather].bgGradient} rounded-lg overflow-hidden border-2 border-border cursor-crosshair transition-all duration-1000`}
            >
                {/* Background mountains/hills */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Far mountains */}
                  <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-200 to-sky-100 opacity-40"
                       style={{
                         clipPath: 'polygon(0% 100%, 20% 60%, 40% 70%, 60% 50%, 80% 65%, 100% 55%, 100% 100%)'
                       }}></div>
                  
                  {/* Middle hills */}
                  <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-green-200 to-green-100 opacity-60"
                       style={{
                         clipPath: 'polygon(0% 100%, 15% 70%, 35% 80%, 55% 65%, 75% 75%, 90% 60%, 100% 70%, 100% 100%)'
                       }}></div>
                </div>
                
                {/* Layered ground levels */}
                <div className="absolute inset-0 pointer-events-none">
                  {/* Multiple ground layers for varied terrain */}
                  <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-b from-green-300 to-green-400" 
                       style={{ bottom: '18%' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-green-300 to-green-500" 
                       style={{ bottom: '12%' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-b from-green-400 to-green-600" 
                       style={{ bottom: '16%' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-green-300 to-green-500" 
                       style={{ bottom: '10%' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-b from-green-400 to-green-600" 
                       style={{ bottom: '14%' }}></div>
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-b from-green-400 to-green-600"></div>
                </div>
                
                {/* Weather Effects */}
                {currentWeather === 'rainy' && <RainDrops />}
                {currentWeather === 'snowy' && <SnowFlakes />}
                {(currentWeather === 'cloudy' || currentWeather === 'rainy') && <MovingClouds />}
                
                {/* Sun - conditional visibility based on weather */}
                {(currentWeather === 'sunny' || currentWeather === 'cloudy') && (
                  <motion.div 
                    className={`absolute top-6 right-8 w-12 h-12 bg-gradient-radial from-yellow-300 to-yellow-400 rounded-full shadow-lg shadow-yellow-200/50 pointer-events-none transition-opacity duration-1000 ${
                      currentWeather === 'cloudy' ? 'opacity-40' : 'opacity-80'
                    }`}
                    animate={{ 
                      scale: currentWeather === 'sunny' ? [1, 1.05, 1] : 1,
                      opacity: currentWeather === 'sunny' ? [0.8, 1, 0.8] : (currentWeather === 'cloudy' ? 0.4 : 0.8)
                    }}
                    transition={{ 
                      duration: 4, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                )}
                
                {/* Static clouds for sunny weather */}
                {currentWeather === 'sunny' && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-8 left-12 w-16 h-8 bg-white rounded-full opacity-70 shadow-sm"></div>
                    <div className="absolute top-12 left-32 w-12 h-6 bg-white rounded-full opacity-60 shadow-sm"></div>
                    <div className="absolute top-6 left-1/2 w-14 h-7 bg-white rounded-full opacity-65 shadow-sm"></div>
                  </div>
                )}
                
                {/* Walking Cat - Always present, reacts to weather */}
                <motion.div
                  className="absolute text-xl pointer-events-none select-none"
                  initial={{ x: -60 }}
                  animate={{ 
                    x: currentWeather === 'rainy' || currentWeather === 'snowy' 
                      ? [0, 100, 200, 100, 0]  // Slower movement in bad weather
                      : [0, 200, 400, 200, 0]  // Normal movement
                  }}
                  transition={{ 
                    duration: currentWeather === 'rainy' || currentWeather === 'snowy' ? 40 : 30, 
                    repeat: Infinity, 
                    ease: "linear",
                    times: [0, 0.25, 0.5, 0.75, 1]
                  }}
                  style={{ bottom: '8%', zIndex: 20 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: currentWeather === 'snowy' ? [0, -3, 3, 0] : [0, -2, 2, 0]
                    }}
                    transition={{ 
                      duration: currentWeather === 'snowy' ? 2 : 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    {currentWeather === 'rainy' ? '🐱☔' : 
                     currentWeather === 'snowy' ? '🐱❄️' : 
                     '🐱'}
                  </motion.div>
                </motion.div>
                
                {/* Trees positioned on ground levels - DRAGGABLE */}
                {trees.map((tree, index) => {
                  const position = tree.position || getDefaultPosition(index)
                  const stage = getGrowthStage(tree)
                  const isDragging = draggedTree === tree.id
                  
                  // Adjust size based on growth stage
                  const sizeMultiplier = {
                    seedling: 0.5,
                    young: 0.7,
                    mature: 0.9,
                    ancient: 1.2
                  }[stage]
                  
                  return (
                    <motion.div
                      key={tree.id}
                      initial={{ scale: 0, y: 20 }}
                      animate={{ 
                        scale: isDragging ? 1.1 : 1, 
                        y: 0,
                        zIndex: isDragging ? 50 : 10 + index
                      }}
                      transition={{ duration: isDragging ? 0.1 : 0.8, delay: isDragging ? 0 : index * 0.15 }}
                      className={`absolute transform -translate-x-1/2 cursor-grab active:cursor-grabbing group select-none ${
                        isDragging ? 'z-50 shadow-2xl' : ''
                      }`}
                      style={{
                        left: `${position.x}%`,
                        bottom: `${position.y}%`,
                        fontSize: `${1.2 + sizeMultiplier * 1.3}rem`,
                        filter: tree.catBlessings > 0 
                          ? 'drop-shadow(0 0 12px rgba(147, 51, 234, 0.6)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' 
                          : currentWeather === 'snowy' 
                            ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15)) drop-shadow(0 0 8px rgba(255,255,255,0.8))'
                            : 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, tree.id)}
                      title={`${treeTypes[tree.type].name} - ${getGrowthDescription(tree)}`}
                    >
                      <div className="relative">
                        {/* Tree */}
                        <div className={`transform transition-all duration-200 ${
                          isDragging ? 'scale-110 rotate-2' : 'hover:scale-105'
                        }`}>
                          {getTreeDisplay(tree)}
                        </div>
                        
                        {/* Drag indicator */}
                        {isDragging && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded whitespace-nowrap"
                          >
                            🫴 Moving tree
                          </motion.div>
                        )}
                        
                        {/* Hover tooltip */}
                        {!isDragging && (
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-card border rounded-lg shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50 max-w-48">
                            <div className="font-medium text-center">{treeTypes[tree.type].name}</div>
                            <div className="text-muted-foreground text-xs text-center">
                              {getGrowthDescription(tree)}
                            </div>
                            {tree.catBlessings > 0 && (
                              <div className="text-purple-600 text-xs text-center mt-1">
                                ✨ Cat blessed ✨
                              </div>
                            )}
                            {tree.fruitCount && tree.fruitCount > 0 && (stage === 'mature' || stage === 'ancient') && (
                              <div className="text-center mt-1 border-t pt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleHarvestFruit(tree.id)
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition-colors"
                                >
                                  <Fruit className="w-3 h-3 inline mr-1" />
                                  Harvest ({tree.fruitCount})
                                </button>
                              </div>
                            )}
                            <div className="text-muted-foreground text-xs text-center mt-1 border-t pt-1">
                              <Hand className="w-3 h-3 inline mr-1" />
                              Click and drag to move
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
                
                {/* Forest ambiance elements */}
                {trees.length > 2 && (
                  <>
                    {/* Flying birds */}
                    <motion.div
                      className="absolute text-sm pointer-events-none"
                      initial={{ x: -40, y: 60 }}
                      animate={{ x: 400, y: 40 }}
                      transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
                      style={{ top: '15%' }}
                    >
                      🕊️
                    </motion.div>
                    
                    {/* Small bird in trees */}
                    {trees.length > 4 && (
                      <motion.div
                        className="absolute text-xs pointer-events-none"
                        animate={{ x: [0, 5, -3, 2, 0], y: [0, -2, 1, -1, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        style={{ top: '35%', left: '70%', zIndex: 5 }}
                      >
                        🐦
                      </motion.div>
                    )}
                    
                    {/* Butterflies near flowers */}
                    <motion.div
                      className="absolute text-xs pointer-events-none"
                      initial={{ x: 0, y: 0 }}
                      animate={{ x: [0, 15, -8, 12, 0], y: [0, -8, 3, -4, 0] }}
                      transition={{ duration: 10, repeat: Infinity }}
                      style={{ bottom: '25%', left: '25%', zIndex: 5 }}
                    >
                      🦋
                    </motion.div>
                  </>
                )}
                
                {/* Mystical elements for ancient trees */}
                {trees.some(tree => getGrowthStage(tree) === 'ancient') && (
                  <>
                    <motion.div
                      className="absolute text-sm opacity-70 pointer-events-none"
                      animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ top: '20%', left: '15%', zIndex: 5 }}
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      className="absolute text-xs opacity-60 pointer-events-none"
                      animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                      style={{ top: '30%', right: '20%', zIndex: 5 }}
                    >
                      🌟
                    </motion.div>
                  </>
                )}
                
                {/* Grass and small plants at ground level */}
                {trees.length > 1 && (
                  <div className="absolute bottom-0 left-0 w-full h-4 flex items-end justify-around opacity-60 pointer-events-none">
                    <span className="text-xs">🌱</span>
                    <span className="text-xs">🍄</span>
                    <span className="text-xs">🌿</span>
                    <span className="text-xs">🌸</span>
                    <span className="text-xs">🌱</span>
                    <span className="text-xs">🌿</span>
                  </div>
                )}
              </div>
              
              {/* Forest description */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-center text-muted-foreground">
                  {trees.length === 0 ? (
                    <>
                      <Sparkle className="w-5 h-5 mx-auto mb-2 text-accent" />
                      <p>🐱 Your cat friend is exploring the empty forest! Plant your first tree above.</p>
                      <p className="text-sm mt-1">Complete tasks to earn Paw Points for planting.</p>
                    </>
                  ) : (
                    <>
                      🌟 Your forest has <strong>{trees.length}</strong> tree{trees.length !== 1 ? 's' : ''} growing on different ground levels! 
                      <div className="mt-1">Trees grow and change over time as you continue your journey.</div>
                      {trees.length > 0 && (
                        <div className="mt-1 text-xs">
                          💡 <Hand className="w-3 h-3 inline mx-1" />
                          Click and drag trees to rearrange your forest layout
                        </div>
                      )}
                      
                      {trees.some(tree => getGrowthStage(tree) === 'mature' || getGrowthStage(tree) === 'ancient') && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          🍎 Mature trees produce special fruits that you can harvest for extra rewards!
                        </div>
                      )}
                      
                      {trees.some(tree => tree.catBlessings > 0) && (
                        <div className="mt-2 text-xs text-purple-600 font-medium">
                          ✨ Some trees have been blessed by your cat and are growing faster! ✨
                        </div>
                      )}
                      
                      {trees.length >= 5 && (
                        <div className="mt-2 text-xs text-green-600 font-medium">
                          🌲 Your forest is becoming a thriving ecosystem with wildlife! 🦋
                        </div>
                      )}
                      
                      {/* Weather effects description */}
                      {currentWeather === 'rainy' && (
                        <div className="mt-2 text-xs text-blue-600 font-medium">
                          🌧️ The rain is nourishing your trees - they grow faster in this weather!
                        </div>
                      )}
                      {currentWeather === 'snowy' && (
                        <div className="mt-2 text-xs text-slate-600 font-medium">
                          ❄️ Winter snow slows growth, but creates a peaceful, magical atmosphere.
                        </div>
                      )}
                      {currentWeather === 'cloudy' && (
                        <div className="mt-2 text-xs text-gray-600 font-medium">
                          ☁️ The gentle clouds provide perfect growing conditions.
                        </div>
                      )}
                    </>
                  )}
                  <div className="mt-2 text-xs text-accent font-medium">
                    🐾 Your cat friend loves wandering through the forest!
                  </div>
                </div>
              </div>
            </div>
        </CardContent>
      </Card>

      {/* Fruit Inventory */}
      {Object.keys(fruitInventory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-accent" />
              Fruit Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(fruitInventory)
                .filter(([_, item]) => item.quantity > 0)
                .map(([fruitId, item]) => (
                  <motion.div
                    key={fruitId}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="cursor-pointer hover:shadow-md transition-all">
                      <CardContent className="p-4 text-center space-y-2">
                        <div className="text-2xl">{item.fruit.icon}</div>
                        <div className="text-sm font-medium">{item.fruit.name}</div>
                        <div className="text-xs text-muted-foreground">{item.fruit.description}</div>
                        <div className="flex items-center justify-center gap-2">
                          <Badge 
                            variant={item.fruit.rarity === 'legendary' ? 'default' : 
                                   item.fruit.rarity === 'rare' ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {item.fruit.rarity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {item.quantity}x
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs"
                          onClick={() => {
                            const success = onConsumeFruit(fruitId)
                            if (success) {
                              toast.success(`🍎 Enjoyed ${item.fruit.name}! (+${item.fruit.value} Paw Points)`)
                            }
                          }}
                        >
                          Consume (+{item.fruit.value} 🐾)
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}