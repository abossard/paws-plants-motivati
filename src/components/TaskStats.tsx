import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Task } from '@/App'
import { Calendar, TrendUp, Target, Trophy } from '@phosphor-icons/react'

interface TaskStatsProps {
  tasks: Task[]
}

interface StatsPeriod {
  period: string
  completed: number
  total: number
  percentage: number
  pointsEarned: number
}

function TaskStats({ tasks }: TaskStatsProps) {
  const stats = useMemo(() => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeekStart = new Date(today)
    thisWeekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Calculate stats for different periods
    const calculatePeriodStats = (startDate: Date, endDate: Date): { completed: number, total: number, pointsEarned: number } => {
      const periodTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= startDate && taskDate <= endDate && !task.parentId // Only count main tasks
      })
      
      const completed = periodTasks.filter(task => task.completed).length
      const total = periodTasks.length
      const pointsEarned = completed * 10 // 10 points per completed task
      
      return { completed, total, pointsEarned }
    }
    
    // Today's stats
    const todayEnd = new Date(today)
    todayEnd.setHours(23, 59, 59, 999)
    const todayStats = calculatePeriodStats(today, todayEnd)
    
    // This week's stats
    const thisWeekEnd = new Date(thisWeekStart)
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6)
    thisWeekEnd.setHours(23, 59, 59, 999)
    const weekStats = calculatePeriodStats(thisWeekStart, thisWeekEnd)
    
    // This month's stats
    const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    thisMonthEnd.setHours(23, 59, 59, 999)
    const monthStats = calculatePeriodStats(thisMonthStart, thisMonthEnd)
    
    // All time stats
    const allTimeStats = calculatePeriodStats(new Date(0), now)
    
    const periods: StatsPeriod[] = [
      {
        period: 'Today',
        completed: todayStats.completed,
        total: todayStats.total,
        percentage: todayStats.total > 0 ? Math.round((todayStats.completed / todayStats.total) * 100) : 0,
        pointsEarned: todayStats.pointsEarned
      },
      {
        period: 'This Week',
        completed: weekStats.completed,
        total: weekStats.total,
        percentage: weekStats.total > 0 ? Math.round((weekStats.completed / weekStats.total) * 100) : 0,
        pointsEarned: weekStats.pointsEarned
      },
      {
        period: 'This Month',
        completed: monthStats.completed,
        total: monthStats.total,
        percentage: monthStats.total > 0 ? Math.round((monthStats.completed / monthStats.total) * 100) : 0,
        pointsEarned: monthStats.pointsEarned
      },
      {
        period: 'All Time',
        completed: allTimeStats.completed,
        total: allTimeStats.total,
        percentage: allTimeStats.total > 0 ? Math.round((allTimeStats.completed / allTimeStats.total) * 100) : 0,
        pointsEarned: allTimeStats.pointsEarned
      }
    ]
    
    return periods
  }, [tasks])
  
  // Calculate streaks
  const currentStreak = useMemo(() => {
    const today = new Date()
    let streak = 0
    
    for (let i = 0; i < 30; i++) { // Check last 30 days
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      const dayStart = new Date(checkDate.getFullYear(), checkDate.getMonth(), checkDate.getDate())
      const dayEnd = new Date(dayStart)
      dayEnd.setHours(23, 59, 59, 999)
      
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= dayStart && taskDate <= dayEnd && !task.parentId && task.completed
      })
      
      if (dayTasks.length > 0) {
        streak++
      } else if (i > 0) { // Don't break streak on today if no tasks completed yet
        break
      }
    }
    
    return streak
  }, [tasks])
  
  // Best day performance
  const bestDay = useMemo(() => {
    const dayStats = new Map<string, number>()
    
    tasks.forEach(task => {
      if (task.completed && !task.parentId) {
        const taskDate = new Date(task.createdAt)
        const dayKey = taskDate.toDateString()
        dayStats.set(dayKey, (dayStats.get(dayKey) || 0) + 1)
      }
    })
    
    let maxTasks = 0
    let bestDate = ''
    
    dayStats.forEach((count, date) => {
      if (count > maxTasks) {
        maxTasks = count
        bestDate = date
      }
    })
    
    return { count: maxTasks, date: bestDate }
  }, [tasks])
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Task Statistics</h2>
        <p className="text-muted-foreground">Track your productivity journey</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <TrendUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {currentStreak === 1 ? 'day' : 'days'} in a row
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Day</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{bestDay.count}</div>
            <p className="text-xs text-muted-foreground">
              {bestDay.date ? new Date(bestDay.date).toLocaleDateString() : 'No data yet'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points Earned</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.find(s => s.period === 'All Time')?.pointsEarned || 0}
            </div>
            <p className="text-xs text-muted-foreground">from completed tasks</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Period Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.map((stat) => (
          <Card key={stat.period}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                {stat.period}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Completion Rate</span>
                <Badge variant={stat.percentage >= 80 ? "default" : stat.percentage >= 50 ? "secondary" : "outline"}>
                  {stat.percentage}%
                </Badge>
              </div>
              
              <Progress value={stat.percentage} className="h-2" />
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">{stat.completed}</div>
                  <div className="text-xs text-muted-foreground">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-600">{stat.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-accent">{stat.pointsEarned}</div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default TaskStats