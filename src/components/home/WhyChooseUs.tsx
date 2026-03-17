import { Smartphone, Wifi, Sparkles, ShieldCheck } from "lucide-react";

const features = [
  {
    icon: Smartphone,
    title: "Smart App Control",
    description:
      "Monitor and manage feeding schedules, water intake, and more from your phone.",
  },
  {
    icon: Wifi,
    title: "Connected Living",
    description:
      "All devices connect seamlessly through our intuitive mobile app.",
  },
  {
    icon: Sparkles,
    title: "Easy Maintenance",
    description:
      "Self-cleaning designs and dishwasher-safe parts make life easier.",
  },
  {
    icon: ShieldCheck,
    title: "Safe & Certified",
    description:
      "BPA-free materials and food-grade components for your pet's safety.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-surface py-16 md:py-24">
      <div className="container-main">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Why Pet Parents Love Us
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div key={feature.title} className="text-center p-6">
              <div className="rounded-full bg-white p-4 w-16 h-16 mx-auto shadow-card flex items-center justify-center">
                <feature.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="font-semibold text-lg mt-4">{feature.title}</h3>
              <p className="text-sm text-muted mt-2">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
