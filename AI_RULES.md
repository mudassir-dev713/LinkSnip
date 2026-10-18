# AI Development Rules for LinkSnip

## Tech Stack Overview

- **Frontend Framework**: Next.js 13+ with App Router for server-side rendering and static generation
- **Styling**: Tailwind CSS with shadcn/ui components for consistent, responsive design
- **State Management**: React Context API for simple state, React Query for server state
- **Authentication**: NextAuth.js for authentication with credentials and OAuth providers
- **Database**: MongoDB with Mongoose ODM for data modeling
- **API Layer**: Next.js API routes with proper error handling and validation
- **Validation**: Zod for schema validation on forms and API endpoints
- **UI Components**: Radix UI primitives with Tailwind styling through shadcn/ui
- **Analytics**: Custom analytics dashboard with charting components
- **Deployment**: Vercel with automatic optimizations

## Library Usage Rules

### ✅ Approved Libraries

- **UI Components**: Use shadcn/ui components exclusively for UI elements
- **Icons**: Use `lucide-react` for all icons throughout the application
- **Forms**: Use `react-hook-form` with `zod` validation for all forms
- **State Management**: Use React Query for server state, React Context for simple client state
- **Animations**: Use `framer-motion` for page transitions and micro-interactions
- **Charts**: Use `recharts` for data visualization in analytics
- **Date Handling**: Use `date-fns` for all date manipulations
- **HTTP Client**: Use native `fetch` API with React Query for data fetching

### ❌ Prohibited Libraries

- **UI Libraries**: No Material-UI, Ant Design, or other heavy UI frameworks
- **State Management**: No Redux unless absolutely necessary for complex global state
- **Styling**: No styled-components, emotion, or CSS-in-JS solutions
- **Routing**: No React Router - use Next.js built-in routing
- **Form Libraries**: No Formik - use react-hook-form exclusively

### 🎨 Design System Rules

- Always use shadcn/ui components when available
- Follow the existing color palette defined in `tailwind.config.js`
- Maintain consistent spacing using Tailwind's spacing scale
- Use only the defined border radius values (sm, md, lg)
- Implement dark mode support for all components using `next-themes`

### 📱 Responsive Design Rules

- Mobile-first approach using Tailwind's responsive breakpoints
- All components must work on mobile, tablet, and desktop
- Use flexbox and grid for layouts instead of absolute positioning
- Touch targets should be minimum 44px for mobile usability

### ⚡ Performance Rules

- Use React Server Components where appropriate
- Implement proper loading states with Suspense
- Optimize images with Next.js Image component
- Use dynamic imports for heavy components
- Implement code splitting for large libraries

### 🔐 Security Rules

- Always validate and sanitize user inputs
- Use Zod for all data validation
- Implement proper authentication checks for protected routes
- Never expose sensitive data to client-side code
- Use environment variables for secrets

### 🧪 Testing Rules

- Write unit tests for utility functions
- Implement integration tests for API routes
- Use Playwright for end-to-end testing
- Test both light and dark mode UIs
- Ensure accessibility compliance with axe-core

### 📚 Documentation Rules

- All new components must have JSDoc comments
- Complex functions require inline comments
- Update this file when adding new approved libraries
- Document breaking changes in PR descriptions