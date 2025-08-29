import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TreePine, Sparkle, Hand } from '@phosphor-icons/react'
import { Tree } from '@/App'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ForestProps {
  trees: Tree[]
  pawPoints: number
  onPlantTree: (type: Tree['type']) => boolean
  onUpdateTreePosition: (treeId: string, x: number, y: number) => void
  getTreeCost: (type: Tree['type']) => number
}

const treeTypes = {
  oak: { emoji: '🌳', name: 'Oak Tree', description: 'Strong and enduring' },
  pine: { emoji: '🌲', name: 'Pine Tree', description: 'Evergreen and resilient' },
  cherry: { emoji: '🌸', name: 'Cherry Tree', description: 'Beautiful and delicate' },
  willow: { emoji: '🌿', name: 'Willow Tree', description: 'Graceful and flexible' }
}

export default function Forest({ trees, pawPoints, onPlantTree, onUpdateTreePosition, getTreeCost }: ForestProps) {
  const [selectedType, setSelectedType] = useState<Tree['type'] | null>(null)
  const [draggedTree, setDraggedTree] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const forestRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Update tree growth over time
    const interval = setInterval(() => {
      // This would trigger a re-render to show growth progress
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

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

  const getGrowthStage = (tree: Tree) => {
    const daysSincePlanted = (Date.now() - tree.plantedAt) / (1000 * 60 * 60 * 24)
    
    // Cat blessings accelerate growth (each blessing reduces required time by 20%)
    const accelerationFactor = 1 - (tree.catBlessings * 0.2)
    const adjustedDays = daysSincePlanted / Math.max(accelerationFactor, 0.3) // Minimum 30% of original time
    
    if (adjustedDays < 1) return 'seedling'
    if (adjustedDays < 3) return 'young'
    if (adjustedDays < 7) return 'mature'
    return 'ancient'
  }

  const getTreeDisplay = (tree: Tree) => {
    const stage = getGrowthStage(tree)
    const baseEmoji = treeTypes[tree.type].emoji
    const isBlessed = tree.catBlessings > 0
    
    switch (stage) {
      case 'seedling': return isBlessed ? '🌱✨' : '🌱'
      case 'young': return isBlessed ? (tree.type === 'cherry' ? '🌸✨' : '🌿✨') : (tree.type === 'cherry' ? '🌸' : '🌿')
      case 'mature': return isBlessed ? baseEmoji + '✨' : baseEmoji
      case 'ancient': return isBlessed ? baseEmoji + '🌟' : baseEmoji + '✨'
      default: return baseEmoji
    }
  }

  const getGrowthDescription = (tree: Tree) => {
    const stage = getGrowthStage(tree)
    const daysSincePlanted = Math.floor((Date.now() - tree.plantedAt) / (1000 * 60 * 60 * 24))
    const blessingsText = tree.catBlessings > 0 ? ` (${tree.catBlessings} cat blessing${tree.catBlessings > 1 ? 's' : ''})` : ''
    
    switch (stage) {
      case 'seedling': return `Just sprouted ${daysSincePlanted === 0 ? 'today' : `${daysSincePlanted} day(s) ago`}${blessingsText}`
      case 'young': return `Growing strong (${daysSincePlanted} days old)${blessingsText}`
      case 'mature': return `Fully grown (${daysSincePlanted} days old)${blessingsText}`
      case 'ancient': return `Ancient and wise (${daysSincePlanted} days old)${blessingsText}`
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <CardTitle className="flex items-center gap-2">
            Your Forest
            {trees.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <Hand className="w-3 h-3 mr-1" />
                Drag to move
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Forest Scene - 2D Side View - Always visible */}
            <div 
              ref={forestRef}
              className="relative min-h-96 bg-gradient-to-b from-sky-200 via-sky-100 to-green-50 rounded-lg overflow-hidden border-2 border-border cursor-crosshair"
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
                
                {/* Sun */}
                <div className="absolute top-6 right-8 w-12 h-12 bg-gradient-radial from-yellow-300 to-yellow-400 rounded-full opacity-80 shadow-lg shadow-yellow-200/50 pointer-events-none"></div>
                
                {/* Clouds */}
                <div className="absolute top-8 left-12 w-16 h-8 bg-white rounded-full opacity-70 shadow-sm pointer-events-none"></div>
                <div className="absolute top-12 left-32 w-12 h-6 bg-white rounded-full opacity-60 shadow-sm pointer-events-none"></div>
                <div className="absolute top-6 left-1/2 w-14 h-7 bg-white rounded-full opacity-65 shadow-sm pointer-events-none"></div>
                
                {/* Walking Cat - Always present */}
                <motion.div
                  className="absolute text-xl pointer-events-none select-none"
                  initial={{ x: -60 }}
                  animate={{ x: [0, 200, 400, 200, 0] }}
                  transition={{ 
                    duration: 30, 
                    repeat: Infinity, 
                    ease: "linear",
                    times: [0, 0.25, 0.5, 0.75, 1]
                  }}
                  style={{ bottom: '8%', zIndex: 20 }}
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, -2, 2, 0]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🐱
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
    </div>
  )
}