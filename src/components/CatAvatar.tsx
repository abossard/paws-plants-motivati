import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, GameController, Coffee, Sparkle } from '@phosphor-icons/react'
import { CatState, Tree } from '@/App'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface CatAvatarProps {
  catState: CatState
  pawPoints: number
  onCareCat: (action: 'feed' | 'play') => boolean
  onBlessForest: () => boolean
  trees: Tree[]
}

const catEmojis = {
  happy: '😸',
  neutral: '😺',
  sad: '😿'
}

const catMessages = {
  happy: [
    "Purr purr! I'm so happy!",
    "Thank you for taking care of me!",
    "I love spending time with you!",
    "Life is great with you around!",
    "I feel magical energy flowing through me! ✨"
  ],
  neutral: [
    "Hello there, friend!",
    "I'm doing okay today.",
    "Maybe we could spend some time together?",
    "How are your tasks going?",
    "I wonder if I could help your trees grow..."
  ],
  sad: [
    "I could use some attention...",
    "It's been a while since we played...",
    "I'm feeling a bit lonely.",
    "Could you spare some time for me?",
    "My magic feels weak when I'm sad..."
  ]
}

export default function CatAvatar({ catState, pawPoints, onCareCat, onBlessForest, trees }: CatAvatarProps) {
  const [message, setMessage] = useState('')
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const messages = catMessages[catState.mood]
    setMessage(messages[Math.floor(Math.random() * messages.length)])
  }, [catState.mood])

  const handleFeed = () => {
    if (pawPoints < 15) {
      toast.error("Not enough Paw Points! Complete more tasks to earn points.")
      return
    }
    
    const success = onCareCat('feed')
    if (success) {
      setIsAnimating(true)
      toast.success("Your cat is purring with happiness! 🐱")
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const handlePlay = () => {
    if (pawPoints < 15) {
      toast.error("Not enough Paw Points! Complete more tasks to earn points.")
      return
    }
    
    const success = onCareCat('play')
    if (success) {
      setIsAnimating(true)
      toast.success("Your cat loves playing with you! 🎾")
      setTimeout(() => setIsAnimating(false), 1000)
    }
  }

  const handleBlessForest = () => {
    if (pawPoints < 25) {
      toast.error("Not enough Paw Points! You need 25 points for a forest blessing.")
      return
    }
    
    if (catState.mood !== 'happy') {
      toast.error("Your cat needs to be happy to bless the forest! Try feeding or playing with them first.")
      return
    }

    if (trees.length === 0) {
      toast.error("You need to have trees in your forest to bless them!")
      return
    }
    
    const success = onBlessForest()
    if (success) {
      setIsAnimating(true)
      toast.success("Your cat blessed the forest with magical growth energy! ✨🌱")
      setTimeout(() => setIsAnimating(false), 1500)
    }
  }

  const getTimeSinceLastCare = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60))
    if (hours < 1) return 'just now'
    if (hours === 1) return '1 hour ago'
    return `${hours} hours ago`
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Your Feline Friend</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <motion.div
            animate={{ 
              scale: isAnimating ? [1, 1.2, 1] : 1,
              rotate: isAnimating ? [0, -5, 5, -5, 0] : 0
            }}
            transition={{ duration: 0.5 }}
            className="text-8xl"
          >
            {catEmojis[catState.mood]}
          </motion.div>

          <div className="space-y-2">
            <div className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
              catState.mood === 'happy' ? 'bg-green-100 text-green-800' :
              catState.mood === 'neutral' ? 'bg-blue-100 text-blue-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              Mood: {catState.mood.charAt(0).toUpperCase() + catState.mood.slice(1)}
            </div>
          </div>

          <Card className="mx-auto max-w-md">
            <CardContent className="p-4">
              <p className="text-muted-foreground italic">"{message}"</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Button
              onClick={handleFeed}
              disabled={pawPoints < 15}
              variant={pawPoints >= 15 ? "default" : "secondary"}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <Coffee className="w-6 h-6" />
              <span>Feed Cat</span>
              <span className="text-xs">15 🐾</span>
            </Button>

            <Button
              onClick={handlePlay}
              disabled={pawPoints < 15}
              variant={pawPoints >= 15 ? "default" : "secondary"}
              className="flex flex-col gap-2 h-auto py-4"
            >
              <GameController className="w-6 h-6" />
              <span>Play</span>
              <span className="text-xs">15 🐾</span>
            </Button>
          </div>

          {/* Forest Blessing - Special Ability */}
          {trees.length > 0 && (
            <div className="mt-6">
              <div className="text-sm text-muted-foreground mb-3 text-center">
                ✨ Special Ability ✨
              </div>
              <Button
                onClick={handleBlessForest}
                disabled={pawPoints < 25 || catState.mood !== 'happy'}
                variant={pawPoints >= 25 && catState.mood === 'happy' ? "default" : "secondary"}
                className="w-full max-w-md mx-auto flex flex-col gap-2 h-auto py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                style={{
                  background: pawPoints >= 25 && catState.mood === 'happy' 
                    ? 'linear-gradient(45deg, #8b5cf6, #ec4899)' 
                    : undefined
                }}
              >
                <Sparkle className="w-6 h-6" />
                <span>Bless Forest</span>
                <span className="text-xs">25 🐾 • Requires Happy Cat</span>
                <span className="text-xs opacity-80">Makes trees on all ground levels grow faster!</span>
              </Button>
              
              {catState.mood !== 'happy' && (
                <p className="text-xs text-muted-foreground text-center mt-2">
                  💡 Keep your cat happy to unlock forest blessings!
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-accent" />
            Care History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last fed:</span>
              <span>{getTimeSinceLastCare(catState.lastFed)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last played:</span>
              <span>{getTimeSinceLastCare(catState.lastPlayed)}</span>
            </div>
          </div>
          
          {catState.blessingsGiven > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-sm font-medium text-primary">✨ Magical Powers ✨</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Forest blessings given: <strong>{catState.blessingsGiven}</strong>
                </div>
                {catState.lastBlessing > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Last blessing: {getTimeSinceLastCare(catState.lastBlessing)}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}