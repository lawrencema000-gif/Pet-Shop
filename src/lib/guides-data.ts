export interface Guide {
  slug: string;
  title: string;
  description: string;
  image: string;
  author: string;
  readTime: string;
  categorySlug: string;
  content: string;
}

export const GUIDES: Guide[] = [
  {
    slug: "smart-feeders",
    title: "The Complete Smart Feeder Buying Guide",
    description:
      "Everything you need to know about choosing the right automatic pet feeder for your home, lifestyle, and furry friend.",
    image:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=1200&h=600&fit=crop",
    author: "Pet and Angels Team",
    readTime: "8 min read",
    categorySlug: "smart-feeders",
    content: `
<p class="text-lg text-muted leading-relaxed">Choosing a smart feeder can feel overwhelming with so many options on the market. This comprehensive guide will walk you through every factor worth considering — from basic gravity feeders to app-controlled camera models — so you can find the perfect match for your pet and lifestyle.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Why Switch to a Smart Feeder?</h2>
<p class="text-muted leading-relaxed">Smart feeders solve one of the biggest challenges of pet ownership: consistent, reliable feeding schedules. Whether you work long hours, travel frequently, or simply want to monitor your pet's eating habits, an automated feeder gives you peace of mind. Studies show that pets thrive on routine, and a smart feeder delivers meals at the exact same time every day — no more early-morning wake-up calls from a hungry cat.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Types of Smart Feeders</h2>
<p class="text-muted leading-relaxed mb-4">Not all automatic feeders are created equal. Here are the main categories:</p>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">Gravity Feeders</strong> — The simplest option. Food flows down as your pet eats. No scheduling, no portion control. Best for pets that self-regulate well, though most pets will overeat with unlimited access.</li>
  <li><strong class="text-foreground">Timer-Based Feeders</strong> — Dispense set portions at scheduled times. Great for basic automation but typically lack app connectivity or remote control.</li>
  <li><strong class="text-foreground">Wi-Fi Connected Feeders</strong> — The gold standard. Control schedules, portion sizes, and feeding times from your phone. Many include feeding logs and notifications so you always know when your pet has eaten.</li>
  <li><strong class="text-foreground">Camera Feeders</strong> — Wi-Fi feeders with a built-in camera and two-way audio. Watch your pet eat in real time, talk to them remotely, and record video clips. Ideal for pet parents who travel or work away from home.</li>
  <li><strong class="text-foreground">RFID/Microchip Feeders</strong> — Use RFID collar tags or your pet's microchip to control access. Only the assigned pet can open the lid. Essential for multi-pet households where one pet steals the other's food or requires a special diet.</li>
</ul>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Key Features to Look For</h2>
<p class="text-muted leading-relaxed mb-4">When comparing smart feeders, pay attention to these critical features:</p>

<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">Food Capacity & Portion Control</h3>
<p class="text-muted leading-relaxed">Hopper capacity ranges from 2 liters (about 4 days for a cat) to 6+ liters (2+ weeks). Larger capacity means fewer refills, but also means the food sits longer. Look for feeders with airtight seals and desiccant holders to keep kibble fresh. Portion sizes should be adjustable in small increments — ideally 1/12 cup or finer — so you can dial in the exact amount your vet recommends.</p>

<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">App Control & Connectivity</h3>
<p class="text-muted leading-relaxed">A good companion app should let you set multiple meals per day, adjust portions, view feeding history, and receive notifications when food is dispensed or the hopper is low. Dual-band Wi-Fi (2.4 GHz + 5 GHz) ensures a more reliable connection. Some feeders also support voice assistants like Alexa or Google Home for hands-free dispensing.</p>

<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">Camera & Audio Quality</h3>
<p class="text-muted leading-relaxed">If you're considering a camera feeder, look for at least 1080p resolution with night vision. A wide-angle lens (140° or more) captures the full feeding area. Two-way audio lets you call your pet to the feeder and hear them eating. Some premium models offer motion-triggered recording and cloud storage for video clips.</p>

<h3 class="text-xl font-semibold text-foreground mt-6 mb-3">Build Quality & Cleaning</h3>
<p class="text-muted leading-relaxed">The food bowl and any parts that contact food should be stainless steel or BPA-free plastic. Stainless steel is easier to sanitize and won't harbor bacteria the way scratched plastic can. The bowl and hopper lid should be easily removable for regular cleaning — dishwasher-safe components are a huge plus.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Comparison: Our Top 3 Smart Feeders</h2>
<div class="overflow-x-auto mt-4 mb-8">
  <table class="w-full border-collapse text-sm">
    <thead>
      <tr class="border-b border-border">
        <th class="text-left py-3 px-4 font-semibold text-foreground">Feature</th>
        <th class="text-left py-3 px-4 font-semibold text-foreground">Granary Camera Feeder</th>
        <th class="text-left py-3 px-4 font-semibold text-foreground">Granary Basic Feeder</th>
        <th class="text-left py-3 px-4 font-semibold text-foreground">One RFID Feeder</th>
      </tr>
    </thead>
    <tbody class="text-muted">
      <tr class="border-b border-border/50">
        <td class="py-3 px-4 font-medium text-foreground">Camera</td>
        <td class="py-3 px-4">1080p with night vision</td>
        <td class="py-3 px-4">No</td>
        <td class="py-3 px-4">No</td>
      </tr>
      <tr class="border-b border-border/50">
        <td class="py-3 px-4 font-medium text-foreground">Capacity</td>
        <td class="py-3 px-4">5L (~20 cups)</td>
        <td class="py-3 px-4">4L (~16 cups)</td>
        <td class="py-3 px-4">5L (~20 cups)</td>
      </tr>
      <tr class="border-b border-border/50">
        <td class="py-3 px-4 font-medium text-foreground">App Control</td>
        <td class="py-3 px-4">Yes (2.4 GHz Wi-Fi)</td>
        <td class="py-3 px-4">Yes (2.4 GHz Wi-Fi)</td>
        <td class="py-3 px-4">Yes (2.4 GHz Wi-Fi)</td>
      </tr>
      <tr class="border-b border-border/50">
        <td class="py-3 px-4 font-medium text-foreground">Multi-Pet</td>
        <td class="py-3 px-4">No (shared bowl)</td>
        <td class="py-3 px-4">No (shared bowl)</td>
        <td class="py-3 px-4">Yes — RFID collar tags</td>
      </tr>
      <tr class="border-b border-border/50">
        <td class="py-3 px-4 font-medium text-foreground">Price Range</td>
        <td class="py-3 px-4">$89 – $109</td>
        <td class="py-3 px-4">$59 – $69</td>
        <td class="py-3 px-4">$149 – $179</td>
      </tr>
      <tr>
        <td class="py-3 px-4 font-medium text-foreground">Best For</td>
        <td class="py-3 px-4">Remote monitoring</td>
        <td class="py-3 px-4">Budget-friendly automation</td>
        <td class="py-3 px-4">Multi-pet households</td>
      </tr>
    </tbody>
  </table>
</div>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Price Ranges & What to Expect</h2>
<p class="text-muted leading-relaxed mb-4">Smart feeders span a wide price range. Here's what you generally get at each tier:</p>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">$30 – $60:</strong> Basic timer-based feeders with limited scheduling. Reliable but no app control or remote access. Fine for simple, routine feeding.</li>
  <li><strong class="text-foreground">$60 – $100:</strong> Wi-Fi connected feeders with app control, scheduling, and portion customization. The sweet spot for most pet owners who want smart features without breaking the bank.</li>
  <li><strong class="text-foreground">$100 – $150:</strong> Camera feeders with 1080p video, two-way audio, and advanced app features. Worth it if you want to watch and interact with your pet remotely.</li>
  <li><strong class="text-foreground">$150+:</strong> RFID/microchip feeders for multi-pet homes, or premium camera models with cloud storage and AI motion detection. The top tier for serious pet tech enthusiasts.</li>
</ul>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Final Tips</h2>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li>Always transition gradually. Let your pet eat from the new feeder for a few days before turning on automation.</li>
  <li>Keep a backup power plan. Look for feeders with battery backup so your pet gets fed even during power outages.</li>
  <li>Clean the bowl and hopper weekly, even if it doesn't look dirty. Food oils build up and can go rancid.</li>
  <li>Check your Wi-Fi signal where you plan to place the feeder. A weak signal means unreliable remote access.</li>
</ul>
    `,
  },
  {
    slug: "water-fountains",
    title: "How to Choose the Right Pet Water Fountain",
    description:
      "A complete guide to pet water fountains — from filtration systems to materials, capacity, and noise levels.",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=600&fit=crop",
    author: "Pet and Angels Team",
    readTime: "6 min read",
    categorySlug: "water-fountains",
    content: `
<p class="text-lg text-muted leading-relaxed">Cats and dogs are naturally drawn to running water — it signals freshness and safety. A pet water fountain encourages your pet to drink more, which supports kidney health, urinary tract function, and overall hydration. This guide covers everything you need to know to pick the right fountain for your home.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Why a Water Fountain?</h2>
<p class="text-muted leading-relaxed">Veterinarians consistently recommend increasing water intake for cats especially, as they are prone to chronic dehydration when relying on still water bowls. A fountain's constant circulation keeps water oxygenated and cool, making it far more appealing than a stagnant bowl. Many pet owners report a noticeable increase in water consumption within the first week of switching to a fountain — often 2x to 3x more than before.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Filtration Systems</h2>
<p class="text-muted leading-relaxed mb-4">The filtration system is arguably the most important component of any water fountain. Here's what to look for:</p>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">Activated Carbon Filters</strong> — Remove chlorine, odors, and unpleasant tastes from tap water. The most common filter type. Replace every 2–4 weeks depending on use.</li>
  <li><strong class="text-foreground">Ion Exchange Resin</strong> — Softens water by removing calcium and magnesium. Helpful in areas with hard water that can leave mineral deposits.</li>
  <li><strong class="text-foreground">Foam/Sponge Pre-Filters</strong> — Catch hair, debris, and large particles before they reach the pump. Extends pump life and keeps water cleaner between full cleanings.</li>
  <li><strong class="text-foreground">Triple-Filtration Systems</strong> — Combine all three filter types for the cleanest possible water. More expensive to maintain but deliver the best results.</li>
</ul>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Materials: Stainless Steel vs. Plastic vs. Ceramic</h2>
<p class="text-muted leading-relaxed mb-4">The material of your fountain affects hygiene, durability, and aesthetics:</p>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">Stainless Steel</strong> — The most hygienic option. Non-porous, scratch-resistant, and dishwasher-safe. Won't harbor bacteria. Best for cats prone to chin acne (often triggered by plastic bowls). Premium price point.</li>
  <li><strong class="text-foreground">BPA-Free Plastic</strong> — Lightweight and affordable. Modern designs look sleek and are easy to disassemble. However, plastic scratches over time, and those scratches can trap bacteria. Replace plastic fountains every 1–2 years.</li>
  <li><strong class="text-foreground">Ceramic</strong> — Beautiful, heavy (won't tip), and non-porous. A great middle ground between steel and plastic. Downside: can chip or crack if dropped, and they're heavier to clean.</li>
</ul>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Capacity & Multi-Pet Considerations</h2>
<p class="text-muted leading-relaxed">A single cat needs about 7–10 oz of water daily, while a medium dog may need 30–50 oz. For a single pet, a 2-liter fountain works well and stays fresh. Multi-pet homes should look at 3-liter+ models to avoid constant refilling. Some smart fountains include water level sensors and app notifications so you know exactly when to refill — a lifesaver if you travel or have a busy schedule.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Noise Level</h2>
<p class="text-muted leading-relaxed">Pump noise is one of the most common complaints about water fountains. A good fountain operates below 40 dB — quieter than a whisper. Look for brushless DC motors, which are virtually silent and more durable than traditional motors. If you plan to keep the fountain in a bedroom or living room, noise level should be a top priority. Also ensure the pump is fully submerged — a pump running with low water creates a noticeable humming or grinding sound.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Smart Features Worth Having</h2>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">App Connectivity</strong> — Monitor water levels, filter status, and drinking habits from your phone.</li>
  <li><strong class="text-foreground">LED Indicators</strong> — Visual alerts for low water or filter replacement without needing the app.</li>
  <li><strong class="text-foreground">Auto Shut-Off</strong> — Protects the pump when water runs too low. Prevents burn-out and extends pump life.</li>
  <li><strong class="text-foreground">Multiple Flow Modes</strong> — Gentle stream, bubbling top, or free-falling waterfall. Different pets prefer different flow patterns.</li>
</ul>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Maintenance Tips</h2>
<p class="text-muted leading-relaxed">Even the best fountain needs regular care. Clean the entire unit (bowl, pump, and housing) every 1–2 weeks. Replace carbon filters every 2–4 weeks, and foam pre-filters monthly. Descale the pump quarterly with white vinegar to prevent mineral build-up. A well-maintained fountain will last 3–5 years with minimal issues.</p>
    `,
  },
  {
    slug: "litter-boxes",
    title: "Smart Litter Box Buying Guide",
    description:
      "Self-cleaning, odor control, sizing, and multi-cat considerations — everything you need to know about smart litter boxes.",
    image:
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1200&h=600&fit=crop",
    author: "Pet and Angels Team",
    readTime: "7 min read",
    categorySlug: "litter-boxes",
    content: `
<p class="text-lg text-muted leading-relaxed">Scooping the litter box is nobody's favorite chore. Smart self-cleaning litter boxes automate the messiest part of cat ownership, control odor more effectively, and even monitor your cat's health through usage data. This guide helps you decide if a smart litter box is right for you — and how to pick the best one.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">How Self-Cleaning Litter Boxes Work</h2>
<p class="text-muted leading-relaxed mb-4">Most self-cleaning litter boxes use one of two mechanisms:</p>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">Rotating Globe/Drum</strong> — The entire globe rotates after your cat exits, sifting clumps through a screen and depositing them into a sealed waste drawer. Simple, reliable, and relatively quiet. The waste drawer typically holds 7–10 days of waste for a single cat.</li>
  <li><strong class="text-foreground">Rake/Conveyor System</strong> — A mechanical rake sweeps across the litter bed, pushing clumps into a waste compartment. Faster than rotation but can occasionally jam with extra-large clumps. Some models use a conveyor belt that lifts waste up and out.</li>
</ul>
<p class="text-muted leading-relaxed">Both systems use sensors to detect when your cat has entered and exited, then wait a set period (usually 3–7 minutes) before activating. Safety sensors stop the mechanism immediately if a cat re-enters during the cleaning cycle.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Odor Control</h2>
<p class="text-muted leading-relaxed">Odor is the number one reason people upgrade to a smart litter box. Here's how modern models tackle it:</p>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">Sealed Waste Drawers</strong> — Clumps are deposited into a fully sealed compartment with a carbon filter, trapping odor at the source. Most models use standard garbage bags for easy disposal.</li>
  <li><strong class="text-foreground">Carbon/Charcoal Filters</strong> — Placed on the waste drawer or inside the hood, these absorb ammonia and sulfur compounds. Replace every 2–3 months for peak performance.</li>
  <li><strong class="text-foreground">Deodorizer Pods</strong> — Some premium models include fragrance-free deodorizer pods that neutralize odor molecules rather than masking them. Safe for cats and effective for up to 30 days.</li>
  <li><strong class="text-foreground">Prompt Cleaning Cycles</strong> — The fastest way to control odor is simply removing waste quickly. Self-cleaning boxes that activate within minutes keep the litter bed fresh almost constantly.</li>
</ul>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Size & Space Requirements</h2>
<p class="text-muted leading-relaxed">Smart litter boxes are larger than traditional pans. A typical self-cleaning unit measures roughly 24" x 20" x 24" — about the size of a small side table. Before purchasing, measure the space where you plan to put it and ensure your cat has room to enter, turn around, and exit comfortably. Cats weighing up to 15 lbs can use most standard models; for larger cats (15–25 lbs), look for XL models with deeper litter beds and wider openings.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Multi-Cat Households</h2>
<p class="text-muted leading-relaxed">The general rule is one litter box per cat, plus one extra. However, a single self-cleaning litter box can effectively serve 2–3 cats because it cleans after every use, keeping the litter bed fresh. For 3+ cats, consider two units. Smart models with weight sensors and app tracking can actually differentiate between cats, showing you each cat's usage frequency — invaluable for spotting early health issues like urinary problems or digestive changes.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Smart Features & Health Monitoring</h2>
<p class="text-muted leading-relaxed mb-4">Modern smart litter boxes go far beyond basic automation:</p>
<ul class="list-disc pl-6 space-y-2 text-muted">
  <li><strong class="text-foreground">Usage Tracking</strong> — App dashboards show how often each cat uses the box, duration, and even estimated weight. Changes in frequency can signal health issues early.</li>
  <li><strong class="text-foreground">Weight Monitoring</strong> — Built-in scales track your cat's weight over time. Sudden weight loss or gain triggers an alert — often the first sign of illness.</li>
  <li><strong class="text-foreground">Waste Drawer Alerts</strong> — Get notified when the drawer is full so you never forget to empty it. Some models also alert when litter is running low.</li>
  <li><strong class="text-foreground">Child/Pet Safety Lock</strong> — Prevents the cleaning cycle from starting if a child or small animal is near the unit. Essential for homes with toddlers or small dogs.</li>
</ul>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Litter Compatibility</h2>
<p class="text-muted leading-relaxed">Most self-cleaning litter boxes require clumping clay litter for proper sifting. Some models also work with certain crystal or tofu-based clumping litters. Non-clumping litter, newspaper pellets, and pine litter are generally not compatible with automated sifting mechanisms. Check the manufacturer's recommendations before switching litter types — using the wrong kind can jam the mechanism and void your warranty.</p>

<h2 class="text-2xl font-bold text-foreground mt-10 mb-4">Cost Considerations</h2>
<p class="text-muted leading-relaxed">Self-cleaning litter boxes range from $300 to $700+. While the upfront cost is significant, consider the long-term savings: many owners use less litter overall because the box cleans efficiently and doesn't require full dumps as often. Factor in replacement filters ($5–$15 every 2–3 months), waste drawer liners ($10–$15 for a 3-month supply), and electricity (about $1–$2/month). Most owners report the convenience alone is worth the investment within the first month.</p>
    `,
  },
];

export function getGuideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

export function getAllGuideSlugs(): string[] {
  return GUIDES.map((g) => g.slug);
}
