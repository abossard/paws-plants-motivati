# Paws & Plants - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: A motivational task management app that gamifies productivity through the care of a virtual cat and the growth of a personal forest.
- **Success Indicators**: Users consistently complete daily tasks, feel motivated by visual progress, and return to the app regularly to care for their cat and tend their forest.
- **Experience Qualities**: Calming, rewarding, nurturing

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state management)
- **Primary User Activity**: Acting (completing tasks) and Interacting (caring for cat, managing forest)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Traditional task apps lack emotional connection and long-term motivation. Users need a system that provides immediate rewards and visual progress representation.
- **User Context**: Daily productivity tracking with moments of delight and care throughout the day.
- **Critical Path**: Create task → Complete task → Earn points → Care for cat or plant trees → See visual progress
- **Key Moments**: Task completion satisfaction, cat happiness response, forest growth visualization

## Essential Features

### Task Management
- **What it does**: Users can create, view, and complete daily tasks with hierarchical subtask support
- **Why it matters**: Core productivity mechanic that drives the entire reward system while allowing for complex project breakdown
- **Success criteria**: Intuitive task creation, subtask organization, satisfying completion interaction, auto-completion of parent tasks when all subtasks are done, persistent storage

### Cat Avatar & Care System
- **What it does**: Virtual cat with mood states that can be improved through feeding and playing, enhanced with purchasable toys and accessories
- **Why it matters**: Provides emotional connection and immediate feedback for earned points while allowing for customization and long-term investment
- **Success criteria**: Responsive animations, clear mood indicators, rewarding interactions, meaningful item effects

### Cat Shop & Inventory System
- **What it does**: Shop where users can purchase toys, accessories, and food items for their cat using Paw Points
- **Why it matters**: Adds depth to the progression system and provides additional ways to care for the cat with permanent upgrades and consumable benefits
- **Success criteria**: Clear item categorization, meaningful effects from items, balanced pricing, satisfying purchase experience

### Forest Blessing System (Enhanced Feature)
- **What it does**: Happy cats can bless the forest to accelerate tree growth, with enhanced effects from magical accessories
- **Why it matters**: Creates synergy between cat care, shop purchases, and forest growth, encouraging consistent engagement while adding magical elements
- **Success criteria**: Clear visual feedback, meaningful impact on tree growth, appropriate cost balancing with accessory bonuses

### Tree Planting & Forest Growth
- **What it does**: Users spend points to plant different tree types that grow over time in a realistic 2D side-view forest with multiple ground levels
- **Why it matters**: Provides long-term visual representation of productivity progress in an immersive forest landscape
- **Success criteria**: Varied tree types on different terrain heights, realistic growth progression, beautiful layered forest visualization with depth and natural elements

### Point Economy
- **What it does**: Paw Points earned from task completion can be spent on cat care (10 points for feeding, 5 for playing), tree planting (20-35 points), forest blessings (25 points, discounted to 20 with Magical Collar), or cat shop items (12-75 points)
- **Why it matters**: Creates meaningful choices and resource management with multiple investment paths
- **Success criteria**: Balanced costs that encourage diverse interactions and provide both immediate gratification and long-term goals

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Peaceful, nurturing, and gently motivating
- **Design Personality**: Friendly, organic, modern with natural elements
- **Visual Metaphors**: Growth, nature, companionship, gentle magic
- **Simplicity Spectrum**: Clean and minimal with warm, organic touches

### Color Strategy
- **Color Scheme Type**: Nature-inspired analogous colors with magical accent
- **Primary Color**: Forest green (oklch(0.45 0.15 142)) - represents growth and nature
- **Secondary Colors**: Warm cream and soft gray for backgrounds and cards
- **Accent Color**: Warm peach (oklch(0.75 0.15 85)) - for highlights and rewards
- **Magic Elements**: Purple gradients for special cat abilities
- **Color Psychology**: Green promotes calm focus, peach adds warmth and reward feeling
- **Foreground/Background Pairings**: Deep forest text on light cream backgrounds, white text on colored buttons

### Typography System
- **Font Pairing Strategy**: Single clean sans-serif (Inter) for consistency and readability
- **Typographic Hierarchy**: Clear size progression from large headers to small status text
- **Font Personality**: Modern, friendly, approachable
- **Readability Focus**: Generous line spacing and comfortable reading sizes

### Visual Hierarchy & Layout
- **Attention Direction**: Tab navigation guides users through the app flow
- **White Space Philosophy**: Generous spacing creates calm, uncluttered feeling
- **Grid System**: Card-based layout with consistent padding and gaps
- **Content Density**: Balanced - enough information without overwhelming

### Animations
- **Purposeful Meaning**: Gentle motion reinforces organic, living feel of the app
- **Cat Animations**: Scaling and rotation on interaction to show responsiveness
- **Tree Growth**: Staggered entrance animations and subtle hover effects
- **Forest Ambiance**: Subtle wildlife movement when forest reaches certain milestones

### UI Elements & Component Selection
- **Primary Components**: Cards for major sections, Tabs for navigation, Buttons for actions
- **Interactive Elements**: Hover effects on trees, scaling on button press, gradient buttons for special actions
- **Icon Strategy**: Phosphor icons for consistent, friendly iconography
- **Forest Layout**: Pseudo-random positioning for natural forest appearance
- **Blessing Effects**: Purple glow and sparkle effects for magical elements

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance maintained throughout
- **Interactive Elements**: Generous touch targets and clear focus states
- **Visual Feedback**: Multiple ways to communicate state (color, icons, text)

## Implementation Considerations
- **Data Persistence**: useKV for all user data (tasks, trees, cat state, points)
- **Growth Mechanics**: Time-based progression with cat blessing acceleration
- **Balance**: Point costs designed to encourage regular engagement without frustration
- **Scalability**: Forest layout adapts to any number of trees

## Key Enhancements Added
- **Hierarchical Task System**: Main tasks can now have subtasks that can be managed independently, with visual indentation and progress tracking
- **Smart Task Completion**: When all subtasks are completed, the parent task automatically completes
- **Subtask Progress Indicators**: Visual counters show completion status (e.g., "2/4" subtasks done)
- **Collapsible Task Tree**: Users can expand/collapse subtask views for better organization
- **Inline Subtask Addition**: Hover over any task to reveal a "+" button for quick subtask creation
- **Cat Forest Blessing**: Happy cats can spend 25 points to bless all trees, accelerating their growth by 20% per blessing
- **Visual Magic Effects**: Blessed trees show sparkles and purple glow
- **Enhanced Cat Messages**: References to magical abilities
- **Blessing Tracking**: Stats showing cat's magical contributions to forest growth