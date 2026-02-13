import Link from 'next/link';
import dynamic from 'next/dynamic';
import { 
  TrendingUp, Shield, BookOpen, Target, 
  BarChart3, Clock, Wallet, ArrowRight,
  CheckCircle2, AlertTriangle
} from 'lucide-react';

const Footer = dynamic(() => import('@/components/shared/Footer'), { loading: () => <div className="h-20" /> });

export default function SimulatorLandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-orange-500/20 border border-orange-500/30 rounded-full text-orange-400 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            DSE Stock Market Simulator
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
            Learn Stock Trading
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500 mt-2">
              Without Risking Real Money
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-2">
            Practice buying and selling stocks on the Dhaka Stock Exchange with virtual money. 
            Experience real market conditions, learn trading strategies, and build confidence 
            before investing your hard-earned money.
          </p>

          {/* CTA Button */}
          <Link 
            href="/simulator/trade"
            className="inline-flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-lg sm:text-xl font-bold rounded-xl sm:rounded-2xl shadow-2xl shadow-orange-500/30 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto"
          >
            Start Trading Now
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>

      {/* What is Paper Trading Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
                What is <span className="text-orange-400">Paper Trading</span>?
              </h2>
              <p className="text-base sm:text-lg text-slate-300 mb-4 sm:mb-6 leading-relaxed">
                Paper trading, also known as <strong className="text-white">simulator trading</strong> or 
                <strong className="text-white"> virtual trading</strong>, is a practice method where you 
                trade stocks using fake money in a simulated environment that mirrors real market conditions.
              </p>
              <p className="text-base sm:text-lg text-slate-300 mb-4 sm:mb-6 leading-relaxed">
                It&apos;s called &quot;paper trading&quot; because traditionally, traders would write down 
                their hypothetical trades on paper to track performance without actually executing them. 
                Today, digital platforms like SkillDash automate this process with real-time data.
              </p>
              <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-200 text-sm">
                  <strong>The Reality:</strong> Finding a good paper trading platform for the Bangladesh 
                  stock market is extremely difficult. Most platforms focus on US or European markets, 
                  leaving Bangladeshi investors with very few options to practice.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/50 rounded-xl sm:rounded-2xl p-5 sm:p-8 border border-slate-700">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-orange-400">Why Practice First?</h3>
              <ul className="space-y-3 sm:space-y-4">
                {[
                  'Understand how the stock market works without financial risk',
                  'Learn to read stock prices, charts, and market trends',
                  'Test different trading strategies before using real money',
                  'Experience the emotional aspects of trading in a safe environment',
                  'Build confidence before making your first real investment'
                ].map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
              Why Choose <span className="text-orange-400">SkillDash</span> Simulator?
            </h2>
            <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto">
              One of the very few paper trading platforms built specifically for the 
              Dhaka Stock Exchange with realistic market conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: BarChart3,
                title: 'Real DSE Data',
                description: 'Practice with actual stock prices from the Dhaka Stock Exchange, updated during market hours.'
              },
              {
                icon: Wallet,
                title: '10K+ Virtual Capital',
                description: 'Start with over 10,000 BDT in virtual money to build your practice portfolio.'
              },
              {
                icon: Clock,
                title: 'Real Market Hours',
                description: 'Trade only during DSE open hours (10 AM - 2:15 PM, Sun-Thu) for realistic experience.'
              },
              {
                icon: Shield,
                title: 'Real Limitations',
                description: 'Experience T+1 settlement rules and 0.3% commission charges just like real trading.'
              },
              {
                icon: Target,
                title: '300+ Companies',
                description: 'Access to all tradeable companies listed on the Dhaka Stock Exchange.'
              },
              {
                icon: BookOpen,
                title: 'Learn by Doing',
                description: 'The best way to understand stock trading is through hands-on practice.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 hover:border-orange-500/50 transition-colors">
                <feature.icon className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-xs sm:text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Problem Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6">
            The <span className="text-rose-400">Problem</span> with Learning to Trade
          </h2>
          <p className="text-base sm:text-lg text-slate-300 mb-6 sm:mb-8 leading-relaxed">
            Most beginners jump straight into real trading without any practice. They lose money, 
            get discouraged, and often quit entirely. Paper trading platforms exist for US markets, 
            but <strong className="text-white">almost none exist for the Bangladesh stock market</strong>.
          </p>
          <p className="text-base sm:text-lg text-slate-300 mb-8 sm:mb-12 leading-relaxed">
            That&apos;s why we built this simulator — to give Bangladeshi investors a 
            <strong className="text-white"> risk-free environment</strong> to learn, practice, and 
            gain confidence before putting real money at stake.
          </p>

          {/* Big CTA */}
          <Link 
            href="/simulator/trade"
            className="inline-flex items-center justify-center gap-3 sm:gap-4 px-8 sm:px-12 py-5 sm:py-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-xl sm:text-2xl font-bold rounded-xl sm:rounded-2xl shadow-2xl shadow-orange-500/30 transform hover:scale-105 transition-all duration-300 w-full sm:w-auto max-w-md sm:max-w-none mx-auto"
          >
            Start Trading Now
            <ArrowRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </Link>
          <p className="mt-6 text-slate-400">
            Join hundreds of learners practicing on SkillDash
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}