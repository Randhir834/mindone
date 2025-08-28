/**
 * StatisticsSection Component
 * Displays statistics in an attractive grid layout with animations
 * and customizable styling
 */
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const StatisticsSection = ({ 
  stats = [],
  title = "Our Impact",
  subtitle = "Numbers that speak for themselves",
  columns = 4,
  className = "",
  animateCounters = true
}) => {
  const [counters, setCounters] = useState({});

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6"
  };

  // Animate counters when component comes into view
  useEffect(() => {
    if (!animateCounters) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounterAnimation();
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.querySelector('.stats-container');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [animateCounters]);

  const startCounterAnimation = () => {
    stats.forEach((stat, index) => {
      const target = parseInt(stat.number.replace(/[^0-9]/g, ''));
      const suffix = stat.number.replace(/[0-9]/g, '');
      
      let current = 0;
      const increment = target / 50;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        
        setCounters(prev => ({
          ...prev,
          [index]: Math.floor(current) + suffix
        }));
      }, 30);
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        {(title || subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            {title && (
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {subtitle}
              </p>
            )}
          </motion.div>
        )}

        {/* Statistics Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className={`grid ${gridCols[columns]} gap-8 stats-container`}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center group"
            >
              {/* Icon Container */}
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                {stat.icon && <stat.icon className="w-8 h-8 text-white" />}
              </div>
              
              {/* Number */}
              <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">
                {animateCounters ? (counters[index] || '0') : stat.number}
              </div>
              
              {/* Label */}
              <div className="text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                {stat.label}
              </div>
              
              {/* Optional Description */}
              {stat.description && (
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  {stat.description}
                </p>
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default StatisticsSection;
