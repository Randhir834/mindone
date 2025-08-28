/**
 * CallToAction Component
 * Displays attractive call-to-action sections with customizable content,
 * styling, and animations
 */
import { motion } from 'framer-motion';
import { FiArrowRight, FiDownload, FiStar } from 'react-icons/fi';

const CallToAction = ({
  title = "Ready to Get Started?",
  subtitle = "Join thousands of users already using our platform",
  primaryButton = {
    text: "Get Started",
    action: () => {},
    icon: FiArrowRight,
    variant: "primary"
  },
  secondaryButton = null,
  background = "gradient", // gradient, solid, image
  backgroundColors = "from-indigo-600 to-purple-600",
  solidColor = "bg-indigo-600",
  imageUrl = "",
  className = "",
  showBadge = false,
  badgeText = "New Feature",
  size = "large" // small, medium, large
}) => {
  const sizeClasses = {
    small: "py-12 px-6",
    medium: "py-16 px-8",
    large: "py-20 px-12"
  };

  const titleSizes = {
    small: "text-2xl md:text-3xl",
    medium: "text-3xl md:text-4xl",
    large: "text-4xl md:text-5xl"
  };

  const getBackgroundClasses = () => {
    switch (background) {
      case "gradient":
        return `bg-gradient-to-r ${backgroundColors}`;
      case "solid":
        return solidColor;
      case "image":
        return `bg-cover bg-center bg-no-repeat`;
      default:
        return `bg-gradient-to-r ${backgroundColors}`;
    }
  };

  const getButtonClasses = (variant) => {
    const baseClasses = "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 group";
    
    switch (variant) {
      case "primary":
        return `${baseClasses} bg-white text-indigo-600 hover:bg-gray-50 hover:scale-105 hover:shadow-xl`;
      case "secondary":
        return `${baseClasses} border-2 border-white text-white hover:bg-white hover:text-indigo-600 hover:scale-105`;
      case "outline":
        return `${baseClasses} border-2 border-white text-white hover:bg-white hover:text-indigo-600 hover:scale-105`;
      default:
        return `${baseClasses} bg-white text-indigo-600 hover:bg-gray-50 hover:scale-105 hover:shadow-xl`;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className={`relative overflow-hidden ${className}`}>
      {/* Background Image Overlay */}
      {background === "image" && imageUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${imageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
      )}
      
      {/* Background Gradient/Solid */}
      {background !== "image" && (
        <div className={`absolute inset-0 ${getBackgroundClasses()}`}></div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className={`${sizeClasses[size]}`}
        >
          {/* Badge */}
          {showBadge && (
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <FiStar className="w-4 h-4" />
              {badgeText}
            </motion.div>
          )}

          {/* Title */}
          <motion.h2
            variants={itemVariants}
            className={`${titleSizes[size]} font-bold text-white mb-6 leading-tight`}
          >
            {title}
          </motion.h2>

          {/* Subtitle */}
          <motion.p
            variants={itemVariants}
            className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>

          {/* Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Primary Button */}
            <button
              onClick={primaryButton.action}
              className={getButtonClasses(primaryButton.variant)}
            >
              {primaryButton.icon && <primaryButton.icon className="w-5 h-5" />}
              {primaryButton.text}
            </button>

            {/* Secondary Button */}
            {secondaryButton && (
              <button
                onClick={secondaryButton.action}
                className={getButtonClasses(secondaryButton.variant)}
              >
                {secondaryButton.icon && <secondaryButton.icon className="w-5 h-5" />}
                {secondaryButton.text}
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-float"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-white/10 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-20 w-12 h-12 bg-white/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
      </div>
    </section>
  );
};

export default CallToAction;
