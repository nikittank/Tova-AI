# Tova-AI

**Live Demo Links:**
- **Vercel (Frontend 1):** [https://tova-ai.vercel.app/](https://tova-ai.vercel.app/)
- **Netlify (Frontend 2):** [https://tova-ai.netlify.app/](https://tova-ai.netlify.app/)
- **Render (Backend):** [https://tova-ai-backend.onrender.com/](https://tova-ai-backend.onrender.com/)

> Note: Two frontend versions are hosted (on Vercel and Netlify) for testing and deployment comparison. Both connect to the same backend hosted on Render.


<img width="1918" height="891" alt="Screenshot 2025-10-24 145624" src="https://github.com/user-attachments/assets/d96b3774-8435-493e-9d3f-2f98824ea9f2" />

Tova AI - Intelligent Database Assistant

An AI-powered application that converts natural language into precise SQL queries, delivering instant and accurate database results without the need for manual coding.

## Features

- **Natural Language to SQL**: Convert plain English questions into optimized SQL queries instantly with AI precision
- **Interactive Schema Explorer**: Visualize and navigate your database structure with beautiful, interactive diagrams
- **Performance Optimization**: Get intelligent suggestions to optimize query performance and database efficiency
- **Smart Query Assistant**: Context-aware AI that learns from your patterns and suggests better approaches

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express.js
- **Database**: MySQL support
- **AI Integration**: Natural language processing for SQL generation

## Getting Started

<img width="1916" height="885" alt="Screenshot 2025-10-24 145657" src="https://github.com/user-attachments/assets/f89372b6-b528-44a2-83d4-5a5d9cd939f6" />

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MySQL database

### Installation

1. Clone the repository
```bash
git clone https://github.com/nikittank/Tova-AI.git
cd Tova-AI
```

2. Install dependencies for both client and server
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

3. Set up environment variables
```bash
# Create .env file in server directory
cp .env.example .env
# Edit .env with your database credentials
```

4. Start the development servers
```bash
# Start server (from server directory)
npm start

# Start client (from client directory)
npm start
```

## Usage


<img width="1921" height="1280" alt="screencapture-localhost-3000-2025-10-23-22_11_46" src="https://github.com/user-attachments/assets/b4328bdd-f9c2-451e-938d-9449fd83439a" />

<img width="1921" height="894" alt="screencapture-localhost-3000-2025-10-23-22_12_30" src="https://github.com/user-attachments/assets/f1c184e6-fe5d-474c-8982-2d50cc9c4479" />

<img width="1921" height="1046" alt="screencapture-localhost-3000-2025-10-23-22_13_38" src="https://github.com/user-attachments/assets/4623a904-adfb-459e-9aa1-2d276d80207d" />

<img width="1921" height="894" alt="screencapture-localhost-3000-2025-10-23-22_17_00" src="https://github.com/user-attachments/assets/acac886f-1925-427c-8cc7-b937f6d850b1" />

1. Open your browser and navigate to `http://localhost:3000`
2. Connect to your database using the connection form
3. Start asking questions in natural language
4. Watch as Tova AI converts your questions to SQL and executes them

To connect you database to TOVA AI 

<img width="602" height="395" alt="image" src="https://github.com/user-attachments/assets/b55fef74-722c-46f9-ae02-dc1efa883709" />

<img width="1108" height="416" alt="image" src="https://github.com/user-attachments/assets/91b5b789-7257-4e78-b822-2967aa63277b" />

