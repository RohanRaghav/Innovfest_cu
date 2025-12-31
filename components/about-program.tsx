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
      icon: Users,
      title: "Pan-University Networking",
      description:
        "Collaborate with students, innovators, and organizers across Chandigarh University.",
    },
    {
      icon: Award,
      title: "Official Recognition",
      description:
        "Earn certificates, appreciation letters, and recognition from CU INNOVFEST.",
    },
    {
      icon: Rocket,
      title: "Career & Growth Opportunities",
      description:
        "Stand out for future internships, core team roles, and leadership positions.",
    },
    {
      icon: Lightbulb,
      title: "Skill Development",
      description:
        "Build real-world skills in communication, management, teamwork, and execution.",
    },
    {
      icon: BookOpen,
      title: "Hands-on Exposure",
      description:
        "Get direct exposure to event planning, innovation showcases, and fest operations.",
    },
  ]

  return (
    <section
      className="py-32 bg-gradient-to-br 
      from-[#cfe0f6] 
      via-[#c9def7] 
      via-[#dee4f3] 
      via-[#e1e5f2] 
      to-[#d6e1f4] relative overflow-hidden"
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
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight leading-tight">
                Be the Face of <br />
                <span className="text-primary">CU INNOVFEST</span> <br />
                on Your Campus
              </h2>

              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                CU INNOVFEST is Chandigarh University’s flagship innovation and
                technology festival, bringing together creativity, engineering,
                research, and entrepreneurship under one roof. The Campus
                Ambassador Program gives you the opportunity to be part of the
                core force that drives this movement.
              </p>

              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Being a CU INNOVFEST CA is more than promotions—it’s about
                discovering your strengths. From outreach and execution to
                design, coordination, and strategy, you’ll work across diverse
                domains that help you grow from a participant into a leader.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <span className="font-bold">
                    Performance-Based Growth & Rewards
                  </span>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/50 border border-border/50">
                  <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <Users className="h-5 w-5" />
                  </div>
                  <span className="font-bold">
                    Direct Mentorship from Core Organizing Team
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT GRID */}
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-8 rounded-3xl border border-border/50 bg-card 
                hover:border-primary/30 transition-all 
                hover:shadow-2xl hover:shadow-primary/5 group"
              >
                <div
                  className="h-12 w-12 rounded-2xl bg-primary/5 
                  flex items-center justify-center text-primary mb-6 
                  group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                >
                  <benefit.icon className="h-6 w-6" />
                </div>
                <h3 className="font-black text-xl mb-3">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
