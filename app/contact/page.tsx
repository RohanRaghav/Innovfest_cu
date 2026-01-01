import { FAQAccordion } from "@/components/Accordion"
import { Mail, Phone } from "lucide-react"
import Image from "next/image"

const admins = [
  {
    name: "ADITYA KHANDEGAR",
    role: "Media and Publicity Manager",
    phone: "+91 8433683010",
    email: "aditya@techfest.org",
    org: "CU INNOVFEST",
    image: "/admin1.png", // replace with actual image
  },
  {
    name: "RACHIT KUMAR",
    role: "Media and Publicity Manager",
    phone: "+91 9326270382",
    email: "rachit@techfest.org",
    org: "CU INNOVFEST",
    image: "/admin2.png",
  },
  {
    name: "JAYA MEENA",
    role: "Events Manager",
    phone: "+91 7627057719",
    email: "jaya@techfest.org",
    org: "CU INNOVFEST",
    image: "/admin3.png",
  },
]

export default function Page() {
  return (
    <main
      className="min-h-screen container mx-auto px-6 py-16 bg-[#002263]"
    >
      <h1 className="text-4xl font-black mb-12 text-white text-center">Contact Our Team</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 place-items-center">
        {admins.map((admin, i) => (
          <div
            key={i}
            className="relative w-[380px] h-[200px] bg-[#e9eef6]
            rounded-2xl shadow-xl border border-slate-300 overflow-hidden"
          >
            {/* LEFT STRIP */}
            <div className="absolute left-0 top-0 h-full w-14 bg-[#1e3a5f] flex flex-col items-center py-4">
              <div className="text-white text-xs font-bold tracking-wide rotate-90 mt-6">
                CU INNOVFEST
              </div>
            </div>

            {/* CONTENT */}
            <div className="pl-20 pr-4 py-4 h-full flex justify-between">
              {/* TEXT */}
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-black text-[#1e3a5f] leading-tight">
                    {admin.name}
                  </h2>
                  <p className="text-sm font-semibold text-slate-600">
                    {admin.role}
                  </p>
                </div>

                <div className="space-y-1 text-sm text-blue-700">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{admin.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{admin.email}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-500">
                    {admin.org}
                  </div>
                </div>

                {/* SOCIALS */}
                <div className="flex gap-4 mt-2 text-slate-700">
                  <span className="font-bold">IG</span>
                  <span className="font-bold">X</span>
                  <span className="font-bold">IN</span>
                </div>
              </div>

              {/* PHOTO */}
              <div className="w-[90px] h-[110px] bg-slate-300 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={admin.image}
                  alt={admin.name}
                  width={90}
                  height={110}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div>
        <FAQAccordion />
      </div>
    </main>
  )
}
