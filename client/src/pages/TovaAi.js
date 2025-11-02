import React from 'react';
import {
  FiArrowRight, FiLayers, FiGithub, FiDatabase, FiZap,
  FiShield, FiCpu, FiClock, FiBarChart2, FiUsers
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import logo from '../images/hlogo.png';
import dashboardPreview from '../images/dashboard-preview.png';
import Header from '../components/Header';
import Button from '../components/Button';
import cherryTreeImage from '../images/image.png';
import letraNImage from '../images/letra-n.png';
import cartaAImage from '../images/carta-a.png';
import GridBackground from '../components/GridBackground';
import DeveloperCard from '../components/DeveloperCard';

// Add custom CSS for animations and developer cards
const customStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-20px) rotate(1deg); }
    66% { transform: translateY(-10px) rotate(-1deg); }
  }
  
  .animate-float {
    animation: float 6s ease-in-out infinite;
  }
  
  .delay-1000 {
    animation-delay: 1s;
  }
  
  .delay-2000 {
    animation-delay: 2s;
  }


`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

const TovaAi = ({ onGetStarted }) => {
  const features = [
    {
      icon: <FiDatabase style={{ color: '#E75957' }} size={24} />,
      title: 'Natural Language to SQL',
      description: 'Convert plain English questions into optimized SQL queries instantly with AI precision and contextual understanding.'
    },
    {
      icon: <FiLayers style={{ color: '#E75957' }} size={24} />,
      title: 'Interactive Schema Explorer',
      description: 'Visualize and navigate your database structure with beautiful, interactive diagrams and real-time insights.'
    },
    {
      icon: <FiZap style={{ color: '#E75957' }} size={24} />,
      title: 'Performance Optimization',
      description: 'Get intelligent suggestions to optimize query performance and database efficiency with automated recommendations.'
    },
    {
      icon: <FiCpu style={{ color: '#E75957' }} size={24} />,
      title: 'Smart Query Assistant',
      description: 'Context-aware AI that learns from your patterns and suggests better approaches for complex database operations.'
    }
  ];

  return (
    <GridBackground>
      <Header />

      {/* First Section: Dashboard Preview Format */}
      <section className=" pt-28 pb-32 relative overflow-hidden">
        <div className="relative">
          <div className="max-w-7xl ml-34 mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center min-h-[80vh]">

              {/* Left Side: Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-14"
              >

                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h1 className="text-5xl lg:text-6xl font-black text-gray-800 leading-tight">
                    From Data Roots to
                    <br />
                    <span className="text-[54px]" style={{ color: '#dc6d6bff' }}>Knowledge Branches</span>
                  </h1>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="text-xl text-gray-700 leading-relaxed">
                    Tova AI intelligently converts natural language into precise SQL queries, delivering instant and accurate database results without the need for manual coding. It enhances productivity by reducing query time by up to 50% while maintaining 99.9% accuracy.
                  </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-6"
                >
                  <Button
                    onClick={onGetStarted}
                    size="large"
                    variant="primary"
                    style={{ backgroundColor: '#F69EAE', color: 'black' }}>
                    Get Started</Button>
                  <Button
                    onClick={() => window.open('#docs', '_self')}
                    className="flex items-center"
                    size="large">
                    Docs
                    <FiArrowRight className="ml-2" size={24} />
                  </Button>
                </motion.div>
              </motion.div>

              {/* Right Side: Cherry Tree Image - Positioned at Right Edge */}
              <div className="relative lg:flex lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <div className="relative overflow-visible">
                    <img
                      src={cherryTreeImage}
                      alt="Cherry Tree"
                      className="h-auto object-cover object-left"
                      style={{
                        width: '105%',
                        maxWidth: 'none',
                        filter: 'drop-shadow(0 10px 30px rgba(236, 72, 153, 0.3))'
                      }}
                    />
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Dashboard Preview - Sleek & Clean */}
      <section className="py-16 relative">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold text-black mb-3">
              See Tova AI in <span style={{ color: '#E75957' }}>Action</span>
            </h2>
            <p className="text-base text-gray-600 max-w-xl mx-auto">
              Experience the power of natural language database queries
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative max-w-3xl mx-auto"
          >
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="ml-3 text-xs font-medium text-gray-500">Tova AI Dashboard</span>
                </div>
              </div>
              <div className="p-2">
                <img
                  src={dashboardPreview}
                  alt="Tova AI Dashboard Preview"
                  className="w-full h-auto rounded-md"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Section 3: Data Stories */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-black mb-4">
              Data Stories
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
            {/* Story 1 - Business Question */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-4 border border-gray-200 h-full"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">BQ</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-black text-sm">Business Question</h3>
                  </div>
                  <p className="text-xs text-gray-500">@user</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Show me the top 5 customers who spent the most money in the last 3 months, along with their total purchase amount and number of orders
              </p>
            </motion.div>

            {/* Story 2 - Gemini AI Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-4 border border-gray-200 h-full"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">AI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-black text-sm">Gemini AI Analysis</h3>
                  </div>
                  <p className="text-xs text-gray-500">@gemini</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Based on the generated MySQL query results, we can see that John Smith emerges as the top customer with $15,420 spent across 23 orders, demonstrating exceptional loyalty and high-value purchasing behavior.
              </p>
            </motion.div>

            {/* Story 3 - Generated MySQL Query */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-4 border border-gray-200 h-full"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">SQL</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-black text-sm">Generated MySQL Query</h3>
                  </div>
                  <p className="text-xs text-gray-500">@mysql</p>
                </div>
              </div>
              <div className="bg-gray-900 rounded-lg p-3 overflow-x-auto">
                <pre className="text-green-400 text-xs leading-relaxed">
{`SELECT c.customer_name,
    SUM(o.total_amount) as total_spent,
    COUNT(o.order_id) as order_count
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_date >= DATE_SUB(NOW(), INTERVAL 3 MONTH)
GROUP BY c.customer_id
ORDER BY total_spent DESC
LIMIT 5;`}
                </pre>
              </div>
            </motion.div>

            {/* Story 4 - Query Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-4 border border-gray-200 h-full"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">QR</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-black text-sm">Query Results</h3>
                  </div>
                  <p className="text-xs text-gray-500">@results</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-700">
                  <div className="grid grid-cols-3 gap-2 font-semibold mb-2 pb-1 border-b border-gray-300">
                    <span>Customer</span>
                    <span>Spent</span>
                    <span>Orders</span>
                  </div>
                  <div className="space-y-1">
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">John Smith</span>
                      <span className="font-semibold text-green-600">$15,420</span>
                      <span>23</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <span className="font-medium">Sarah Johnson</span>
                      <span className="font-semibold text-green-600">$12,890</span>
                      <span>18</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Story 5 - Performance Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-4 border border-gray-200 h-full"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">PI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-black text-sm">Performance Insights</h3>
                  </div>
                  <p className="text-xs text-gray-500">@insights</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Query executed in 0.23 seconds with optimal JOIN performance. Gemini AI automatically optimized the GROUP BY clause and added proper indexing suggestions for enhanced performance.
              </p>
            </motion.div>

            {/* Story 6 - Business Impact */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg p-4 border border-gray-200 h-full"
            >
              <div className="flex items-start space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-600 font-medium text-sm">BI</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1">
                    <h3 className="font-bold text-black text-sm">Business Impact</h3>
                  </div>
                  <p className="text-xs text-gray-500">@impact</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                These insights reveal our most valuable customers who should be prioritized for retention programs, personalized offers, and VIP treatment to maintain their loyalty and maximize lifetime value.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: MySQL Performance & Benefits */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-bold text-black mb-4">
              MySQL Database <span style={{ color: '#E75957' }}>Excellence</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Exclusively designed for MySQL databases using Google Gemini AI, delivering unmatched performance and intelligent query optimization
            </p>
          </motion.div>

          {/* Performance Metrics - Modern Layout */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: '#E75957',
                    boxShadow: '0 10px 30px rgba(231, 89, 87, 0.3)'
                  }}
                >
                  <FiClock className="text-white" size={32} />
                </div>
                <div className="text-5xl font-black mb-2" style={{ color: '#E75957' }}>50%</div>
                <h3 className="text-xl font-bold text-black mb-3">Faster Development</h3>
                <p className="text-gray-600 leading-relaxed">Reduce MySQL query writing time significantly with intelligent automation and smart suggestions</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: '#E75957',
                    boxShadow: '0 10px 30px rgba(231, 89, 87, 0.3)'
                  }}
                >
                  <FiBarChart2 className="text-white" size={32} />
                </div>
                <div className="text-5xl font-black mb-2" style={{ color: '#E75957' }}>99.9%</div>
                <h3 className="text-xl font-bold text-black mb-3">Query Accuracy</h3>
                <p className="text-gray-600 leading-relaxed">Precise MySQL generation with contextual understanding and error-free execution</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: '#E75957',
                    boxShadow: '0 10px 30px rgba(231, 89, 87, 0.3)'
                  }}
                >
                  <FiUsers className="text-white" size={32} />
                </div>
                <div className="text-5xl font-black mb-2" style={{ color: '#E75957' }}>10K+</div>
                <h3 className="text-xl font-bold text-black mb-3">Active Users</h3>
                <p className="text-gray-600 leading-relaxed">Trusted by MySQL developers worldwide for mission-critical applications</p>
              </motion.div>
            </div>
          </div>

          {/* Features List - Clean Layout */}
          <div className="mb-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: '#3B82F6',
                    boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  <FiZap className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Lightning Fast Performance</h3>
                  <p className="text-gray-600 leading-relaxed">Sub-second MySQL query generation with optimized performance for complex database operations and real-time results.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: '#10B981',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <FiShield className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Enterprise Security</h3>
                  <p className="text-gray-600 leading-relaxed">Bank-level encryption with SOC 2 compliance and advanced data protection protocols for enterprise environments.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: '#8B5CF6',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <FiCpu className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">Gemini AI Powered</h3>
                  <p className="text-gray-600 leading-relaxed">Google's advanced Gemini AI learns from your patterns for personalized MySQL assistance and intelligent recommendations.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="flex items-start space-x-4 group"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundColor: '#F59E0B',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <FiDatabase className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-black mb-2">MySQL Specialized</h3>
                  <p className="text-gray-600 leading-relaxed">Built exclusively for MySQL databases with deep understanding of MySQL syntax, functions, and optimization techniques.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>



      {/* Section 5: Footer */}
      <footer className="relative overflow-hidden" style={{ backgroundColor: '#F6F6F6' }}>
        {/* Grid Pattern for Footer */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.2) 1px, transparent 1px),
              linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px, 80px 80px, 40px 40px, 40px 40px'
          }}
        />

        {/* Subtle Gradient Overlay */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(226, 87, 85, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(246, 158, 174, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(147, 51, 234, 0.05) 0%, transparent 50%)
            `
          }}
        />

        <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-12">
            {/* Logo and Description */}
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <img src={logo} alt="Tova AI" className="w-60 drop-shadow-sm" />
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                Transform your database interactions with AI-powered natural language queries.
                Built for developers, analysts, and teams who value efficiency.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/60">
                  <div className="text-lg font-bold" style={{ color: '#E25755' }}>99.9%</div>
                  <div className="text-xs text-gray-600">Accuracy</div>
                </div>
                <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-gray-200/60">
                  <div className="text-lg font-bold" style={{ color: '#E25755' }}>50%</div>
                  <div className="text-xs text-gray-600">Faster</div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-6">
              <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/40 shadow-lg">
                <h4 className="text-xl font-bold text-black mb-6 text-center">
                  Quick Links
                </h4>
                <ul className="space-y-3">
                  <li>
                    <button className="text-gray-700 hover:text-black hover:bg-gray-50/80 transition-all text-left w-full py-3 px-4 rounded-xl font-medium">
                      Features
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-700 hover:text-black hover:bg-gray-50/80 transition-all text-left w-full py-3 px-4 rounded-xl font-medium">
                      Documentation
                    </button>
                  </li>
                  <li>
                    <button className="text-gray-700 hover:text-black hover:bg-gray-50/80 transition-all text-left w-full py-3 px-4 rounded-xl font-medium">
                      Get Started
                    </button>
                  </li>
                  <li>
                    <a
                      href="https://github.com/nikittank/Tova-AI"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-black hover:bg-gray-50/80 transition-all flex items-center py-3 px-4 rounded-xl font-medium"
                    >
                      <FiGithub className="mr-3" size={18} />
                      Source Code
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Developers */}
            <div className="lg:col-span-2">
              <div className="text-center mb-8">
                <h4 className="text-xl font-bold text-black mb-4 flex items-center justify-center">
                  <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: '#E25755' }}></span>
                  Meet the Developers
                </h4>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                {/* Nikitta Card */}
                <DeveloperCard
                  name="Nikitta KS"
                  role="Full Stack AI Developer"
                  image={letraNImage}
                  alt="Nikitta KS"
                  portfolioUrl="https://nikittaksportfolio.netlify.app/"
                  linkedinUrl="https://www.linkedin.com/in/nikitta-ks/"
                  githubUrl="https://github.com/nikittank"
                  cardColor="#EFB8C8"
                />

                {/* Amrutha Card */}
                <DeveloperCard
                  name="Amrutha Murthi"
                  role="AI Engineer"
                  image={cartaAImage}
                  alt="Amrutha Murthi"
                  portfolioUrl="https://amruthamurthi.netlify.app/"
                  linkedinUrl="https://www.linkedin.com/in/amrutha-murthi/"
                  githubUrl="https://github.com/Amrutha-murthi"
                  cardColor="#F69EAE"
                />
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-300/60 pt-6 mt-8">
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-600">
              <span className="flex items-center">
                <span className="w-2 h-2 rounded-full mr-2 animate-pulse" style={{ backgroundColor: '#E25755' }}></span>
                Status: Online
              </span>
              <span>Version 2.1.0</span>
            </div>
          </div>
        </div>
      </footer>
    </GridBackground>
  );
};

export default TovaAi;
