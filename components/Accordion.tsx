"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

const faqs = [
  {
    question: "How can I contact the CU INNOVFEST organizing team?",
    answer:
      "You can directly reach out to our admins using the contact cards above. Each card includes phone numbers and official email IDs for quick communication.",
  },
  {
    question: "What is the best time to contact the admins?",
    answer:
      "Admins are generally available between 10:00 AM to 6:00 PM on working days. In case of urgent queries, email is the preferred mode of contact.",
  },
  {
    question: "Can I contact admins for event participation queries?",
    answer:
      "Yes. You can contact the respective event or media managers for queries related to registrations, participation, schedules, and guidelines.",
  },
  {
    question: "Are these contacts only for Chandigarh University students?",
    answer:
      "Primarily yes, but external participants collaborating with CU INNOVFEST may also reach out for official coordination and approvals.",
  },
  {
    question: "Will I get a response if I email the admins?",
    answer:
      "Yes. All official emails are actively monitored, and responses are typically provided within 24–48 hours.",
  },
]

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="mt-24 max-w-3xl mx-auto">
      <h2 className="text-3xl font-black text-center mb-10">
        Frequently Asked Questions
      </h2>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-slate-300 rounded-xl bg-white/70 backdrop-blur"
          >
            <button
              onClick={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
              className="w-full flex justify-between items-center p-5 text-left font-semibold"
            >
              <span>{faq.question}</span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  openIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {openIndex === index && (
              <div className="px-5 pb-5 text-muted-foreground text-sm leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
