# ERMS - Engineering Resource Management System

A full-stack web application for managing engineer resources, project assignments, and capacity planning. Built with React, Typescript, Node.js, Express, and MongoDB.

## 🚀 Features

- **Role-based Authentication**: Separate interfaces for engineers and managers
- **Engineer Management**: Track skills, seniority levels, and department allocation
- **Project Management**: Create and manage projects with skill requirements
- **Assignment System**: Allocate engineers to projects with capacity tracking
- **Real-time Capacity Visualization**: Visual charts showing engineer utilization
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🛠️ Tech Stack

### Frontend
- **React** with TypeScript
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI component library
- **React Router DOM** - Client-side routing
- **React Hook Form + Zod** - Form handling and validation
- **Recharts** - Data visualization
- **Axios** - HTTP client

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose 
- **JWT** - Authentication
- **Bcrypt.js** - Password hashing
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn package manager

## 🔧 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/Gayatri3012/Engineering-resource-management-system
cd ERMS
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the backend directory:
```env
MONGODB_URI=mongodb+srv://yourUsername:YourPassword@cluster0.mongodb.net/erms
JWT_SECRET=your-secret-key-here
PORT=5000
```

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

### 4. Database Setup

The project includes a seed script to populate the database with sample data.

From the backend directory, run:
```bash
node seedData.js
```

This will create:
- 1 Manager account: `manager@company.com` (password: `password123`)
- 5 Engineer accounts including:
  - `priya@example.com` (password: `password123`)
  - `raj@example.com` (password: `password123`)
  - `engineer@company.com` (password: `password123`)
  - And more sample engineers
- 3 Sample projects
- 6 Sample assignments

## 🚀 Running the Application

### Start the Backend Server
From the backend directory:
```bash
npm start
```
The backend server will start on `http://localhost:5000`

### Start the Frontend Development Server
From the frontend directory:
```bash
npm run dev
```
The frontend will be available at `http://localhost:5173`

## 📝 Available Scripts

### Backend Scripts
- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run build` - Install dependencies

### Frontend Scripts
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production


## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update engineer profile

### Engineers
- `GET /api/engineers` - Get all engineers
- `GET /api/engineers/:id/capacity` - Get engineer's available capacity


### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project (managers only)
- `PUT /api/projects/:id` - Update project


### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create new assignment
- `PUT /api/assignments/:id` - Update assignment
- `DELETE /api/assignments/:id` - Delete assignment


## 🏗️ Project Structure

```
ERMS/
├── backend/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── models/
│   │   ├── User.js          # User/Engineer model
│   │   ├── Project.js       # Project model
│   │   └── Assignment.js    # Assignment model
│   ├── controllers/
│   │   ├── authController.js          # Auth Controller
│   │   ├── engineersController.js     # Engineer Controller
│   │   ├── projectsController.js      # Project Controller
│   │   └── assignmentsController.js   # Assignment Controller
│   ├── routes/
│   │   ├── auth.js          # Authentication routes
│   │   ├── engineers.js     # Engineer routes
│   │   ├── projects.js      # Project routes
│   │   └── assignments.js   # Assignment routes
│   ├── .env                 # Environment variables
│   ├── seedData.js          # Database seed script
│   ├── server.js            # Express server setup
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable UI components
    │   ├── contexts/        # React contexts (auth, app state)
    │   ├── pages/           # Page components
    │   ├── utils/           # Utility functions and API client
    │   ├── App.tsx          # Main app component
    │   └── main.tsx         # Entry point
    ├── public/
    ├── index.html
    ├── vite.config.ts       # Vite configuration
    ├── tailwind.config.js   # Tailwind CSS configuration
    ├── tsconfig.json        # TypeScript configuration
    └── package.json
```

## 🔐 Authentication

The application uses JWT-based authentication. Tokens are stored in localStorage and automatically included in API requests via Axios interceptors.

### User Roles
- **Manager**: Can create projects, view all engineers, create assignments
- **Engineer**: Can view own profile, assigned projects, and update profile

## 🌐 Deployment

### Frontend Deployment (Vercel)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`

### Backend Deployment (Render/Heroku)
1. Set environment variables in your hosting platform
2. Ensure MongoDB connection string is properly configured
3. Deploy from the `backend` directory

### API Configuration
Update the API base URL in `frontend/src/utils/api.ts`:
```typescript
const api = axios.create({
  baseURL: 'YOUR_PRODUCTION_API_URL/api',
  // ...
});
```

## 🤖 AI Tools Used

This project was developed with assistance from the following AI tools:
- **Claude** - Code implementation, architecture decisions, and debugging
- **ChatGPT** - Code review, optimization suggestions, and best practices
- **GitHub Copilot** - Code completion and inline suggestions

## 🧠 AI-Assisted Development

### Which AI tools were used and how
- **Claude**: Primary development assistant for implementing features, solving complex problems, and architectural decisions
- **ChatGPT**: Used for code reviews, performance optimization
- **GitHub Copilot**: Real-time code suggestions and boilerplate code generation

### Specific examples of how AI accelerated development
- **React Component Architecture**: AI suggested component composition patterns that improved code reusability
- **API Route Implementation**: AI accelerated REST API development by generating consistent route handlers
- **Error Handling**: AI provided comprehensive error handling patterns across the application
- **Form Validation**: AI helped implement robust validation using Zod schemas

### Any challenges faced with AI-generated code and how they were resolved
- **Context Limitations**: Some AI suggestions lacked full context of the codebase. Resolution: Provided more specific prompts with relevant code snippets
- **Outdated Patterns**: Occasionally received suggestions using deprecated methods. Resolution: Specified version requirements and modern patterns
- **Over-engineering**: AI sometimes suggested overly complex solutions. Resolution: Requested simpler, more maintainable alternatives
- **Type Safety**: Initial AI suggestions sometimes had TypeScript issues. Resolution: Explicitly requested type-safe implementations
- **Free-tier limitations**: I did not have access to any Pro or paid AI plans. This sometimes restricted longer interactions, cut off code blocks mid-response, or caused latency

### Approach to validating and understanding AI suggestions

### Validation Process
1. **Code Review**: All AI-generated code was manually reviewed for logic, security, and maintainability
2. **Testing**: Implemented features were tested with various edge cases and scenarios
3. **Performance**: Monitored application performance to ensure AI suggestions didn't introduce bottlenecks
4. **Documentation**: Ensured all AI-assisted code was properly documented for future maintenance


## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Contact

For questions or support, please open an issue in the GitHub repository.