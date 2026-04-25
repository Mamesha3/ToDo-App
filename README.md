# ToDo App Client

A modern, feature-rich todo application built with Next.js, featuring real-time messaging, AI-powered todo generation, and collaborative sharing capabilities.

## Features

- **Todo Management**
  - Create, edit, delete, and complete todos
  - Set due dates with countdown timers
  - Filter todos by type (All, Created, Shared, Smart AI)
  - Bulk selection and deletion
  - Pagination for large todo lists

- **AI-Powered Features**
  - Smart Todo Generator: Generate todo lists from goals using AI
  - Special Todo: Create individual AI-generated todos
  - AI Chat Assistant: Get help with your todos and tasks
  - Daily limits on AI features

- **Collaboration**
  - Share todos with other users
  - View and manage shared todos
  - Real-time messaging with other users
  - Search for users and todos

- **User Experience**
  - Responsive design (mobile and desktop)
  - Smooth animations with Framer Motion
  - Toast notifications with different sounds for actions
  - Modern UI with Tailwind CSS and shadcn/ui components

## Tech Stack

- **Frontend Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui, Radix UI
- **State Management**: Redux Toolkit, TanStack Query
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios

## Prerequisites

- Node.js 18+ installed
- Backend server running (see [ToDo-Api](https://github.com/Mamesha3/ToDo-Api))
- PostgreSQL database configured

## Getting Started

1. **Install dependencies**

```bash
npm install
```

2. **Configure environment variables**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── app/              # Next.js app router pages
│   ├── add/          # Add todo page
│   ├── guest/        # Guest landing page
│   ├── image-generator/  # AI image generation
│   ├── login/        # Login page
│   ├── messages/     # Messaging system
│   ├── profile/      # User profile
│   ├── search/       # Search page
│   ├── signup/       # Signup page
│   └── smart-todos/  # Smart todo review page
├── components/       # Reusable components
│   ├── ChatBox.tsx   # Chat interface
│   ├── ConversationList.tsx
│   ├── todoList.tsx  # Todo list with pagination
│   └── ...
├── context/          # React context providers
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and API calls
└── component/        # Additional components
```

## API Integration

The client communicates with the backend API at `http://localhost:5000` by default. The API endpoints include:

- Authentication: `/api/auth/login`, `/api/auth/signup`
- Todos: `/api/todo/*`
- Messages: `/api/message/*`
- Users: `/api/user/*`
- Search: `/api/search/*`

## Key Features Explained

### Smart Todo Generation
Users can generate todo lists or individual todos using AI by providing a goal. The AI breaks down the goal into actionable tasks.

### Real-time Messaging
Built with Socket.io, allowing users to send and receive messages in real-time with other users.

### Todo Sharing
Users can share their todos with other users, who can then view and interact with them.

### Search Functionality
Search across personal todos and other users with case-insensitive partial matching.

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com/new):

```bash
npm run build
vercel
```

Make sure to set the `NEXT_PUBLIC_API_URL` environment variable to your production API URL.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC

## Links

- **Backend API**: [ToDo-Api](https://github.com/Mamesha3/ToDo-Api)
- **Next.js Documentation**: [https://nextjs.org/docs](https://nextjs.org/docs)

