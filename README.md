# Physarum Mold Simulation
This project implements a Physarum mold simulation, inspired by the paper "Characteristics of pattern formation and evolution in approximations of Physarum transport networks."


# Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


# Key Features:
Developed with TypeScript: Wrapped in a React component for seamless integration.
Next.js, Three.js, and WebGL: Utilized to create an interactive and visually dynamic simulation.
Simulation Overview:
In this simulation, individual slime mold cells are represented as particles:

- Particle movement: Each frame, particles sample three positions ahead (front, front-left, and front-right). Depending on the color value in each sample, the particle adjusts its movement direction (straight, left, or right).
- Random movement: Particles have a chance to move in a random direction for more organic patterns.
- Trail system: As particles move, they leave behind a trail that diffuses and decays over time. This trail serves as the input for future particle movement.
- Species interactions: The simulation supports up to three species that can infect one another, adding complexity and variety to the pattern formations.

# Acknowledgements:
Special thanks to [\[this repo\]](https://github.com/Bewelge/Physarum-WebGL?tab=readme-ov-file) for inspiration. 


