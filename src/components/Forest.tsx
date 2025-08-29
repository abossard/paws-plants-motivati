import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TreePine, Sparkle } from '@phosphor-icons/react'
import { Tree } from '@/App'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ForestProps {
  trees: Tree[]
  pawPoints: number
  onPlantTree: (type: Tree['type']) => boolean
  getTreeCost: (type: Tree['type']) => number
}

const treeTypes = {
  oak: { emoji: '🌳', name: 'Oak Tree', description: 'Strong and enduring' },
  pine: { emoji: '🌲', name: 'Pine Tree', description: 'Evergreen and resilient' },
  cherry: { emoji: '🌸', name: 'Cherry Tree', description: 'Beautiful and delicate' },
  willow: { emoji: '🌿', name: 'Willow Tree', description: 'Graceful and flexible' }
}

export default function Forest({ trees, pawPoints, onPlantTree, getTreeCost }: ForestProps) {
  const [selectedType, setSelectedType] = useState<Tree['type'] | null>(null)

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

  // Generate natural forest positions for trees
  const getForestPosition = (index: number, total: number) => {
    // Create a pseudo-random but consistent position based on tree ID
    const seed = trees[index]?.id ? parseInt(trees[index].id) : index
    const x = (seed * 9301 + 49297) % 233280 // Pseudo-random X position
    const y = (seed * 4096 + 150889) % 233280 // Pseudo-random Y position
    
    return {
      left: `${(x / 233280) * 80 + 10}%`, // 10-90% horizontal range
      top: `${(y / 233280) * 70 + 15}%`,  // 15-85% vertical range
      zIndex: Math.floor((y / 233280) * 10) + 1 // Layering for depth
    }
  }

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
          <CardTitle>Your Forest</CardTitle>
        </CardHeader>
        <CardContent>
          {trees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkle className="w-8 h-8 mx-auto mb-2 text-accent" />
              <p>Your forest is empty! Plant your first tree above.</p>
              <p className="text-sm mt-1">Complete tasks to earn Paw Points for planting.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Forest Scene */}
              <div className="relative min-h-96 bg-gradient-to-b from-sky-100 to-green-100 rounded-lg overflow-hidden border-2 border-border">
                {/* Forest Ground */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-green-200 to-green-100"></div>
                
                {/* Sun */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-300 rounded-full opacity-80"></div>
                
                {/* Clouds */}
                <div className="absolute top-6 left-8 w-12 h-6 bg-white rounded-full opacity-70"></div>
                <div className="absolute top-8 left-20 w-8 h-4 bg-white rounded-full opacity-60"></div>
                
                {/* Trees positioned naturally */}
                {trees.map((tree, index) => {
                  const position = getForestPosition(index, trees.length)
                  const stage = getGrowthStage(tree)
                  
                  // Adjust size based on growth stage
                  const sizeMultiplier = {
                    seedling: 0.5,
                    young: 0.75,
                    mature: 1,
                    ancient: 1.2
                  }[stage]
                  
                  return (
                    <motion.div
                      key={tree.id}
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      className="absolute transform -translate-x-1/2 -translate-y-full cursor-pointer group"
                      style={{
                        left: position.left,
                        top: position.top,
                        zIndex: position.zIndex,
                        fontSize: `${2 + sizeMultiplier}rem`,
                        filter: tree.catBlessings > 0 ? 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.4))' : 'none'
                      }}
                      title={`${treeTypes[tree.type].name} - ${getGrowthDescription(tree)}`}
                    >
                      <div className="relative">
                        {/* Tree */}
                        <div className="transform hover:scale-110 transition-transform duration-200">
                          {getTreeDisplay(tree)}
                        </div>
                        
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-card border rounded shadow-lg text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                          <div className="font-medium">{treeTypes[tree.type].name}</div>
                          <div className="text-muted-foreground text-xs">
                            {getGrowthDescription(tree)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                {/* Forest ambiance elements */}
                {trees.length > 3 && (
                  <>
                    {/* Birds */}
                    <motion.div
                      className="absolute text-xs"
                      initial={{ x: -20, y: 40 }}
                      animate={{ x: 300, y: 30 }}
                      transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                      style={{ top: '20%', left: '10%' }}
                    >
                      🦅
                    </motion.div>
                    
                    {/* Butterflies */}
                    <motion.div
                      className="absolute text-xs"
                      initial={{ x: 0, y: 0 }}
                      animate={{ x: [0, 20, -10, 15, 0], y: [0, -10, 5, -5, 0] }}
                      transition={{ duration: 8, repeat: Infinity }}
                      style={{ top: '40%', right: '30%' }}
                    >
                      🦋
                    </motion.div>
                  </>
                )}
                
                {/* Ancient forest mystical elements */}
                {trees.some(tree => getGrowthStage(tree) === 'ancient') && (
                  <motion.div
                    className="absolute text-xs opacity-70"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ top: '25%', left: '60%' }}
                  >
                    ✨
                  </motion.div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-center text-muted-foreground">
                  🌟 Your forest has <strong>{trees.length}</strong> tree{trees.length !== 1 ? 's' : ''}! 
                  Trees grow and change over time as you continue your journey.
                  {trees.length > 0 && <div className="mt-1 text-xs">💡 Hover over trees to see their details</div>}
                  
                  {trees.some(tree => tree.catBlessings > 0) && (
                    <div className="mt-2 text-xs text-purple-600 font-medium">
                      ✨ Some trees have been blessed by your cat and are growing faster! ✨
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}