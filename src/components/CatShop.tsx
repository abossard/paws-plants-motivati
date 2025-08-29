import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ShoppingBag, Heart, Star } from '@phosphor-icons/react'
import { CatItem, CatInventory } from '@/App'
import { toast } from 'sonner'

interface CatShopProps {
  pawPoints: number
  catInventory: CatInventory
  onBuyItem: (itemId: string) => boolean
  shopItems: CatItem[]
}

export default function CatShop({ pawPoints, catInventory, onBuyItem, shopItems }: CatShopProps) {
  const handleBuyItem = (item: CatItem) => {
    if (pawPoints < item.cost) {
      toast.error(`Not enough Paw Points! You need ${item.cost} points to buy ${item.name}.`)
      return
    }

    const success = onBuyItem(item.id)
    if (success) {
      toast.success(`🛍️ You bought ${item.name}! Your cat will love it!`)
    }
  }

  const getItemTypeColor = (type: CatItem['type']) => {
    switch (type) {
      case 'toy': return 'bg-blue-100 text-blue-800'
      case 'accessory': return 'bg-purple-100 text-purple-800'
      case 'food': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getItemTypeIcon = (type: CatItem['type']) => {
    switch (type) {
      case 'toy': return '🎾'
      case 'accessory': return '💎'
      case 'food': return '🍽️'
      default: return '📦'
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            Cat Shop
          </CardTitle>
          <p className="text-muted-foreground">
            Spoil your feline friend with toys, accessories, and treats!
          </p>
        </CardHeader>
      </Card>

      {/* Inventory Display */}
      {Object.keys(catInventory).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-accent" />
              Your Cat's Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(catInventory)
                .filter(([_, invItem]) => invItem.quantity > 0)
                .map(([itemId, invItem]) => (
                <div key={itemId} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <span className="text-2xl">{invItem.item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{invItem.item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {invItem.item.type === 'accessory' ? 'Equipped' : `×${invItem.quantity}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Shop Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopItems.map((item) => {
          const owned = catInventory[item.id]?.quantity || 0
          const canAfford = pawPoints >= item.cost
          
          return (
            <Card key={item.id} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{item.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                      <Badge className={getItemTypeColor(item.type)}>
                        {getItemTypeIcon(item.type)} {item.type}
                      </Badge>
                    </div>
                  </div>
                  {owned > 0 && (
                    <Badge variant="secondary">
                      {item.type === 'accessory' ? '✓' : `×${owned}`}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{item.description}</p>
                
                {/* Effects */}
                <div className="space-y-2">
                  {item.effects.moodBoost && (
                    <div className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-red-500" />
                      <span>Mood boost: +{item.effects.moodBoost}</span>
                    </div>
                  )}
                  {item.effects.specialAbility && (
                    <div className="text-sm text-primary">
                      ✨ {item.effects.specialAbility}
                    </div>
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={() => handleBuyItem(item)}
                  disabled={!canAfford || (item.type === 'accessory' && owned > 0)}
                  variant={canAfford ? "default" : "secondary"}
                  className="w-full"
                >
                  {item.type === 'accessory' && owned > 0 ? (
                    'Already Owned'
                  ) : (
                    <>
                      <Heart className="w-4 h-4 mr-2" />
                      Buy for {item.cost} 🐾
                    </>
                  )}
                </Button>
                
                {!canAfford && (
                  <p className="text-xs text-muted-foreground text-center">
                    Need {item.cost - pawPoints} more points
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Shopping Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Shopping Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Toys</strong> provide temporary mood boosts and can be used multiple times</li>
            <li>• <strong>Accessories</strong> are permanent upgrades that provide ongoing benefits</li>
            <li>• <strong>Food</strong> items give longer-lasting effects than regular feeding</li>
            <li>• Happy cats with accessories can provide enhanced forest blessings!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}