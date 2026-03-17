import { Truck, RotateCcw, Shield, Lock } from "lucide-react";

const trustItems = [
  {
    icon: Truck,
    title: "Free Shipping",
    subtitle: "On orders $75+",
  },
  {
    icon: RotateCcw,
    title: "30-Day Returns",
    subtitle: "Easy & hassle-free",
  },
  {
    icon: Shield,
    title: "1-Year Warranty",
    subtitle: "On smart devices",
  },
  {
    icon: Lock,
    title: "Secure Checkout",
    subtitle: "SSL encrypted",
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-surface py-6 border-y border-border">
      <div className="container-main">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="flex items-center justify-center gap-3 text-center lg:text-left"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-card">
                <item.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="text-xs text-muted">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
