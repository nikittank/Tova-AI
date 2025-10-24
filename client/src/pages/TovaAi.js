import React from 'react';
import {
  FiArrowRight, FiStar, FiCheck,
  FiTrendingUp, FiTarget, FiCode, FiLayers
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import logo from '../images/logo.png';
import dashboardPreview from '../images/dashboard-preview.png';
import Header from '../components/Header';
import Button from '../components/Button';
import cherryTreeImage from '../images/image.png';
import GridBackground from '../components/GridBackground';

// Add custom CSS for animations
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
  styleSheet.type = 'text/css';
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

const TovaAi = ({ onGetStarted }) => {
  const features = [
    {
      icon: <FiCode style={{ color: '#E75957' }} size={20} />,
      title: 'Natural Language to SQL',
      description: 'Convert plain English questions into optimized SQL queries instantly with AI precision.'
    },
    {
      icon: <FiLayers style={{ color: '#E75957' }} size={20} />,
      title: 'Interactive Schema Explorer',
      description: 'Visualize and navigate your database structure with beautiful, interactive diagrams.'
    },
    {
      icon: <FiTrendingUp style={{ color: '#E75957' }} size={20} />,
      title: 'Performance Optimization',
      description: 'Get intelligent suggestions to optimize query performance and database efficiency.'
    },
    {
      icon: <FiTarget style={{ color: '#E75957' }} size={20} />,
      title: 'Smart Query Assistant',
      description: 'Context-aware AI that learns from your patterns and suggests better approaches.'
    }
  ];



  const benefits = [
    'No SQL knowledge required',
    'Works with any database',
    'Real-time query optimization'
  ];

  return (
    <GridBackground>
      <Header />

      {/* First Section: Dashboard Preview Format */}
      <section className="pt-24 pb-32 relative overflow-hidden">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-[80vh]">

              {/* Left Side: Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="space-y-8"
              >


                {/* Main Heading */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  viewport={{ once: true }}
                >
                  <h1 className="text-5xl lg:text-6xl font-black text-black leading-tight">
                    Tova AI - Intelligent
                    <br />
                    <span style={{ color: '#E75957' }}>Database Assistant</span>
                  </h1>
                </motion.div>

                {/* Description */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  <p className="text-xl text-black leading-relaxed">
                    Tova AI intelligently converts natural language into precise SQL queries, delivering instant and accurate database results without the need for manual coding. It enhances productivity by reducing query time by up to 50% while maintaining 99.9% accuracy.
                  </p>
                </motion.div>

                {/* Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    onClick={onGetStarted}
                    size="large"
                    variant="primary"
                    style={{ backgroundColor: '#F69EAE', color: 'black' }}
                  >
                    Get Started
                  </Button>
                  <Button
                    onClick={() => window.open('#docs', '_self')}
                    variant="secondary"
                    size="large"
                    className="flex items-center"
                    style={{ color: '#E75957', borderColor: '#E75957', boxShadow: `-5px 5px 0px 0px #E75957` }}
                  >
                    Docs
                    <FiArrowRight className="ml-2" size={16} />
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
                        width: '140%',
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



      {/* Dashboard Preview Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Pink Glow Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[800px] h-[800px] rounded-full opacity-20 blur-3xl"
            style={{
              background: `radial-gradient(circle, #F69EAE 0%, rgba(246, 158, 174, 0.3) 50%, transparent 70%)`
            }}
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-black mb-6">
              See Tova AI in
              <br />
              <span style={{ color: '#E75957' }}>
                Action
              </span>
            </h2>
            <p className="text-xl text-black max-w-3xl mx-auto font-medium">
              Experience the power of natural language database queries with our intuitive interface
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <motion.div
              whileHover={{ scale: 1.02, y: -10 }}
              transition={{ duration: 0.3 }}
              className="relative bg-transparent border-3 border-black rounded-2xl overflow-hidden"
              style={{
                backgroundColor: 'transparent',
                border: '3px solid #000',
                borderRadius: '1em',
                boxShadow: `-5px 5px 0px 0px #F69EAE`
              }}
            >
              <div className="px-8 py-6 border-b-3 border-black" style={{ backgroundColor: '#F69EAE' }}>
                <div className="flex items-center space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-4 h-4 bg-black rounded-full shadow-lg"
                  ></motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                    className="w-4 h-4 bg-black rounded-full shadow-lg"
                  ></motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                    className="w-4 h-4 bg-black rounded-full shadow-lg"
                  ></motion.div>
                  <div className="ml-6 text-lg text-black font-bold">Tova AI Dashboard</div>
                </div>
              </div>
              <div className="p-2">
                <img
                  src={dashboardPreview}
                  alt="Tova AI Dashboard Preview"
                  className="w-full h-auto rounded-2xl"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Combined Features Section */}
      <section id="features" className="py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center backdrop-blur-xl px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg border border-black"
              style={{
                backgroundColor: '#F69EAE',
                color: 'black'
              }}
            >
              <FiStar className="mr-2 text-black" />
              Powerful Features
            </motion.div>

            <h2 className="text-5xl font-black text-black mb-6">
              Everything You Need for
              <br />
              <span style={{ color: '#E75957' }}>
                Database Success
              </span>
            </h2>

            <p className="text-xl text-black max-w-4xl mx-auto font-medium">
              From natural language queries to advanced analytics, Tova AI provides all the tools
              you need to work with databases efficiently.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -10 }}
                className="bg-transparent border-3 border-black rounded-2xl p-8 transition-all group hover:transform hover:translate-x-1 hover:-translate-y-1"
                style={{
                  backgroundColor: 'transparent',
                  border: '3px solid #000',
                  borderRadius: '1em',
                  boxShadow: `-5px 5px 0px 0px #F69EAE`
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: '#E75957' }}
                >
                  {React.cloneElement(feature.icon, { size: 24, className: "text-white" })}
                </div>
                <h3 className="text-2xl font-bold text-black mb-4 transition-colors" style={{ color: '#E75957' }}>
                  {feature.title}
                </h3>
                <p className="text-black leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Benefits Section - Combined */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="inline-flex items-center backdrop-blur-xl px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg border border-black"
                style={{
                  backgroundColor: '#F69EAE',
                  color: 'black'
                }}
              >
                <FiCheck className="mr-2 text-black" />
                Why Choose Tova AI
              </motion.div>

              <h2 className="text-5xl font-black text-black mb-6">
                Built for
                <br />
                <span style={{ color: '#E75957' }}>
                  Modern Teams
                </span>
              </h2>

              <p className="text-xl text-black mb-10 font-medium">
                Whether you're a developer, analyst, or business user, Tova AI adapts to your workflow
                and makes database interaction intuitive and powerful.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                {benefits.map((benefit, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center bg-transparent border-2 border-black rounded-xl p-4 transition-all hover:transform hover:translate-x-1 hover:-translate-y-1"
                    style={{
                      backgroundColor: 'transparent',
                      border: '2px solid #000',
                      borderRadius: '0.75em',
                      boxShadow: `-3px 3px 0px 0px #F69EAE`
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center mr-4 shadow-lg"
                      style={{ backgroundColor: '#E75957' }}
                    >
                      <FiCheck className="text-white" size={16} />
                    </div>
                    <span className="text-black font-semibold">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              {/* Additional Benefits */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl border border-gray-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <FiTrendingUp className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">50% Faster Queries</h4>
                    <p className="text-gray-600 text-sm">Reduce query development time significantly</p>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-4 p-4 bg-white/50 rounded-xl border border-gray-200"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl flex items-center justify-center">
                    <FiTarget className="text-white" size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-black">99.9% Accuracy</h4>
                    <p className="text-gray-600 text-sm">Precise SQL generation with minimal errors</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
                style={{ background: `radial-gradient(circle, #F69EAE 0%, rgba(246, 158, 174, 0.3) 50%, transparent 70%)` }}
              ></div>
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
                className="relative bg-transparent border-3 border-black rounded-2xl p-10 transition-all hover:transform hover:translate-x-1 hover:-translate-y-1"
                style={{
                  backgroundColor: 'transparent',
                  border: '3px solid #000',
                  borderRadius: '1em',
                  boxShadow: `-5px 5px 0px 0px #F69EAE`
                }}
              >
                <div className="flex items-center mb-8">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mr-6 shadow-lg"
                    style={{ backgroundColor: '#E75957' }}
                  >
                    <img src={logo} alt="Tova AI" className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-black">Tova AI Assistant</h3>
                    <p className="text-black font-medium">Ready to help with your database</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    viewport={{ once: true }}
                    className="rounded-2xl p-6 border border-black"
                    style={{ backgroundColor: '#F69EAE' }}
                  >
                    <p className="text-sm text-black mb-3 font-semibold">You asked:</p>
                    <p className="font-bold text-black text-lg">"Show me top 10 customers by revenue"</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    viewport={{ once: true }}
                    className="rounded-2xl p-6 border border-black"
                    style={{ backgroundColor: '#F69EAE' }}
                  >
                    <p className="text-sm text-black mb-3 font-semibold">Generated SQL:</p>
                    <code
                      className="text-sm font-mono bg-white rounded-lg p-4 block leading-relaxed border border-black"
                      style={{ color: '#E75957' }}
                    >
                      SELECT customer_name, SUM(revenue)<br />
                      FROM customers<br />
                      ORDER BY revenue DESC LIMIT 10;
                    </code>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    viewport={{ once: true }}
                    className="rounded-2xl p-6 border border-black bg-white"
                  >
                    <p className="text-sm text-black mb-3 font-semibold">Results:</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between border-b pb-1">
                        <span className="font-medium">Customer</span>
                        <span className="font-medium">Revenue</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Acme Corp</span>
                        <span className="font-bold" style={{ color: '#E75957' }}>$125,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tech Solutions</span>
                        <span className="font-bold" style={{ color: '#E75957' }}>$98,500</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Global Industries</span>
                        <span className="font-bold" style={{ color: '#E75957' }}>$87,200</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Additional Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h3 className="text-3xl font-black text-black mb-12">
              Trusted by <span style={{ color: '#E75957' }}>10,000+</span> Developers Worldwide
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="text-4xl font-black mb-2" style={{ color: '#E75957' }}>50%</div>
                <p className="text-black font-semibold">Faster Development</p>
                <p className="text-gray-600 text-sm mt-2">Reduce query writing time significantly</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="text-4xl font-black mb-2" style={{ color: '#E75957' }}>99.9%</div>
                <p className="text-black font-semibold">Query Accuracy</p>
                <p className="text-gray-600 text-sm mt-2">Precise SQL generation with minimal errors</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="text-4xl font-black mb-2" style={{ color: '#E75957' }}>24/7</div>
                <p className="text-black font-semibold">AI Assistant</p>
                <p className="text-gray-600 text-sm mt-2">Always available to help with your queries</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>



      {/* Enhanced CTA Section */}
      <section className="relative py-24 overflow-hidden">
        {/* Pink Glow Background */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-[1000px] h-[1000px] rounded-full opacity-15 blur-3xl"
            style={{
              background: `radial-gradient(circle, #F69EAE 0%, rgba(246, 158, 174, 0.3) 50%, transparent 70%)`
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-transparent border-3 border-black rounded-2xl p-12 text-center"
            style={{
              backgroundColor: 'transparent',
              border: '3px solid #000',
              borderRadius: '1em',
              boxShadow: `-5px 5px 0px 0px #F69EAE`
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="inline-flex items-center px-6 py-3 rounded-full border border-black mb-8"
              style={{ backgroundColor: '#F69EAE' }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-3 h-3 rounded-full mr-3"
                style={{ backgroundColor: '#E75957' }}
              ></motion.div>
              <span className="text-black font-bold">AI-Powered • Real-time • Ready to Use</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-5xl lg:text-6xl font-black text-black mb-6"
            >
              Query Smarter,
              <br />
              <span style={{ color: '#E75957' }}>
                Not Harder
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-xl text-black max-w-3xl mx-auto mb-12 font-medium"
            >
              Transform natural language into powerful SQL queries instantly.
              Connect any database and start conversations with your data.
            </motion.p>

            {/* Interactive Demo Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="max-w-5xl mx-auto mb-12"
            >
              <div
                className="rounded-3xl border border-black p-8 shadow-xl"
                style={{ backgroundColor: '#F69EAE' }}
              >
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left: Demo */}
                  <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 border border-black shadow-lg">
                      <div className="flex items-center mb-4">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="w-3 h-3 bg-black rounded-full mr-2"
                        ></motion.div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.2 }}
                          className="w-3 h-3 bg-black rounded-full mr-2"
                        ></motion.div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                          className="w-3 h-3 bg-black rounded-full mr-2"
                        ></motion.div>
                        <span className="text-black text-sm ml-2 font-semibold">tova-ai.sql</span>
                      </div>
                      <div className="space-y-4">
                        <div
                          className="rounded-lg p-4 border border-black"
                          style={{ backgroundColor: '#F69EAE' }}
                        >
                          <span className="text-black font-semibold text-sm">You:</span>
                          <p className="text-black font-medium">"Show me top 5 customers by revenue"</p>
                        </div>
                        <div
                          className="rounded-lg p-4 border border-black"
                          style={{ backgroundColor: '#F69EAE' }}
                        >
                          <span className="text-black font-semibold text-sm">AI:</span>
                          <div
                            className="mt-2 bg-black rounded-lg p-4 font-mono text-sm"
                            style={{ color: '#E75957' }}
                          >
                            SELECT customer_name, SUM(revenue)<br />
                            FROM customers c<br />
                            JOIN orders o ON c.id = o.customer_id<br />
                            GROUP BY customer_name<br />
                            ORDER BY SUM(revenue) DESC<br />
                            LIMIT 5;
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-center space-x-6 text-sm">
                      <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                        <FiCheck className="w-4 h-4 mr-2" style={{ color: '#E75957' }} />
                        <span className="text-black font-semibold">Instant Translation</span>
                      </div>
                      <div className="flex items-center bg-white rounded-full px-4 py-2 shadow-md">
                        <FiCheck className="w-4 h-4 mr-2" style={{ color: '#E75957' }} />
                        <span className="text-black font-semibold">Query Optimization</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: CTA */}
                  <div className="text-center space-y-6">
                    <Button
                      onClick={onGetStarted}
                      size="large"
                      variant="primary"
                      style={{ backgroundColor: '#F69EAE', color: 'black', width: '100%' }}
                    >
                      Get Started
                      <FiArrowRight className="inline ml-3" size={24} />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>


          </motion.div>
        </div>
      </section >

      {/* Enhanced Footer */}
      < footer className="relative overflow-hidden" style={{ backgroundColor: '#F6F6F6' }}>
        {/* Grid Pattern */}
        < div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(75, 85, 99, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(75, 85, 99, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        ></div >

        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white relative z-10"></div>
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <img src={logo} alt="Tova AI" className="h-10 w-auto mr-3" />
                <span className="text-2xl font-bold">Tova AI</span>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolutionizing database interaction through artificial intelligence.
                Making complex data operations simple and intuitive for everyone.
              </p>
              <div className="flex space-x-4">
                {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
                  <div
                    key={social}
                    className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
                  >
                    <span className="text-gray-400 text-sm font-bold">{social[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-3 text-gray-400">
                {['Features', 'Database', 'Documentation'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-3 text-gray-400">
                {['About', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer >
    </GridBackground>
  );
};

export default TovaAi;