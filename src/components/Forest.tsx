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

  // Generate natural forest positions for trees in 2D side view
  const getForestPosition = (index: number, total: number) => {
    // Create a pseudo-random but consistent position based on tree ID
    const seed = trees[index]?.id ? parseInt(trees[index].id) : index
    const x = (seed * 9301 + 49297) % 233280 // Pseudo-random X position
    
    // Create ground height variation (multiple ground levels)
    const groundLevels = [85, 88, 82, 90, 86, 84] // Different ground heights as percentages
    const groundLevel = groundLevels[index % groundLevels.length]
    
    return {
      left: `${(x / 233280) * 90 + 5}%`, // 5-95% horizontal range
      bottom: `${100 - groundLevel}%`, // Trees stand on ground level
      zIndex: index + 1 // Simple layering based on order
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
              {/* Forest Scene - 2D Side View */}
              <div className="relative min-h-96 bg-gradient-to-b from-sky-200 via-sky-100 to-green-50 rounded-lg overflow-hidden border-2 border-border">
                {/* Background mountains/hills */}
                <div className="absolute inset-0">
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
                <div className="absolute inset-0">
                  {/* Ground layer 1 (furthest back) */}
                  <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-b from-green-300 to-green-400" 
                       style={{ bottom: '18%' }}></div>
                  
                  {/* Ground layer 2 */}
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-green-300 to-green-500" 
                       style={{ bottom: '12%' }}></div>
                  
                  {/* Ground layer 3 */}
                  <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-b from-green-400 to-green-600" 
                       style={{ bottom: '16%' }}></div>
                  
                  {/* Ground layer 4 */}
                  <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-b from-green-300 to-green-500" 
                       style={{ bottom: '10%' }}></div>
                  
                  {/* Ground layer 5 */}
                  <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-b from-green-400 to-green-600" 
                       style={{ bottom: '14%' }}></div>
                  
                  {/* Main ground */}
                  <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-b from-green-400 to-green-600"></div>
                </div>
                
                {/* Sun */}
                <div className="absolute top-6 right-8 w-12 h-12 bg-gradient-radial from-yellow-300 to-yellow-400 rounded-full opacity-80 shadow-lg shadow-yellow-200/50"></div>
                
                {/* Clouds */}
                <div className="absolute top-8 left-12 w-16 h-8 bg-white rounded-full opacity-70 shadow-sm"></div>
                <div className="absolute top-12 left-32 w-12 h-6 bg-white rounded-full opacity-60 shadow-sm"></div>
                <div className="absolute top-6 left-1/2 w-14 h-7 bg-white rounded-full opacity-65 shadow-sm"></div>
                
                {/* Trees positioned on ground levels */}
                {trees.map((tree, index) => {
                  const position = getForestPosition(index, trees.length)
                  const stage = getGrowthStage(tree)
                  
                  // Adjust size based on growth stage and distance (layering effect)
                  const sizeMultiplier = {
                    seedling: 0.4,
                    young: 0.6,
                    mature: 0.8,
                    ancient: 1.0
                  }[stage]
                  
                  // Make trees further back slightly smaller for depth
                  const depthMultiplier = 1 - (index % 3) * 0.1
                  const finalSize = sizeMultiplier * depthMultiplier
                  
                  return (
                    <motion.div
                      key={tree.id}
                      initial={{ scale: 0, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.15 }}
                      className="absolute transform -translate-x-1/2 cursor-pointer group"
                      style={{
                        left: position.left,
                        bottom: position.bottom,
                        zIndex: position.zIndex,
                        fontSize: `${1.5 + finalSize * 1.5}rem`,
                        filter: tree.catBlessings > 0 ? 'drop-shadow(0 0 8px rgba(147, 51, 234, 0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                      }}
                      title={`${treeTypes[tree.type].name} - ${getGrowthDescription(tree)}`}
                    >
                      <div className="relative">
                        {/* Tree */}
                        <div className="transform hover:scale-110 transition-transform duration-200">
                          {getTreeDisplay(tree)}
                        </div>
                        
                        {/* Hover tooltip */}
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
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                
                {/* Forest ambiance elements */}
                {trees.length > 2 && (
                  <>
                    {/* Flying birds */}
                    <motion.div
                      className="absolute text-sm"
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
                        className="absolute text-xs"
                        animate={{ x: [0, 5, -3, 2, 0], y: [0, -2, 1, -1, 0] }}
                        transition={{ duration: 6, repeat: Infinity }}
                        style={{ top: '35%', left: '70%', zIndex: 20 }}
                      >
                        🐦
                      </motion.div>
                    )}
                    
                    {/* Butterflies near flowers */}
                    <motion.div
                      className="absolute text-xs"
                      initial={{ x: 0, y: 0 }}
                      animate={{ x: [0, 15, -8, 12, 0], y: [0, -8, 3, -4, 0] }}
                      transition={{ duration: 10, repeat: Infinity }}
                      style={{ bottom: '25%', left: '25%' }}
                    >
                      🦋
                    </motion.div>
                  </>
                )}
                
                {/* Mystical elements for ancient trees */}
                {trees.some(tree => getGrowthStage(tree) === 'ancient') && (
                  <>
                    <motion.div
                      className="absolute text-sm opacity-70"
                      animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.1, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      style={{ top: '20%', left: '15%' }}
                    >
                      ✨
                    </motion.div>
                    <motion.div
                      className="absolute text-xs opacity-60"
                      animate={{ opacity: [0.3, 0.8, 0.3], y: [0, -5, 0] }}
                      transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                      style={{ top: '30%', right: '20%' }}
                    >
                      🌟
                    </motion.div>
                  </>
                )}
                
                {/* Grass and small plants at ground level */}
                {trees.length > 1 && (
                  <div className="absolute bottom-0 left-0 w-full h-4 flex items-end justify-around opacity-60">
                    <span className="text-xs">🌱</span>
                    <span className="text-xs">🍄</span>
                    <span className="text-xs">🌿</span>
                    <span className="text-xs">🌸</span>
                    <span className="text-xs">🌱</span>
                    <span className="text-xs">🌿</span>
                  </div>
                )}
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-center text-muted-foreground">
                  🌟 Your forest has <strong>{trees.length}</strong> tree{trees.length !== 1 ? 's' : ''} growing on different ground levels! 
                  <div className="mt-1">Trees grow and change over time as you continue your journey.</div>
                  {trees.length > 0 && <div className="mt-1 text-xs">💡 Hover over trees to see their details and growth progress</div>}
                  
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
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}