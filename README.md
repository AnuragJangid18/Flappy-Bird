# 🐦 Flappy Bird Game

A browser-based clone of the classic Flappy Bird game built with pure HTML5 Canvas and JavaScript. Features smooth animations, responsive controls, and a clean modern design with light/dark theme support.

![Game Screenshot](screenshot.png) <!-- Add your own screenshot -->

## 🎮 Game Overview

Navigate a bird through endless pipes by timing your jumps perfectly. Tap or press space to make the bird flap and avoid obstacles. The game gets progressively challenging as you advance!

## ✨ Features

- **Smooth Canvas Animations** - 60 FPS gameplay with fluid bird physics
- **Realistic Physics** - Gravity, velocity, and rotation mechanics
- **Scoring System** - Track your current score and best score
- **Responsive Design** - Works on desktop and mobile devices
- **Theme Support** - Automatic light/dark mode based on system preferences
- **Easy Controls** - Click, tap, or press spacebar to play
- **Game States** - Start screen, active gameplay, and game over states
- **Visual Polish** - Gradient sky background, animated bird with wing and beak details

## 🎯 How to Play

1. **Start**: Click "Start Game" or press any key
2. **Flap**: Click/tap anywhere or press SPACE to make the bird jump
3. **Avoid**: Navigate through the gaps between green pipes
4. **Score**: Earn 1 point for each pipe successfully passed
5. **Restart**: Click "Restart" when game ends to try again

## 🕹️ Controls

| Input | Action |
|-------|--------|
| **Mouse Click** | Make bird flap |
| **Spacebar** | Make bird flap |
| **Touch/Tap** | Make bird flap (mobile) |
| **Start Button** | Begin new game |
| **Restart Button** | Restart after game over |

## 🛠️ Technical Stack

- **HTML5** - Page structure and Canvas element
- **CSS3** - Styling with CSS custom properties and responsive design
- **Vanilla JavaScript** - Game logic, physics, and rendering
- **Canvas API** - 2D graphics rendering

## 🎨 Game Mechanics

### Bird Physics
- **Gravity**: 0.12 units/frame
- **Jump Force**: -3.5 units
- **Rotation**: Dynamic based on velocity (-30° to 90°)
- **Dimensions**: 34×24 pixels

### Pipe System
- **Width**: 60 pixels
- **Gap**: 150 pixels between top and bottom pipes
- **Speed**: 2.5 pixels/frame
- **Spawn Rate**: New pipe every ~90 frames

### Scoring
- **+1 point** for each pipe successfully passed
- **Best Score** saved during session
- Real-time score display during gameplay

## 🚀 Getting Started

### Prerequisites
- Any modern web browser (Chrome, Firefox, Safari, Edge)
- No additional dependencies or installations required

### Installation

1. **Clone the repository**

2. **Open the game**

3. **Start playing!**

## 📁 Project Structure


## 🎨 Color Theme

The game uses a modern color palette with theme support:

**Light Mode:**
- Background: Cream (#fcfcf9)
- Primary: Teal (#21808d)
- Sky Gradient: Light blue to cyan

**Dark Mode:**
- Background: Charcoal (#1f2121)
- Primary: Teal (#32b8c6)
- Sky Gradient: Adjusted for dark theme

## 🔧 Customization

You can easily modify game parameters by editing the JavaScript constants:


## 🐛 Known Issues

- None currently reported

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Future Enhancements

- [ ] Sound effects and background music
- [ ] Multiple difficulty levels
- [ ] Power-ups and obstacles variety
- [ ] Local storage for persistent high scores
- [ ] Leaderboard system
- [ ] Mobile-optimized touch controls
- [ ] Particle effects for collisions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Inspired by the original Flappy Bird by Dong Nguyen
- Built as a learning project for HTML5 Canvas and game development
- Design system inspired by modern web UI frameworks

## 📧 Contact

Your Name - [https://x.com/AnuragJang40094]

Project Link: [https://github.com/AnuragJangid18/Flappy-Bird]

---

**Enjoy the game! 🎮 Happy flapping! 🐦**