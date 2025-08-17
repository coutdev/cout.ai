# Project Features
- Login page
- Create account page
- Forgot password page
- Generic home page
- Working ChatGPT API
- Saved chat sessions in side bar
- Profile page
- Admin portal
- Admin new account approval system
- Light/dark modes
- Theme color picker 


# Project Setup

## In the CMD, navigate to the folder you want to create the project
For my example, my folder path is "C:\Users\Coots\CodingProjects\AI"  
cd C:\Users\Coots\CodingProjects\AI

## Initialize Git
git init

## Clone repo
git clone https://github.com/coutdev/cout.ai.git

---

# Frontend Setup

## Navigate to cout-ai folder
cd C:\Users\Coots\CodingProjects\AI\cout.ai\cout-ai

## Update .env file
Open the .env.local.example file and add your Supabase URL and Anon Key (found in Supabase), save file.  
Once done, update the file to be named ".env.local"  

## Install Next.JS
In cmd:  
cd C:\Users\Coots\CodingProjects\AI\cout.ai\cout-ai  
npm install  
npm audit fix  

## Start the Frontend Server
npm run dev

---

# Backend Setup

## Prerequisites
- Python 3.8 or higher
- OpenAI API key
- Supabase project credentials

## Update .env.example
Open the file "env.example" and Input your OpenAI API key and Supabase keys. Save file  
Rename the file to file to .env

## Open new CMD window, navigate to backend folder
cd C:\Users\Coots\CodingProjects\AI\cout.ai\cout-ai\backend

## Create virtual environment
python -m venv cout_venv

## Navigate to scripts folder
cd C:\Users\Coots\CodingProjects\AI\cout.ai\cout-ai\backend\cout_venv\Scripts

## Activate environment
activate

## Go back to backend folder
cd C:\Users\Coots\CodingProjects\AI\cout.ai\cout-ai\backend

## Install requirements
pip install -r requirements.txt py

## Start Backend server
python run.py

--

# In your browser:  
Go to http://localhost:3000/ to test the frontend
Go to http://localhost:8000/ to test the backend



