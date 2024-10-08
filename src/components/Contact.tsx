import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, CheckCircle, AlertCircle, Zap, Mail, Github, Linkedin, Twitter } from 'lucide-react';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [activeField, setActiveField] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (submitStatus === 'success' || submitStatus === 'error') {
      timer = setTimeout(() => {
        setSubmitStatus('idle');
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [submitStatus]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { name, email, message } = formState;
      const subject = encodeURIComponent(`New Contact Form Submission from ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:zs.01117875692@gmail.com?subject=${subject}&body=${body}`;
      
      window.open(mailtoLink, '_blank');

      setSubmitStatus('success');
      setFormState({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Submission error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <h2 className="text-7xl font-extrabold mb-16 text-center">
          <span className="relative inline-block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-text-shimmer">
              Let's Connect
            </span>
            <span className="absolute -bottom-4 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"></span>
          </span>
        </h2>
        <div className="max-w-6xl mx-auto bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transform hover:scale-105 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-12 bg-gradient-to-br from-cyan-500 to-blue-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-circuit-pattern opacity-20"></div>
              <h3 className="text-4xl font-bold text-white mb-8 relative z-10">Contact Information</h3>
              <p className="text-white mb-12 text-xl relative z-10">Ready to embark on a digital adventure? Let's connect and create something extraordinary!</p>
              <ul className="space-y-8 relative z-10">
                <li className="flex items-center text-white group">
                  <Mail className="w-8 h-8 mr-4 text-yellow-300 group-hover:animate-bounce" />
                  <span className="text-xl group-hover:text-yellow-300 transition-colors duration-300">zs.01117875692@gmail.com</span>
                </li>
                <li className="flex items-center text-white group">
                  <Zap className="w-8 h-8 mr-4 text-yellow-300 group-hover:animate-pulse" />
                  <span className="text-xl group-hover:text-yellow-300 transition-colors duration-300">Available for exciting projects</span>
                </li>
                <li className="flex items-center text-white group">
                  <Github className="w-8 h-8 mr-4 text-yellow-300 group-hover:animate-spin" />
                  <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-xl group-hover:text-yellow-300 transition-colors duration-300">GitHub Profile</a>
                </li>
                <li className="flex items-center text-white group">
                  <Linkedin className="w-8 h-8 mr-4 text-yellow-300 group-hover:animate-bounce" />
                  <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer" className="text-xl group-hover:text-yellow-300 transition-colors duration-300">LinkedIn Profile</a>
                </li>
                <li className="flex items-center text-white group">
                  <Twitter className="w-8 h-8 mr-4 text-yellow-300 group-hover:animate-pulse" />
                  <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer" className="text-xl group-hover:text-yellow-300 transition-colors duration-300">Twitter Profile</a>
                </li>
              </ul>
            </div>
            <form className="p-12 space-y-8 bg-gray-900" onSubmit={handleSubmit}>
              <div className="relative group">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField('name')}
                  onBlur={() => setActiveField(null)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 transition-all duration-300 text-white placeholder-gray-500 text-xl"
                  placeholder="Your Name"
                  required
                  disabled={isSubmitting}
                />
                <span className={`absolute top-4 left-4 transition-all duration-300 ${activeField === 'name' ? 'text-cyan-400 scale-110' : 'text-gray-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <div className="relative group">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formState.email}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 transition-all duration-300 text-white placeholder-gray-500 text-xl"
                  placeholder="Your Email"
                  required
                  disabled={isSubmitting}
                />
                <span className={`absolute top-4 left-4 transition-all duration-300 ${activeField === 'email' ? 'text-cyan-400 scale-110' : 'text-gray-500'}`}>
                  <Mail className="w-6 h-6" />
                </span>
              </div>
              <div className="relative group">
                <textarea
                  id="message"
                  name="message"
                  value={formState.message}
                  onChange={handleInputChange}
                  onFocus={() => setActiveField('message')}
                  onBlur={() => setActiveField(null)}
                  rows={6}
                  className="w-full pl-12 pr-4 py-4 bg-gray-800 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 transition-all duration-300 text-white placeholder-gray-500 text-xl"
                  placeholder="Your Message"
                  required
                  disabled={isSubmitting}
                ></textarea>
                <span className={`absolute top-4 left-4 transition-all duration-300 ${activeField === 'message' ? 'text-cyan-400 scale-110' : 'text-gray-500'}`}>
                  <MessageSquare className="w-6 h-6" />
                </span>
              </div>
              <button
                type="submit"
                className={`w-full px-8 py-5 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-bold text-xl rounded-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-opacity-50 shadow-lg hover:shadow-cyan-500/50 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:from-blue-500 hover:to-purple-600'
                }`}
                disabled={isSubmitting}
              >
                <span className="flex items-center justify-center">
                  {isSubmitting ? (
                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <Send className="w-6 h-6 mr-3" />
                  )}
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </span>
              </button>
            </form>
          </div>
        </div>
        {submitStatus === 'success' && (
          <div className="mt-12 p-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white animate-pulse shadow-lg">
            <CheckCircle className="w-8 h-8 mr-4" />
            <p className="text-2xl font-semibold">Message sent successfully! Check your email client.</p>
          </div>
        )}
        {submitStatus === 'error' && (
          <div className="mt-12 p-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center text-white animate-bounce">
            <AlertCircle className="w-8 h-8 mr-4" />
            <p className="text-2xl font-semibold">Failed to send message. Please try again.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
