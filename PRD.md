# Paws & Plants - Motivational Task App

A delightful productivity companion that combines task completion with virtual cat care and tree planting to create positive reinforcement loops.

**Experience Qualities:**
1. **Nurturing** - The app feels like caring for beloved pets and plants, creating emotional attachment
2. **Rewarding** - Every completed task provides immediate gratification through Paw Points and visual progress
3. **Peaceful** - Soft colors, gentle animations, and nature themes create a calm, stress-free environment

**Complexity Level:**
- Light Application (multiple features with basic state)
- The app manages tasks, points, cat states, and tree collections but remains simple and focused on core motivation mechanics

## Essential Features

**Task Management**
- Functionality: Create, edit, and complete daily tasks with checkbox interactions
- Purpose: Core productivity mechanism that drives all other features
- Trigger: User clicks "Add Task" or checks off existing tasks
- Progression: Add task → Enter description → Save → Complete task → Earn Paw Points → Visual feedback
- Success criteria: Tasks persist between sessions, completion awards points consistently

**Cat Avatar System**
- Functionality: Virtual cat companion with emotional states and care interactions
- Purpose: Emotional connection that motivates continued app usage
- Trigger: App launch shows cat, care actions triggered by spending points
- Progression: View cat → Check mood → Spend points on care → Cat reacts positively → Mood improves
- Success criteria: Cat states persist, care actions provide satisfying feedback

**Tree Planting & Forest**
- Functionality: Spend Paw Points to unlock and plant different tree types in personal forest
- Purpose: Visual representation of long-term progress and achievement
- Trigger: User accesses forest view and selects tree to plant
- Progression: View forest → Browse available trees → Spend points → Plant tree → Watch growth over time
- Success criteria: Trees remain planted, growth progresses naturally, forest expands with variety

**Paw Points Economy**
- Functionality: Point system that connects task completion to rewards
- Purpose: Creates clear value exchange between productivity and enjoyment
- Trigger: Task completion automatically awards points
- Progression: Complete task → Earn points → Spend on cat care or trees → See immediate results
- Success criteria: Point balance accurate, spending works reliably, earning feels satisfying

## Edge Case Handling

- **Empty Task List**: Show encouraging message with cat suggesting first task
- **Zero Paw Points**: Display point balance clearly, show ways to earn more
- **No Trees Planted**: Provide starter tree or clear instructions for first planting
- **Cat Neglect**: Cat becomes sad but never permanently upset, always recoverable
- **Task Overflow**: Graceful scrolling and organization for many tasks

## Design Direction

The design should feel cozy and nurturing like a digital terrarium, combining the warmth of pet care with the serenity of nature. Minimal interface with generous white space allows focus on the cat, tasks, and growing forest without overwhelming users.

## Color Selection

Analogous earth tones create a natural, harmonious palette that feels both grounding and uplifting.

- **Primary Color**: Forest Green (oklch(0.45 0.15 142)) - Communicates growth, nature, and tranquility
- **Secondary Colors**: Warm beige (oklch(0.85 0.02 85)) for backgrounds, soft brown (oklch(0.35 0.08 85)) for text
- **Accent Color**: Golden yellow (oklch(0.75 0.15 85)) for Paw Points, rewards, and positive interactions
- **Foreground/Background Pairings**: 
  - Background (Warm Beige #F5F2E8): Dark Brown text (oklch(0.25 0.08 85)) - Ratio 5.2:1 ✓
  - Primary (Forest Green): White text (oklch(1 0 0)) - Ratio 6.8:1 ✓  
  - Accent (Golden Yellow): Dark Brown text (oklch(0.25 0.08 85)) - Ratio 4.9:1 ✓
  - Card (Light Cream #FEFCF7): Dark Brown text (oklch(0.25 0.08 85)) - Ratio 5.8:1 ✓

## Font Selection

Typography should feel friendly and approachable while maintaining clarity for task management, using rounded sans-serif fonts that complement the organic theme.

- **Typographic Hierarchy**:
  - H1 (App Title): Inter Bold/32px/tight letter spacing
  - H2 (Section Headers): Inter SemiBold/24px/normal spacing  
  - H3 (Task Items): Inter Medium/18px/relaxed spacing
  - Body (General Text): Inter Regular/16px/comfortable line height
  - Small (Point Counters): Inter Medium/14px/tight spacing

## Animations

Gentle, nature-inspired animations that feel organic rather than mechanical, creating moments of delight without interfering with productivity focus.

- **Purposeful Meaning**: Animations communicate life and growth - trees sway gently, cats stretch and purr, checkmarks bloom like flowers
- **Hierarchy of Movement**: Task completion gets celebratory animation, cat reactions are subtle and charming, tree growth is slow and satisfying

## Component Selection

- **Components**: Cards for task lists and forest sections, Buttons for primary actions, Badges for point display, Avatar for cat display, Tabs for navigation between features
- **Customizations**: Custom tree illustrations, cat emotion states, and progress indicators that aren't provided by shadcn
- **States**: Buttons have soft hover states with gentle scaling, completed tasks fade to muted colors, interactive elements have subtle shadow responses
- **Icon Selection**: Phosphor icons for nature themes (tree, leaf, paw), plus simple geometric shapes for UI actions
- **Spacing**: Generous padding (p-6, p-8) to create breathing room, consistent gaps (gap-4, gap-6) between related elements
- **Mobile**: Single column layout on mobile with larger touch targets, swipe gestures for tree browsing, simplified navigation tabs