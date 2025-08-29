import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Star, Heart, Sparkle, Clock, Gift } from '@phosphor-icons/react'
import { CatInventory, FruitInventory } from '@/App'
import { toast } from 'sonner'

interface ItemShowcaseProps {
  catInventory: CatInventory
  fruitInventory: FruitInventory
  onUseItem: (itemId: string) => boolean
  onConsumeFruit: (fruitId: string) => boolean
}

export default function ItemShowcase({ 
  catInventory, 
  fruitInventory, 
  onUseItem, 
  onConsumeFruit 
}: ItemShowcaseProps) {
  const handleUseItem = (itemId: string, itemName: string) => {
    const success = onUseItem(itemId)
    if (success) {
      toast.success(`✨ Used ${itemName}! Your cat is delighted!`)
    } else {
      toast.error('Unable to use this item right now.')
    }
  }

  const handleConsumeFruit = (fruitId: string, fruitName: string) => {
    const success = onConsumeFruit(fruitId)
    if (success) {
      toast.success(`🍎 Consumed ${fruitName}! You gained points and special effects!`)
    } else {
      toast.error('Unable to consume this fruit.')
    }
  }

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'toy': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'accessory': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'food': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'legendary': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTimeSinceLastUsed = (lastUsed?: number) => {
    if (!lastUsed) return 'Never used'
    const timeDiff = Date.now() - lastUsed
    const hours = Math.floor(timeDiff / (1000 * 60 * 60))
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) return `${hours}h ${minutes}m ago`
    return `${minutes}m ago`
  }

  const ownedItems = Object.entries(catInventory).filter(([_, invItem]) => invItem.quantity > 0)
  const ownedFruits = Object.entries(fruitInventory).filter(([_, invItem]) => invItem.quantity > 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Star className="w-6 h-6 text-primary" />
            Item Showcase
          </CardTitle>
          <p className="text-muted-foreground">
            View and manage all your collected items and fruits
          </p>
        </CardHeader>
      </Card>

      {/* Cat Items Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-500" />
            Cat Items Collection
            <Badge variant="secondary">{ownedItems.length} items</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ownedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No items collected yet</p>
              <p className="text-sm">Visit the shop to buy toys, accessories, and treats for your cat!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ownedItems.map(([itemId, invItem]) => (
                <Card key={itemId} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{invItem.item.icon}</span>
                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="font-semibold text-lg">{invItem.item.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getItemTypeColor(invItem.item.type)}>
                              {invItem.item.type}
                            </Badge>
                            {invItem.item.type !== 'accessory' && (
                              <Badge variant="outline">×{invItem.quantity}</Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {invItem.item.description}
                        </p>

                        {/* Effects Display */}
                        <div className="space-y-2">
                          {invItem.item.effects.moodBoost && (
                            <div className="flex items-center gap-2 text-sm">
                              <Heart className="w-4 h-4 text-red-500" />
                              <span>Mood boost: +{invItem.item.effects.moodBoost}</span>
                            </div>
                          )}
                          {invItem.item.effects.specialAbility && (
                            <div className="flex items-center gap-2 text-sm text-primary">
                              <Sparkle className="w-4 h-4" />
                              <span>{invItem.item.effects.specialAbility}</span>
                            </div>
                          )}
                        </div>

                        {/* Usage Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>Last used: {getTimeSinceLastUsed(invItem.lastUsed)}</span>
                          </div>
                        </div>

                        {/* Use Button */}
                        {invItem.item.type !== 'accessory' && invItem.quantity > 0 && (
                          <Button
                            onClick={() => handleUseItem(itemId, invItem.item.name)}
                            size="sm"
                            className="w-full"
                          >
                            Use Item
                          </Button>
                        )}
                        
                        {invItem.item.type === 'accessory' && (
                          <div className="text-center">
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              ✓ Equipped & Active
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Fruit Collection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-xl">🍇</span>
            Fruit Collection
            <Badge variant="secondary">{ownedFruits.length} types</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ownedFruits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <span className="text-4xl block mb-4">🌳</span>
              <p>No fruits collected yet</p>
              <p className="text-sm">Plant and grow trees in your forest to harvest magical fruits!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ownedFruits.map(([fruitId, invItem]) => (
                <Card key={fruitId} className="relative">
                  <CardContent className="p-4">
                    <div className="text-center space-y-3">
                      <span className="text-4xl block">{invItem.fruit.icon}</span>
                      <div>
                        <h3 className="font-semibold">{invItem.fruit.name}</h3>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <Badge className={getRarityColor(invItem.fruit.rarity)}>
                            {invItem.fruit.rarity}
                          </Badge>
                          <Badge variant="outline">×{invItem.quantity}</Badge>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground">
                        {invItem.fruit.description}
                      </p>

                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Value:</span> {invItem.fruit.value} 🐾
                        </div>
                        
                        {invItem.fruit.effects?.pointBonus && (
                          <div className="text-sm text-green-600">
                            <Sparkle className="w-3 h-3 inline mr-1" />
                            +{invItem.fruit.effects.pointBonus} bonus points
                          </div>
                        )}
                        
                        {invItem.fruit.effects?.specialEffect && (
                          <div className="text-xs text-primary">
                            ✨ {invItem.fruit.effects.specialEffect}
                          </div>
                        )}
                      </div>

                      <Button
                        onClick={() => handleConsumeFruit(fruitId, invItem.fruit.name)}
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={invItem.quantity <= 0}
                      >
                        Consume (+{invItem.fruit.value} 🐾)
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Collection Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-purple-900 mb-4">📊 Collection Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{ownedItems.length}</div>
              <div className="text-sm text-purple-800">Cat Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{ownedFruits.length}</div>
              <div className="text-sm text-green-800">Fruit Types</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(fruitInventory).reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-sm text-blue-800">Total Fruits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(fruitInventory).reduce((sum, item) => sum + (item.quantity * item.fruit.value), 0)}
              </div>
              <div className="text-sm text-orange-800">Fruit Value</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}