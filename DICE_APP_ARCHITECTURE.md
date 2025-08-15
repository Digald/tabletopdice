# Dice Rolling App Architecture

## Project Context
- **Project Type**: Progressive Web App (PWA) for tabletop gaming
- **Main Technologies**: HTML5, CSS3, JavaScript (ES6+), Three.js for 3D rendering
- **Key Dependencies**: 
  - Three.js (3D graphics engine)
  - Cannon.js or Ammo.js (physics engine for realistic dice rolling)
  - Web Audio API (for dice rolling sounds - future enhancement)

## Task Description
**What I need help with**: Build a comprehensive dice rolling application for tabletop games like D&D with realistic 3D dice physics, intuitive UI, and detailed roll tracking.

**Expected Outcome**: A responsive web application that allows users to select multiple dice types, roll them with realistic 3D physics, track individual and group results, and manage dice pools with advanced features like selective rerolling.

## Technical Requirements
- **Programming Language(s)**: JavaScript (ES6+), HTML5, CSS3
- **Framework/Library Constraints**: Vanilla JS with Three.js for 3D rendering
- **Code Style Preferences**: Modular ES6 classes, functional programming patterns where appropriate
- **Performance Requirements**: 60fps during dice animations, responsive on mobile devices
- **Browser/Platform Support**: Modern browsers (Chrome, Firefox, Safari, Edge), mobile-first design

## Architecture Overview

### Core Components

#### 1. DiceManager Class
**Responsibility**: Manages dice selection, quantities, and state
```javascript
class DiceManager {
  constructor() {
    this.dicePool = {
      d20: { count: 0, results: [] },
      d12: { count: 0, results: [] },
      d10: { count: 0, results: [] },
      d100: { count: 0, results: [] }, // d%
      d8: { count: 0, results: [] },
      d6: { count: 0, results: [] },
      d4: { count: 0, results: [] },
      d2: { count: 0, results: [] }
    };
  }
  
  addDice(type, count = 1) { /* ... */ }
  removeDice(type, count = 1) { /* ... */ }
  resetDice(type) { /* ... */ }
  getDicePool() { /* ... */ }
}
```

#### 2. DiceRenderer3D Class
**Responsibility**: Handles all 3D rendering using Three.js
```javascript
class DiceRenderer3D {
  constructor(container) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();
    this.renderer = new THREE.WebGLRenderer();
    this.diceObjects = [];
    this.physics = new PhysicsEngine(); // Wrapper for physics engine
  }
  
  createDiceGeometry(sides) { /* Generate dice mesh based on sides */ }
  rollDice(dicePool) { /* Animate dice rolling with physics */ }
  updateDicePositions() { /* Update positions from physics */ }
}
```

#### 3. UIController Class
**Responsibility**: Manages user interface interactions
```javascript
class UIController {
  constructor(diceManager, renderer) {
    this.diceManager = diceManager;
    this.renderer = renderer;
    this.setupEventListeners();
  }
  
  setupEventListeners() { /* Touch/click handlers for dice buttons */ }
  updateDiceCountDisplay() { /* Update UI with current dice counts */ }
  displayResults(results) { /* Show roll results and totals */ }
  handleDiceSelection(type, action) { /* Handle add/remove/reset dice */ }
}
```

#### 4. ResultsManager Class
**Responsibility**: Calculates and manages roll results
```javascript
class ResultsManager {
  constructor() {
    this.rollHistory = [];
  }
  
  calculateResults(diceResults) { /* Calculate individual and total results */ }
  saveRoll(rollData) { /* Save roll to history */ }
  rerollSpecificDice(diceIndices) { /* Handle selective rerolling */ }
  removeDiceFromResults(diceIndices) { /* Remove dice from totals */ }
}
```

### File Structure
```
dice-app/
├── index.html              # Main HTML file
├── css/
│   ├── styles.css          # Main styles
│   ├── dice-ui.css         # Dice selection UI
│   └── results.css         # Results display styles
├── js/
│   ├── main.js             # Application entry point
│   ├── DiceManager.js      # Dice state management
│   ├── DiceRenderer3D.js   # 3D rendering logic
│   ├── UIController.js     # UI interaction handling
│   ├── ResultsManager.js   # Results calculation
│   ├── PhysicsEngine.js    # Physics wrapper
│   └── utils.js            # Utility functions
├── assets/
│   ├── models/             # 3D dice models (if using external models)
│   ├── textures/           # Dice textures (future feature)
│   └── sounds/             # Audio files (future feature)
└── service-worker.js       # PWA service worker
```

## Feature Implementation Details

### 1. Dice Selection Interface
- **Layout**: Pinned dice icons on left/right sides of screen
- **Interaction**: 
  - Tap to add dice
  - Hold to reset count to zero
  - Visual feedback showing current count
- **Responsive**: Adapts to mobile and desktop

### 2. 3D Dice Rolling
- **Technology**: Three.js + physics engine (Cannon.js recommended)
- **Dice Geometry**: Procedurally generated or imported 3D models
- **Physics**: Realistic tumbling with collision detection
- **Animation**: Smooth 60fps rolling animation

### 3. Results System
- **Individual Results**: Show each die result
- **Group Totals**: Sum per dice type (e.g., "2d20 total: 31")
- **Grand Total**: Sum of all dice rolled
- **History**: Track previous rolls

### 4. Advanced Features
- **Selective Reroll**: Click individual dice to mark for reroll
- **Dice Removal**: Remove specific dice from totals
- **Continuous Selection**: Add more dice between rolls

## Technical Implementation Strategy

### Phase 1: MVP Core Features
1. Basic HTML structure and CSS layout
2. Simple dice selection UI (no 3D yet)
3. Mathematical dice rolling (random numbers)
4. Results calculation and display

### Phase 2: 3D Integration
1. Three.js setup and basic scene
2. Simple cube dice with basic physics
3. Integration with dice selection system
4. Animation and visual feedback

### Phase 3: Enhanced Features
1. Proper dice geometries for different types
2. Advanced physics and collision
3. Selective rerolling system
4. Dice removal functionality

### Phase 4: Polish & Future Features
1. Textures and visual enhancements
2. Sound effects
3. Roll history and statistics
4. Custom dice sets and themes

## 3D Implementation Options

### Option 1: Procedural Generation (Recommended for MVP)
- Generate dice meshes programmatically in Three.js
- Pros: No external dependencies, customizable
- Cons: More complex geometry for non-cubic dice

### Option 2: 3D Model Files
- Import .obj, .gltf, or .fbx dice models
- Pros: High-quality, detailed models
- Cons: Larger file sizes, external dependencies

### Dice Geometries
- **d4**: Tetrahedron (4 triangular faces)
- **d6**: Cube (6 square faces)
- **d8**: Octahedron (8 triangular faces)
- **d10/d%**: Pentagonal trapezohedron
- **d12**: Dodecahedron (12 pentagonal faces)
- **d20**: Icosahedron (20 triangular faces)
- **d2**: Coin/cylinder

## Performance Considerations
- **Object Pooling**: Reuse dice objects to minimize garbage collection
- **LOD (Level of Detail)**: Reduce dice complexity when far from camera
- **Physics Optimization**: Limit physics calculations when dice settle
- **Mobile Performance**: Reduce particle effects, optimize textures

## Testing Strategy
- **Unit Tests**: Core logic (DiceManager, ResultsManager)
- **Integration Tests**: UI interactions and 3D rendering
- **Device Testing**: iOS/Android performance testing
- **Accessibility**: Screen reader support, keyboard navigation

## Future Enhancements
1. **Multiplayer**: Share rolls with other players
2. **Dice Customization**: Colors, materials, engravings
3. **Game Integration**: D&D 5e spell save calculations
4. **Statistics**: Roll analysis and probability tracking
5. **Presets**: Save common dice combinations
6. **Themes**: Different visual styles and environments

## Constraints & Preferences
- **What to avoid**: Heavy frameworks, complex build processes for MVP
- **Must use existing**: Standard web technologies, Three.js ecosystem
- **Testing requirements**: Manual testing for MVP, automated tests for production
- **Documentation needs**: Code comments, API documentation

## Mobile-First Considerations
- **Touch Interactions**: Tap, hold, swipe gestures
- **Screen Space**: Optimize for small screens
- **Performance**: Battery and CPU efficiency
- **Offline Support**: PWA capabilities for offline use

---

**Implementation Priority:**
1. Core functionality without 3D
2. Basic 3D integration
3. Advanced features and polish
4. Future enhancements