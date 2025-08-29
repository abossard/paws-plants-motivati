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
    if (daysSincePlanted < 1) return 'seedling'
    if (daysSincePlanted < 3) return 'young'
    if (daysSincePlanted < 7) return 'mature'
    return 'ancient'
  }

  const getTreeDisplay = (tree: Tree) => {
    const stage = getGrowthStage(tree)
    const baseEmoji = treeTypes[tree.type].emoji
    
    switch (stage) {
      case 'seedling': return '🌱'
      case 'young': return tree.type === 'cherry' ? '🌸' : '🌿'
      case 'mature': return baseEmoji
      case 'ancient': return baseEmoji + '✨'
      default: return baseEmoji
    }
  }

  const getGrowthDescription = (tree: Tree) => {
    const stage = getGrowthStage(tree)
    const daysSincePlanted = Math.floor((Date.now() - tree.plantedAt) / (1000 * 60 * 60 * 24))
    
    switch (stage) {
      case 'seedling': return `Just sprouted ${daysSincePlanted === 0 ? 'today' : `${daysSincePlanted} day(s) ago`}`
      case 'young': return `Growing strong (${daysSincePlanted} days old)`
      case 'mature': return `Fully grown (${daysSincePlanted} days old)`
      case 'ancient': return `Ancient and wise (${daysSincePlanted} days old)`
      default: return 'Growing...'
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
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                {trees.map((tree) => (
                  <motion.div
                    key={tree.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <div className="text-4xl mb-2">{getTreeDisplay(tree)}</div>
                    <div className="text-xs text-muted-foreground">
                      {treeTypes[tree.type].name}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {getGrowthDescription(tree)}
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="text-sm text-center text-muted-foreground">
                  🌟 Your forest has <strong>{trees.length}</strong> tree{trees.length !== 1 ? 's' : ''}! 
                  Trees grow and change over time as you continue your journey.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}