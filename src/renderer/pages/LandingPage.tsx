import { ArrowRight, Zap, Users, BarChart3, Zap as ZapIcon } from 'lucide-react';

interface LandingPageProps {
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export default function LandingPage({ onLoginClick, onSignupClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-purple-500/20 backdrop-blur-md bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center font-bold text-sm">
                ED
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                EasyDraft
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={onLoginClick}
                className="px-6 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Log in
              </button>
              <button
                onClick={onSignupClick}
                className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
            Manage Your
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
              Draft with Ease
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Professional draft management system designed for teams. Create, track, and manage your picks with real-time OBS overlays.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button
              onClick={onSignupClick}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Free <ArrowRight size={20} />
            </button>
            <button
              onClick={onLoginClick}
              className="px-8 py-4 border border-purple-400 hover:border-purple-300 hover:bg-purple-900/30 rounded-lg font-semibold transition-all"
            >
              View Demo
            </button>
          </div>

          {/* Social Proof */}
          <div className="inline-block px-4 py-2 bg-purple-900/30 border border-purple-500/50 rounded-full mb-12">
            <p className="text-sm text-gray-300">
              ✨ Join 100+ teams already using EasyDraft
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4">Powerful Features</h3>
          <p className="text-gray-400 text-center mb-16 max-w-2xl mx-auto">
            Everything you need to run a professional draft, all in one place
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-xl border border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-900/10 to-pink-900/10 hover:from-purple-900/20 hover:to-pink-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 size={28} />
              </div>
              <h4 className="text-xl font-semibold mb-3">Real-time Dashboard</h4>
              <p className="text-gray-400">
                Track all picks, constraints, and team rosters in real-time with instant updates
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-xl border border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-900/10 to-pink-900/10 hover:from-purple-900/20 hover:to-pink-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap size={28} />
              </div>
              <h4 className="text-xl font-semibold mb-3">OBS Integration</h4>
              <p className="text-gray-400">
                Beautiful overlays ready for streaming. Connect directly to OBS with live updates
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-xl border border-purple-500/20 hover:border-purple-500/50 bg-gradient-to-br from-purple-900/10 to-pink-900/10 hover:from-purple-900/20 hover:to-pink-900/20 transition-all group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users size={28} />
              </div>
              <h4 className="text-xl font-semibold mb-3">Team Collaboration</h4>
              <p className="text-gray-400">
                Multiple users can manage drafts together with full sync across all devices
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-20 px-4 border-t border-purple-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                100+
              </p>
              <p className="text-gray-400">Active Teams</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                10K+
              </p>
              <p className="text-gray-400">Picks Managed</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                99.9%
              </p>
              <p className="text-gray-400">Uptime</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-2">
                24/7
              </p>
              <p className="text-gray-400">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-4">Simple Pricing</h3>
          <p className="text-gray-400 text-center mb-16">
            Start free. Upgrade when you need more
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="p-8 rounded-xl border border-purple-500/20 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
              <h4 className="text-2xl font-bold mb-2">Free</h4>
              <p className="text-gray-400 mb-6">Perfect for getting started</p>
              <div className="mb-8">
                <p className="text-4xl font-bold mb-2">$0<span className="text-lg text-gray-400">/mo</span></p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <ZapIcon size={18} className="text-purple-400" />
                  <span>1 Draft</span>
                </li>
                <li className="flex items-center gap-3">
                  <ZapIcon size={18} className="text-purple-400" />
                  <span>Basic Overlays</span>
                </li>
                <li className="flex items-center gap-3">
                  <ZapIcon size={18} className="text-purple-400" />
                  <span>Team Management</span>
                </li>
              </ul>
              <button className="w-full py-3 border border-purple-400 hover:bg-purple-900/20 rounded-lg font-semibold transition-colors">
                Get Started
              </button>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-xl border-2 border-purple-400 bg-gradient-to-br from-purple-900/20 to-pink-900/20 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h4 className="text-2xl font-bold mb-2">Pro</h4>
              <p className="text-gray-400 mb-6">For serious drafting teams</p>
              <div className="mb-8">
                <p className="text-4xl font-bold mb-2">$9<span className="text-lg text-gray-400">/mo</span></p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <ZapIcon size={18} className="text-purple-400" />
                  <span>Unlimited Drafts</span>
                </li>
                <li className="flex items-center gap-3">
                  <ZapIcon size={18} className="text-purple-400" />
                  <span>Premium Overlays</span>
                </li>
                <li className="flex items-center gap-3">
                  <ZapIcon size={18} className="text-purple-400" />
                  <span>Priority Support</span>
                </li>
                <li className="flex items-center gap-3">
                  <ZapIcon size={18} className="text-purple-400" />
                  <span>Custom Branding</span>
                </li>
              </ul>
              <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl">
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-12 text-center">
          <h3 className="text-4xl font-bold mb-4">Ready to streamline your drafts?</h3>
          <p className="text-lg text-purple-100 mb-8">
            Join hundreds of teams that trust EasyDraft
          </p>
          <button
            onClick={onSignupClick}
            className="px-8 py-4 bg-white text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-colors shadow-lg"
          >
            Start for Free Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-purple-500/20 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Docs</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Support</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-purple-400 transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-500/20 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2026 EasyDraft. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
