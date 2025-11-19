# Galactic Defender: Omega 🚀

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Built With](https://img.shields.io/badge/Built%20With-Gemini%203%20Pro-8E44AD.svg)

**Galactic Defender: Omega** is a modern, high-octane space shooter that reimagines the classic arcade experience for the modern web. Featuring neon-soaked visuals, a pumping synth-style audio system (generated in real-time!), and intense wave-based combat.

## 🎮 Gameplay Features

*   **Intense Space Combat**: Battle against waves of alien invaders with smooth, physics-based movement.
*   **Diverse Enemies**: Face off against agile Scouts, heavy Fighters, and massive Boss capital ships.
*   **Epic Boss Fights**: Every 5th wave features a Boss battle. Defeating it triggers a cinematic chain-reaction that wipes out all remaining enemies.
*   **Modern Visuals**: Parallax scrolling starfields, particle explosion effects, and a sleek glassmorphism UI with cyberpunk aesthetics.
*   **Synthesized Audio**: No external sound files! All sound effects (lasers, explosions, impacts) are generated procedurally using the **Web Audio API** for that authentic retro crunch.
*   **Auto-Pilot Mode (AI)**: Watch the game play itself! A built-in AI can take control of your ship to dodge bullets and hunt enemies with superhuman precision.

## 🕹️ Controls

| Key | Action |
| :--- | :--- |
| **W / A / S / D** or **Arrows** | Move Ship |
| **SPACE** | Fire Lasers |
| **ESC** | Pause / Resume Game |
| **M** | Mute / Unmute Audio |
| **Alt + C** | Toggle **Auto-Pilot (Cheat Mode)** |

## 🤖 Built with Gemini 3 Pro

This entire project—from the architectural design and game logic to the CSS styling and even the asset generation prompts—was built using **Google's Gemini 3 Pro**.

The development process was incredibly fluid:
1.  **Conceptualization**: We started with a simple idea: "Modernize Space Invaders."
2.  **Iterative Coding**: Gemini wrote the modular ES6 JavaScript code, handling complex logic like the game loop, collision detection, and state management.
3.  **Asset Generation**: The game assets were generated on the fly based on Gemini's descriptions.
4.  **Feature Expansion**: We added advanced features like the **AI Auto-Pilot** and **Web Audio System** simply by asking for them.

It demonstrates the power of next-gen AI in accelerating software development, turning natural language requests into a polished, playable product in record time.

## ⚡ The "Mega Prompt"

Want to recreate this magic? Below is the **"Golden Prompt"**—a single, comprehensive instruction that encapsulates the requirements for this entire application. You can feed this into Gemini 3 Pro to kickstart a similar project:

> **"Create a modern, professional-grade Space Invaders clone called 'Galactic Defender: Omega' using HTML5 Canvas and Vanilla JavaScript. The game should feature a modular, class-based architecture (Game, Entity, Player, Enemy, Bullet, Particle, UIManager, AudioManager, InputHandler).**
>
> **Key Requirements:**
> 1.  **Visuals**: Dark Cyberpunk/Sci-Fi aesthetic. Use 'screen' blend modes for sprites to handle transparency. Implement a robust particle system for explosions. Add a parallax scrolling star background.
> 2.  **Gameplay**: Smooth delta-time based movement. Wave progression system with increasing difficulty. A Boss fight every 5 waves; when the Boss dies, trigger a cinematic chain-reaction explosion that destroys all other enemies.
> 3.  **Controls**: WASD/Arrows to move, Space to shoot, ESC to pause (with a menu), M to mute.
> 4.  **Audio**: Implement a custom `AudioManager` using the **Web Audio API** to synthesize retro sound effects (lasers, explosions, hits) programmatically. Do not use external audio files.
> 5.  **AI Auto-Pilot**: Add a 'Cheat Mode' toggled via `Alt+C`. When active, the Player ship should be controlled by an AI that perfectly tracks enemies and dodges incoming fire.
> 6.  **UI**: Create a modern HTML/CSS overlay for the HUD (Score, Wave, HP), Start Screen, Game Over, Victory, and Pause Menu. Use 'glitch' text effects and glassmorphism styling.
> 7.  **Assets**: Generate high-quality sprite assets for: Player Ship, Enemy Scout, Enemy Fighter, Boss Ship, and Background Stars."

---

*Generated with ❤️ by Gemini 3 Pro*
