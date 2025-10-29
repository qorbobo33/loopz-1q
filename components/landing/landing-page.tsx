"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Heart, MessageCircle, Share2, Zap } from "lucide-react"

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  }

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "24-Hour Posts",
      description: "Share moments that disappear after 24 hours",
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Real-time Interactions",
      description: "Like, comment, and share instantly with others",
    },
    {
      icon: <MessageCircle className="w-6 h-6" />,
      title: "Live Chat",
      description: "Connect with friends through real-time messaging",
    },
    {
      icon: <Share2 className="w-6 h-6" />,
      title: "Remix Posts",
      description: "Create variations of posts and share your take",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary/5 to-white dark:from-black dark:via-primary/10 dark:to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"
          animate={{ y: [0, 50, 0], x: [0, 30, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl"
          animate={{ y: [0, -50, 0], x: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, delay: 1 }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-6 py-4 md:px-12 md:py-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
          >
            Loopz
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex gap-4"
          >
            <Link
              href="/auth/login"
              className="px-6 py-2 rounded-lg text-foreground hover:bg-secondary smooth-transition"
            >
              Login
            </Link>
            <Link
              href="/auth/sign-up"
              className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 smooth-transition font-medium"
            >
              Sign Up
            </Link>
          </motion.div>
        </nav>

        {/* Hero Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto px-6 md:px-12 py-20 md:py-32"
        >
          <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-bold text-center mb-6 leading-tight">
            Share Moments That
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Disappear in 24 Hours
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-muted-foreground text-center mb-12 max-w-2xl mx-auto"
          >
            Experience the next generation of social media with beautiful animations, real-time interactions, and
            AI-powered features.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center gap-4 mb-20">
            <Link
              href="/auth/sign-up"
              className="px-8 py-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 smooth-transition font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              Get Started
            </Link>
            <Link
              href="/auth/login"
              className="px-8 py-4 rounded-xl border-2 border-primary text-primary hover:bg-primary/10 smooth-transition font-semibold text-lg"
            >
              Explore
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-6 mb-20">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="glass-card p-8 hover:shadow-2xl smooth-transition group"
              >
                <div className="text-primary mb-4 group-hover:scale-110 smooth-transition">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Stats Section */}
          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { number: "100K+", label: "Active Users" },
              { number: "1M+", label: "Posts Shared" },
              { number: "24h", label: "Post Lifespan" },
            ].map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="border-t border-border py-8 px-6 md:px-12 text-center text-muted-foreground"
        >
          <p>&copy; 2025 Loopz. All rights reserved.</p>
        </motion.footer>
      </div>
    </div>
  )
}
