# 🚀 My Portfolio Website

Welcome to the repository for my personal portfolio website! This is where I showcase my skills, projects, and a bit of my personality through jaw-dropping 3D animations, slick interactions, and fluid motion. If you're into creative web design, you're in the right place.

![Portfolio Preview](https://github.com/daizuongkk/Portfolio/blob/main/public/assets/projects-screenshots/portfolio/landing.png?raw=true)

## 🔥 Features

- **3D Animations**: Custom-made interactive keyboard using Spline with skills as keycaps that reveal titles and descriptions on hover.
- **Slick Interactions**: Powered by GSAP and Framer Motion for smooth animations on scroll, hover, and element reveal.
- **Space Theme**: Particles on a dark background to simulate a cosmic environment, making the experience out of this world.
- **Real-time Features** ✨: Live chat, remote cursors, online users list, and typing indicators powered by Socket.IO
- **Responsive Design**: Fully responsive across all devices to ensure the best user experience.
- **Innovative Web Design**: Combining creativity with functionality to push the boundaries of modern web design.

## 🛠️ Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS, Shadcn, Aceternity UI
- **Animations**: GSAP, Framer Motion, Spline Runtime
- **Misc**: Resend, Socketio, Zod

## 🚀 Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/daizuongkk/Portfolio.git
   ```

2. Navigate to the project directory:

   ```bash
   cd Portfolio
   ```

3. Install dependencies:

   ```bash
   pnpm install
   # or npm install / yarn install
   ```

4. Configure environment variables (see [Socket.IO Setup Guide](./SOCKET_IO_SETUP.md)):

   ```bash
   cp .env.example .env.local
   ```

5. Run the development server with Socket.IO:

   ```bash
   pnpm dev:all
   ```

   This will start both:
   - Next.js dev server on http://localhost:3000
   - Socket.IO server on http://localhost:3001

   Or run them separately:

   ```bash
   # Terminal 1
   pnpm dev

   # Terminal 2
   pnpm server:dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the magic!

### 🔌 Socket.IO Features

This project includes real-time features powered by Socket.IO:

- **Live Chat**: Send and receive messages in real-time
- **Remote Cursors**: See where other users are moving their mouse
- **Online Users**: View a list of active users with their locations
- **Typing Indicators**: See when others are typing
- **User Profiles**: Customize your name, avatar, and color

For more details on Socket.IO setup and usage, see [SOCKET_IO_SETUP.md](./SOCKET_IO_SETUP.md).

## 🚀 Deployment

This site is deployed on Vercel. For your own deployment, follow these steps:

1. Push your code to a GitHub repository.
2. Connect your repository to Vercel.
3. Vercel will handle the deployment process.

## 🤝 Contributing

If you'd like to contribute or suggest improvements, feel free to open an issue or submit a pull request. All contributions are welcome!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
