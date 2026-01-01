"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Aarav Sharma",
    role: "Campus Ambassador, Delhi",
    image: "https://i.pravatar.cc/150?img=1",
    quote:
      "Being a Campus Ambassador for CU InnovFest completely transformed my confidence. I learned leadership, communication, and made connections nationwide.",
  },
  {
    name: "Simran Kaur",
    role: "CA Lead, Punjab",
    image: "https://i.pravatar.cc/150?img=2",
    quote:
      "This program pushed me beyond my comfort zone. The exposure, mentorship, and recognition are truly unmatched.",
  },
  {
    name: "Rohit Verma",
    role: "Student Innovator",
    image: "https://i.pravatar.cc/150?img=3",
    quote:
      "CU InnovFest gave me a platform to grow professionally while contributing to something meaningful. Highly recommended!",
  },
]

export function CTASection() {
  const [index, setIndex] = useState(0)

  const next = () => setIndex((prev) => (prev + 1) % testimonials.length)
  const prev = () => setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)

  return (
    <section className="py-32 bg-[#002263] relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center text-4xl md:text-6xl font-black text-[#f8f2bf] mb-16"
        >
          What Our Ambassadors Say
        </motion.h2>

        {/* Slider Wrapper */}
<div className="max-w-4xl mx-auto relative flex items-center">
  
  {/* LEFT ARROW */}
  <button
    onClick={prev}
    className="absolute -left-6 md:-left-16 top-1/2 -translate-y-1/2
      h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 
      flex items-center justify-center text-white transition z-10"
  >
    <ChevronLeft />
  </button>

  {/* SLIDE */}
  <div className="w-full">
    <AnimatePresence mode="wait">
      <motion.div
        key={index}
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -60 }}
        transition={{ duration: 0.5 }}
        className="bg-[#890304] rounded-3xl p-10 text-center shadow-2xl"
      >
        <img
          src={testimonials[index].image}
          alt={testimonials[index].name}
          className="h-20 w-20 rounded-full object-cover mx-auto mb-6 border-4 border-[#f8f2bf]"
        />

        <Quote className="h-8 w-8 text-[#f8f2bf] mx-auto mb-6" />

        <p className="text-lg md:text-xl text-white leading-relaxed mb-8">
          “{testimonials[index].quote}”
        </p>

        <h4 className="text-xl font-black text-[#f8f2bf]">
          {testimonials[index].name}
        </h4>
        <p className="text-white/70 text-sm mt-1">
          {testimonials[index].role}
        </p>
      </motion.div>
    </AnimatePresence>
  </div>

  {/* RIGHT ARROW */}
  <button
    onClick={next}
    className="absolute -right-6 md:-right-16 top-1/2 -translate-y-1/2
      h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 
      flex items-center justify-center text-white transition z-10"
  >
    <ChevronRight />
  </button>
</div>
        </div>
    </section>
  )
}
