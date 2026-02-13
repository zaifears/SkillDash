<div align="center">

  <img src="public/skilldash-logo.png" alt="SkillDash Logo" width="140" />

  <h1>SkillDash Simulator</h1>

  <h3>The Ultimate AI-Powered Stock Market Simulation for DSE</h3>

  <br/>

  <a href="https://skilldash.live/simulator"><img src="https://img.shields.io/badge/🚀_Live_Demo-skilldash.live-8b5cf6?style=for-the-badge" alt="Live Demo"/></a>
  <a href="https://github.com/zaifears/SkillDash/releases/download/v1.0.0-simulator/SkillDash.Simulator.apk"><img src="https://img.shields.io/badge/📱_Download-APK-34D399?style=for-the-badge" alt="Download APK"/></a>

  <br/><br/>

  <img src="https://img.shields.io/badge/Next.js-16-000000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js"/>
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS"/>
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase"/>
  <img src="https://img.shields.io/badge/PWA-Ready-FF6F00?style=flat-square&logo=pwa&logoColor=white" alt="PWA"/>
  <img src="https://img.shields.io/github/license/zaifears/SkillDash?style=flat-square&color=green" alt="License"/>

  <br/><br/>

  <em>Master the Dhaka Stock Exchange risk-free. Powered by AI insights & real-time data sync.</em>

</div>

<br/>

---

<br/>

SkillDash Simulator is a **state-of-the-art, risk-free environment** designed to master the Dhaka Stock Exchange (DSE). Powered by advanced AI insights and real-time data sync, it transforms complex market dynamics into an engaging, gamified experience for both students and aspiring investors.

<br/>

## 📱 Download the App

> Experience the full native power of the Simulator with our standalone Android application.

<div align="center">
  <br/>
  <a href="https://github.com/zaifears/SkillDash/releases/download/v1.0.0-simulator/SkillDash.Simulator.apk">
    <img src="https://img.shields.io/badge/📥_Download_SkillDash_Simulator-APK-8b5cf6?style=for-the-badge&logoColor=white" alt="Download APK" />
  </a>
  <br/><br/>
</div>

| | |
|---|---|
| **Latest Release** | `v1.0.0` (Simulator Pivot) |
| **Features** | Offline Support · Native TWA Wrapper · No Browser Header · Fast Performance |
| **Requirements** | Android 8.0+ |

<br/>

---

<br/>

## 📈 Flagship Product: Stock Simulator

<table>
  <tr>
    <td width="60"><strong>🚀</strong></td>
    <td><strong>Real-time DSE Sync</strong></td>
    <td>Automated synchronization with Dhaka Stock Exchange data, including live price tracking and volume analysis.</td>
  </tr>
  <tr>
    <td><strong>📅</strong></td>
    <td><strong>Market Calendar</strong></td>
    <td>Integrated holiday and market-hour tracking specific to Bangladesh for realistic trading sessions.</td>
  </tr>
  <tr>
    <td><strong>🤖</strong></td>
    <td><strong>Maira AI Assistant</strong></td>
    <td>Context-aware AI financial advisor providing personalized insights, portfolio reviews, and market sentiment analysis.</td>
  </tr>
  <tr>
    <td><strong>🏆</strong></td>
    <td><strong>Gamified Leaderboards</strong></td>
    <td>Compete with peers, climb the ranks, and earn prestige through smart virtual investing.</td>
  </tr>
  <tr>
    <td><strong>💾</strong></td>
    <td><strong>Offline Mode</strong></td>
    <td>Custom service worker logic keeps the simulator functional even with poor connectivity.</td>
  </tr>
</table>

<br/>

---

<br/>

## ✨ Additional Ecosystem Features

While the Simulator is our core product, SkillDash continues to provide essential career readiness tools:

| | Feature | Description |
|:-:|---|---|
| 🔍 | **AI Skill Quest** | Discover your career path through interactive, AI-driven aptitude analysis. |
| 📄 | **AI Resume Feedback** | Get instant, actionable critiques of your resume optimized for modern ATS systems. |
| 🎓 | **Curated Learning** | Access targeted pathways to bridge the gap between academic knowledge and industry skills. |
| 💼 | **Opportunity Portal** | A vetted pipeline of internships and freelance gigs for the modern professional. |
| 🪙 | **Coin System** | Strategic resource management balancing platform sustainability with user accessibility. |

<br/>

---

<br/>

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│  Framework        Next.js 16 (App Router)                   │
│  Language         TypeScript 5 (Strict)                     │
│  Styling          Tailwind CSS 3 + Framer Motion            │
│  UI               React 19 + Lucide Icons                   │
├─────────────────────────────────────────────────────────────┤
│  Backend / DB     Firebase Firestore + Firebase Auth        │
│  AI Models        Google Gemini 2.5 Flash · Groq · Perplexity│
├─────────────────────────────────────────────────────────────┤
│  Monitoring       Sentry + Vercel Analytics                 │
│  Performance      Service Workers (PWA) + Bundle Optimization│
│  Mobile           Capacitor (Android TWA)                   │
│  Deployment       Vercel                                    │
└─────────────────────────────────────────────────────────────┘
```

<br/>

---

<br/>

## 🚀 Local Development

### Prerequisites

- **[Node.js](https://nodejs.org/)** v18.17+ 
- **[pnpm](https://pnpm.io/)** (package manager)
- **Git**

### Quick Start

```bash
# 1. Clone & enter
git clone https://github.com/zaifears/SkillDash.git
cd SkillDash

# 2. Install dependencies
pnpm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your Firebase, Gemini, Groq, and Perplexity API keys

# 4. Launch dev server
pnpm dev
```

### Available Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm type-check` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm analyze` | Analyze bundle size |
| `pnpm apk` | Build Android APK |

<br/>

---

<br/>

## 🌟 Mission

<div align="center">

**Empowering the next generation of investors.**

*From classroom to market — bridging the gap with AI-powered simulation.*

</div>

<br/>

| Pillar | Description |
|---|---|
| **Accessible** | Risk-free market education for everyone |
| **Intelligent** | Multi-model AI insights tailored to DSE dynamics |
| **Practical** | Real market data, real strategies, zero risk |
| **Gamified** | Compete, learn, and grow through leaderboards and achievements |

<br/>

---

<br/>

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

<br/>

---

<br/>

<div align="center">

  <strong>🚀 Ready to master the market?</strong>

  <br/><br/>

  <a href="https://skilldash.live/simulator">Visit Live Simulator</a> &nbsp;·&nbsp; <a href="https://github.com/zaifears/SkillDash/issues">Report Issue</a> &nbsp;·&nbsp; <a href="mailto:alshahoriar.hossain@gmail.com">Contact</a>

  <br/><br/>

  <sub>Built with ❤️ by <a href="https://github.com/zaifears">zaifears</a></sub>

</div>
```
