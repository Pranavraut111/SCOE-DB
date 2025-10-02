# SCOE Frontend

React-based frontend application for the SCOE Database Management System.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 📁 Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AdminLayout.tsx
│   ├── BulkUpload.tsx
│   ├── ExamDashboard.tsx
│   ├── StudentList.tsx
│   └── ...
├── pages/              # Page components
│   ├── AdminDashboard.tsx
│   ├── Index.tsx
│   └── NotFound.tsx
├── lib/                # Utility libraries
│   ├── api.ts          # API client
│   └── utils.ts        # Helper functions
├── hooks/              # Custom React hooks
├── types/              # TypeScript definitions
└── main.tsx           # Application entry point
```

## 🛠️ Tech Stack

- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **shadcn/ui** for UI components
- **React Router** for navigation
- **Axios** for API calls

## 🌐 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🔗 API Integration

The frontend communicates with the FastAPI backend running on `http://localhost:8000`.

API endpoints are defined in `src/lib/api.ts`.
