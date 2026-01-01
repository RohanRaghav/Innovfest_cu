"use client"

import { motion } from "framer-motion"
import { Target, Users, BookOpen, Rocket, Award, Lightbulb, Zap } from "lucide-react"

export function AboutProgram() {
  const benefits = [
    {
      icon: Target,
      title: "Leadership Experience",
      description:
        "Lead innovation-driven initiatives and represent CU INNOVFEST within your department and beyond.",
    },
    {
      icon: Award,
      title: "Official Recognition",
      description:
        "Earn certificates, appreciation letters, and recognition from CU INNOVFEST.",
    },
    {
      icon: Rocket,
      title: "Performance-Based Growth & Rewards",
      description:
        "Advance your skills, recognition, and rewards through measurable contributions and impactful performance at CU InnovFest.",
    },
    {
      icon: BookOpen,
      title: "Engage. Grow. Experience. Connect.",
      description:
        "The more you engage, the more you grow—gaining real-world experience while building meaningful connections and expanding your network.",
    },
  ]

  return (
    <section
      className="py-32 bg-[#002263] relative overflow-hidden"
      id="about"
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          {/* LEFT CONTENT */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl text-[#f8f2bf] font-black mb-6 tracking-tight leading-tight">
                Become a Campus Ambassador
              </h2>
              <h3 className="text-3xl md:4xl text-[#f8f2bf] font-black mb-6 tracking-tight leading-tight">About Us</h3>
              <p className="text-lg mb-6 leading-relaxed text-white text-justify">
                CU InnovFest 2026, hosted by Chandigarh University, is India’s premier innovation festival that brings together young minds, innovators, and distinguished dignitaries from diverse domains. The Campus Ambassador Program gives you the opportunity to be part of the team that drives this grand celebration of innovation. Through engaging challenges, hands-on exposure, and continuous learning, this journey transforms you from a participant into a leader.
              </p>

              <p className="text-lg text-white mb-8 leading-relaxed text-justify">
Being a Campus Ambassador isn’t just about promotion; it’s about discovering your potential. You’ll connect with students, innovators, and professionals across institutions while exploring opportunities beyond the obvious. From strategy and outreach to coordination and execution, you’ll experience diverse roles that help you build confidence and uncover your strengths.
              </p>
              <p className="text-lg text-white mb-8 leading-relaxed text-justify">

We recognize every contribution and celebrate every milestone. The more you engage, the more you grow. Whether you’re curious, creative, analytical, or all of these—you’ll find your place here. Ready to step forward and make an impact? Join the Campus Ambassador Program and begin your CU InnovFest 2026 journey.
              </p>
              
            </motion.div>
          </div>

          {/* RIGHT GRID */}
<div className="lg:w-1/2">
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="text-4xl font-black text-[#f8f2bf] mb-10"
  >
    Why Join Us?
  </motion.h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    {benefits.map((benefit, i) => {
      const isLight = i % 4 === 0 || i % 4 === 3

      return (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          viewport={{ once: true }}
          className={`p-8 rounded-3xl border transition-all 
            hover:shadow-2xl group
            ${isLight 
              ? "bg-[#e8e5c3] text-black border-black/10"
              : "bg-[#890304] text-white border-white/10"
            }
          `}
        >
          <div
            className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 transition-all
              ${isLight
                ? "bg-black/10 text-black group-hover:bg-black group-hover:text-white"
                : "bg-white/10 text-white group-hover:bg-white group-hover:text-[#890304]"
              }
            `}
          >
            <benefit.icon className="h-6 w-6" />
          </div>

          <h3 className="font-black text-xl mb-3">
            {benefit.title}
          </h3>

          <p className={`text-sm leading-relaxed ${isLight ? "text-black/70" : "text-white/80"}`}>
            {benefit.description}
          </p>
        </motion.div>
      )
    })}
  </div>
</div>
        </div>
      </div>
    </section>
  )
}
