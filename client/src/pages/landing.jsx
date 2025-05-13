import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import { FiUpload, FiEdit, FiBarChart2, FiBookOpen, FiCheckCircle, FiUser } from 'react-icons/fi';

const Landing = () => {
  const progressChartRef = useRef(null);

  useEffect(() => {
    if (progressChartRef.current) {
      const chart = echarts.init(progressChartRef.current, 'dark');
      const option = {
        animation: false,
        backgroundColor: '#18181b',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          textStyle: { color: '#f3f4f6' }
        },
        grid: { top: 10, right: 10, bottom: 20, left: 40 },
        xAxis: {
          type: 'category',
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          axisLine: { lineStyle: { color: '#52525b' } },
          axisLabel: { color: '#f3f4f6' }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: '#52525b' } },
          axisLabel: { color: '#f3f4f6' },
          splitLine: { lineStyle: { color: '#27272a' } }
        },
        series: [
          {
            name: 'Study Time',
            type: 'line',
            smooth: true,
            data: [30, 45, 65, 50, 75, 60, 80],
            lineStyle: { color: 'rgba(87, 181, 231, 1)' },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(87, 181, 231, 0.3)' },
                  { offset: 1, color: 'rgba(87, 181, 231, 0.1)' }
                ]
              }
            },
            symbol: 'none'
          },
          {
            name: 'Quiz Score',
            type: 'line',
            smooth: true,
            data: [50, 60, 55, 70, 65, 85, 90],
            lineStyle: { color: 'rgba(141, 211, 199, 1)' },
            areaStyle: {
              color: {
                type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(141, 211, 199, 0.3)' },
                  { offset: 1, color: 'rgba(141, 211, 199, 0.1)' }
                ]
              }
            },
            symbol: 'none'
          }
        ]
      };
      chart.setOption(option);
      const handleResize = () => { chart.resize(); };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        chart.dispose();
      };
    }
  }, []);

  return (
    <div className="bg-gray-900 min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-28 pb-20 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-800/80 to-transparent"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="w-full max-w-2xl text-white">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Revolutionize Your Study with AI</h1>
            <p className="text-lg md:text-xl mb-8 text-gray-300">Transform how you learn with ENCODED: automatically generate notes, quizzes, summaries, progress checks, and discover the best online courses for your needs.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="bg-white text-blue-700 px-8 py-3 rounded-button font-medium hover:bg-gray-200 transition-colors whitespace-nowrap">Get Started</Link>
              <a href="#how-it-works" className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-button font-medium hover:bg-white/10 transition-colors whitespace-nowrap">Learn More</a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">How It Works</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">ENCODED simplifies your learning journey in just three easy steps.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            <div className="bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700 text-center">
              <div className="w-16 h-16 bg-blue-700/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiUpload className="text-3xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Upload Content</h3>
              <p className="text-gray-300">Upload or paste your study materials - articles, videos, or any educational content.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700 text-center">
              <div className="w-16 h-16 bg-blue-700/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiEdit className="text-3xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Generate Content</h3>
              <p className="text-gray-300">Our AI instantly transforms your content into concise notes, quizzes, and summaries.</p>
            </div>
            <div className="bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700 text-center">
              <div className="w-16 h-16 bg-blue-700/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiBarChart2 className="text-3xl text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white">Track Progress</h3>
              <p className="text-gray-300">Monitor your learning journey with detailed analytics and personalized insights.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Powerful Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Discover the tools that make SnapStudy the ultimate AI-powered educational platform.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="feature-card bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700">
              <div className="mb-4 flex items-center justify-center"><FiBookOpen className="text-2xl text-blue-400" /></div>
              <h3 className="text-xl font-bold mb-3 text-white">Smart Note Summarization</h3>
              <p className="text-gray-300 mb-4">AI analyzes your content and creates concise, structured notes highlighting key concepts and important details.</p>
            </div>
            <div className="feature-card bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700">
              <div className="mb-4 flex items-center justify-center"><FiCheckCircle className="text-2xl text-blue-400" /></div>
              <h3 className="text-xl font-bold mb-3 text-white">AI Quiz Builder</h3>
              <p className="text-gray-300 mb-4">Generate customized quizzes with multiple-choice, true/false, and short answer questions to test your knowledge.</p>
            </div>
            <div className="feature-card bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700">
              <div className="mb-4 flex items-center justify-center"><FiEdit className="text-2xl text-blue-400" /></div>
              <h3 className="text-xl font-bold mb-3 text-white">Summary Generation</h3>
              <p className="text-gray-300 mb-4">Get clear, actionable summaries for any content you provide.</p>
            </div>
            <div className="feature-card bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700">
              <div className="mb-4 flex items-center justify-center"><FiBarChart2 className="text-2xl text-blue-400" /></div>
              <h3 className="text-xl font-bold mb-3 text-white">Progress Tracking Dashboard</h3>
              <p className="text-gray-300 mb-4">Monitor your learning progress with detailed analytics and visualizations to identify strengths and areas for improvement.</p>
              <div className="h-48 bg-gray-900 rounded-lg p-4" ref={progressChartRef}></div>
            </div>
            <div className="feature-card bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700">
              <div className="mb-4 flex items-center justify-center"><FiBookOpen className="text-2xl text-blue-400" /></div>
              <h3 className="text-xl font-bold mb-3 text-white">Course Suggestions</h3>
              <p className="text-gray-300 mb-4">Discover top-rated courses tailored to your needs, helping you master any topic faster and smarter.</p>
            </div>
            <div className="feature-card bg-gray-800 p-8 rounded-lg shadow-sm border border-gray-700">
              <div className="mb-4 flex items-center justify-center"><FiUser className="text-2xl text-blue-400" /></div>
              <h3 className="text-xl font-bold mb-3 text-white">One-on-One AI Mentorship</h3>
              <p className="text-gray-300 mb-4">Get personalized guidance with our AI mentor that adapts to your learning style and pace, providing targeted feedback and answering your specific questions in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="bg-gray-800 border-t border-gray-700 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-white text-xl font-bold mb-4">ENCODED</h3>
              <p className="text-gray-400 mb-4">Revolutionizing education through AI-powered learning tools and personalized study experiences.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><Link to="/signup" className="text-gray-400 hover:text-white transition-colors">Sign Up</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li className="text-gray-400">support@encoded.com</li>
                <li className="text-gray-400">+1 (555) 123-4567</li>
                <li className="text-gray-400">123 Education St,<br />Learning City, ED 12345</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8">
            <p className="text-gray-400 text-center text-sm">
              © {new Date().getFullYear()} ENCODED. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
