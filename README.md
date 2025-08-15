# Tabletop Dice Roller

A 3D dice rolling application for tabletop games like D&D, built with Three.js and vanilla JavaScript.

## Features

- **Multiple Dice Types**: d20, d12, d10, d%, d8, d6, d4, d2
- **3D Physics**: Realistic dice rolling with physics simulation
- **Mobile-First Design**: Optimized for touch devices
- **Advanced Roll Management**: 
  - Select individual dice for rerolling
  - Remove specific dice from totals
  - Detailed result tracking
- **Intuitive Controls**:
  - Tap to add dice
  - Hold to reset dice count
  - Visual feedback and animations

## Quick Start

1. Open `index.html` in a modern web browser
2. Tap dice icons on the sides to select dice
3. Click "Roll Dice" to roll your selection
4. View detailed results and manage your rolls

## Project Structure

```
dice-app/
├── index.html              # Main application
├── css/
│   └── styles.css          # Main styles
├── js/
│   ├── main.js            # Application entry point
│   ├── DiceManager.js     # Dice state management
│   ├── DiceRenderer3D.js  # 3D rendering with Three.js
│   ├── UIController.js    # UI interaction handling
│   └── utils.js           # Utility functions
├── DICE_APP_ARCHITECTURE.md # Detailed architecture documentation
└── README.md              # This file
```

## Technologies Used

- **Three.js** - 3D graphics and rendering
- **Cannon.js** - Physics simulation
- **Vanilla JavaScript** - Core application logic
- **CSS3** - Responsive design and animations
- **HTML5** - Semantic structure

## Controls

### Desktop
- **Click** dice icons to add dice
- **Mouse down + hold** dice icons to reset count
- **Click** individual results to select for reroll/remove

### Mobile
- **Tap** dice icons to add dice
- **Touch + hold** dice icons to reset count
- **Tap** individual results to select for reroll/remove

## Architecture

The application follows a modular architecture with clear separation of concerns:

- **DiceManager**: Handles dice state, rolling logic, and results calculation
- **DiceRenderer3D**: Manages 3D scene, physics, and animations
- **UIController**: Handles user interactions and UI updates
- **Main App**: Coordinates all components and handles initialization

See `DICE_APP_ARCHITECTURE.md` for detailed technical documentation.

## Browser Support

- Modern browsers with WebGL support
- Mobile browsers (iOS Safari, Android Chrome)
- Progressive Web App features for offline use

## Development

The application is built with vanilla JavaScript modules and requires no build process. Simply serve the files from a web server or open `index.html` directly.

For development, you may want to use a local server:
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# Or any other static file server
```

## Future Enhancements

- Custom dice textures and materials
- Sound effects and haptic feedback
- Dice roll history and statistics
- Multiplayer functionality
- Game-specific presets (D&D 5e, Pathfinder, etc.)
- Accessibility improvements

## License

MIT License - feel free to use and modify for your projects.