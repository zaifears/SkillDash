<div align="center">
  <img src="public/skilldash-logo.png" alt="SkillDash Logo" width="120" />
  <h1>SkillDash</h1>
  <strong>The AI-Powered Skill Platform for Bangladesh's Youth</strong>
  <br/><br/>
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=nextdotjs" alt="Next.js"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-blue?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/github/license/zaifearsrepublic/skilldash?style=for-the-badge" alt="License"/>
</div>

---

SkillDash is an **all-in-one, AI-powered platform** to bridge the skill gap for university and college students in Bangladesh.  
We transform career preparation into an engaging, gamified journey—helping you convert academic knowledge into real skills and connecting you directly to economic opportunities.

---

## ✨ Core Features

| Feature               | Description |
|-----------------------|-------------|
| 🔍 **AI Skill Quest** | A personalized, interactive chat with our SkillDashAI analyzes your interests, aptitudes, and academic background through strategic questioning to reveal your hidden talents and suggest career paths tailored to Bangladesh's job market. Our intelligent system asks 5-10 targeted questions covering your passions, academic strengths, practical skills, work preferences, and career priorities to provide comprehensive career guidance. |
| <img src="public/coin/coin.png" alt="Coin" width="20" /> **Coin System** | A strategic resource management system that balances platform sustainability with user accessibility. Users need coins to access premium AI-powered career analysis features, ensuring quality service while maintaining affordability. The system encourages thoughtful engagement with career development tools and helps maintain platform resources for delivering high-quality AI insights. |
| 🎓 **Learn New Skills** | Access curated learning pathways and career courses specifically tailored to your Skill Quest results and the Bangladesh job market. Build job-ready skills that employers actually need, with content optimized for local industry requirements. Our skill development recommendations align with your personal strengths and market opportunities to maximize career impact. |
| 📄 **AI Resume Feedback** | Receive instant, actionable resume feedback from our AI Coach, specifically tailored for job openings in Bangladesh. Get detailed analysis of your resume's effectiveness, keyword optimization for local ATS systems, and specific suggestions for improvement based on industry standards and hiring manager preferences in the Bangladesh market. |
| 💼 **Find Opportunities** | Unlock exclusive access to a carefully curated portal of part-time jobs, internships, and freelance opportunities specifically relevant to students in Bangladesh. Build real-world experience while studying, develop your professional network, and gain practical skills that complement your academic learning for a stronger career foundation. |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **AI Models:** Google Gemini 2.0 Flash, Groq (GPT & Llama), Perplexity
- **Deployment:** Vercel
- **State Management:** React Context API

---

## 🚀 Getting Started

### **Prerequisites**

Make sure you have the following installed on your development machine:

- **[Node.js](https://nodejs.org/)** (v18.17.0 or later) - JavaScript runtime
- **[pnpm](https://pnpm.io/)** (recommended) - Fast, disk space efficient package manager
  ```
  npm install -g pnpm
  ```
- **Git** - Version control system
- A code editor like **[VS Code](https://code.visualstudio.com/)** (recommended)

### **Installation & Setup**

Follow these steps to get SkillDash running locally:

1. **Clone the repository:**
   ```
   git clone https://github.com/zaifearsrepublic/skilldash.git
   ```
   
2. **Navigate to the project directory:**
   ```
   cd skilldash
   ```

3. **Install project dependencies:**
   ```
   pnpm install
   ```
   This will install all required packages including Next.js, React, Tailwind CSS, and other dependencies.

4. **Set up environment variables:**
   ```
   cp .env.example .env.local
   ```
   Open `.env.local` and configure the following variables:
   ```
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   
   # AI Service APIs
   GOOGLE_API_KEY=your_google_gemini_api_key
   GROQ_API_KEY=your_groq_api_key
   PERPLEXITY_API_KEY=your_perplexity_api_key
   
   # Other Configuration
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```

5. **Start the development server:**
   ```
   pnpm dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000)

6. **Additional Development Commands:**
   ```
   # Build for production
   pnpm build
   
   # Start production server
   pnpm start
   
   # Run type checking
   pnpm type-check
   
   # Run linting
   pnpm lint
   
   # Format code
   pnpm format
   ```

### **Development Tips**

- **Hot Reload:** Changes to your code will automatically refresh the browser
- **TypeScript:** The project uses TypeScript for type safety - VS Code will highlight any type errors
- **Tailwind CSS:** Use Tailwind utility classes for styling - IntelliSense will help with autocompletion
- **Firebase:** Make sure your Firebase project has Firestore and Authentication enabled
- **AI APIs:** You'll need valid API keys from Google AI Studio, Groq, and Perplexity to test AI features

### **Troubleshooting**

- If you encounter dependency issues, try deleting `node_modules` and running `pnpm install` again
- For Firebase authentication issues, check your Firebase project configuration
- Ensure all required environment variables are properly set in `.env.local`
- Check the console and network tab in browser developer tools for debugging

---

## 🎯 Key Features Deep Dive

### 🔍 **AI Skill Quest**
Our flagship feature uses advanced AI conversation to understand your unique profile through strategic questioning. The system analyzes your responses across multiple dimensions - from creative projects you'd build to your academic strengths, practical skills comfort levels, work style preferences, and career priorities. Using insights from multiple AI models including Google Gemini 2.0 Flash, the system provides comprehensive career recommendations specifically tailored to Bangladesh's job market, including growing sectors like fintech, e-commerce, RMG, telecommunications, and emerging tech startups.

### <img src="public/coin/coin.png" alt="Coin" width="16" /> **Intelligent Resource Management**
The coin system ensures sustainable access to premium AI-powered career insights while maintaining platform quality. By requiring a minimal coin investment for comprehensive career analysis, we can provide deeper, more personalized AI processing that includes multi-model validation, extensive job market analysis, and detailed skill development roadmaps. This approach ensures that users receive high-value career guidance while supporting the platform's continued development and improvement of AI capabilities.

### 📄 **AI Resume Enhancement**
Our resume feedback system goes beyond basic grammar checking to provide strategic career advice. The AI analyzes your resume against specific job descriptions, checks for ATS compatibility with systems commonly used in Bangladesh, suggests keyword optimization for local job searches, and provides detailed formatting recommendations. The system understands local hiring practices and can suggest improvements that resonate with Bangladeshi employers across different industries, from traditional sectors to emerging tech companies.

### 💼 **Career Opportunity Pipeline**
The opportunities portal connects students with real-world experience through carefully vetted part-time positions, internships, and project-based work. We focus on opportunities that complement academic schedules while providing meaningful skill development. Our curation process ensures that listed opportunities offer genuine learning experiences, fair compensation, and potential for professional growth within Bangladesh's evolving job market.

---

## 🌟 Mission

**Bridging the skills gap in Bangladesh by making career development:**
- **Accessible** - Core features available with transparent resource requirements
- **Intelligent** - AI-powered insights tailored to local job market realities
- **Practical** - Real-world job market insights and actionable career guidance
- **Personalized** - Individual career recommendations based on your unique strengths and interests

---

## 🏆 About This Project

SkillDash is an innovative platform showcasing cutting-edge AI solutions for Bangladesh's youth development. This platform represents our vision of using artificial intelligence to solve real-world challenges in career development and skills gap bridging.

**Our Focus:**
- **Problem Statement:** Addressing unemployment and underemployment among university graduates in Bangladesh
- **AI Innovation:** Multi-model AI approach for personalized career guidance
- **Local Impact:** Tailored solutions for Bangladesh's unique job market landscape
- **Scalable Solution:** Built to serve thousands of students across the country

**Empowering Bangladesh's youth from classroom to career!** 🇧🇩

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <strong>🚀 Ready to discover your career potential?</strong><br/>
  <em>Join thousands of Bangladesh's students already building their future with SkillDash!</em>
</div>
```
