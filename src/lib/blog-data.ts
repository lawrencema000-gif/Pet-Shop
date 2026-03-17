export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  author_role: string;
  published_at: string;
  read_time: number;
  image_url: string;
  tags: string[];
  featured: boolean;
}

export const BLOG_CATEGORIES = [
  "Feeding & Nutrition",
  "Hydration",
  "Health & Wellness",
  "Product Guides",
  "Pet Care Tips",
];

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "complete-guide-automatic-pet-feeders",
    title: "The Complete Guide to Automatic Pet Feeders",
    excerpt:
      "Automatic pet feeders have revolutionized the way we care for our furry companions. Learn everything you need to know about choosing, setting up, and getting the most out of your smart feeder.",
    category: "Product Guides",
    author: "Dr. Sarah Mitchell",
    author_role: "Veterinary Nutritionist",
    published_at: "2026-03-15",
    read_time: 8,
    image_url:
      "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&h=630&fit=crop",
    tags: ["automatic feeders", "smart feeding", "pet nutrition", "pet tech"],
    featured: true,
    content: `
      <h2>Why Automatic Pet Feeders Are a Game-Changer</h2>
      <p>Gone are the days of rushing home to feed your pet on time. <strong>Automatic pet feeders</strong> have transformed pet care by ensuring your cat or dog receives perfectly portioned meals on a consistent schedule, whether you're at home, at work, or on vacation. Modern smart feeders go far beyond simple timers — they offer app control, portion precision, and even built-in cameras so you can watch your pet eat in real time.</p>

      <h2>Types of Automatic Pet Feeders</h2>
      <p>Not all automatic feeders are created equal. Here are the main types to consider:</p>
      <ul>
        <li><strong>Gravity feeders:</strong> The simplest option — food flows down as your pet eats. Best for pets that self-regulate, but not ideal for overeaters.</li>
        <li><strong>Programmable timed feeders:</strong> Allow you to set specific meal times and portion sizes. A great mid-range option for most pet parents.</li>
        <li><strong>Smart Wi-Fi feeders:</strong> Connect to your phone for remote control, scheduling, and monitoring. Many include cameras and two-way audio.</li>
        <li><strong>RFID feeders:</strong> Use your pet's microchip or a collar tag to open only for the designated pet — perfect for multi-pet households.</li>
      </ul>

      <h2>Key Features to Look For</h2>
      <p>When shopping for an automatic feeder, prioritize these features:</p>
      <ul>
        <li><strong>Portion control:</strong> Look for feeders that dispense precise amounts, measured in grams or cups. Overfeeding is a leading cause of pet obesity.</li>
        <li><strong>Food capacity:</strong> Consider how many days of food the hopper can hold. Larger capacities (3-5 liters) mean less frequent refills.</li>
        <li><strong>Power backup:</strong> Battery backup ensures your pet gets fed even during power outages. This is non-negotiable.</li>
        <li><strong>Easy cleaning:</strong> Removable, dishwasher-safe components make maintenance hassle-free.</li>
        <li><strong>Freshness seal:</strong> Airtight hoppers with desiccant bags keep kibble fresh and prevent staleness.</li>
      </ul>

      <h2>Setting Up Your Feeder for Success</h2>
      <p>The first week is critical. Start by placing the feeder next to your pet's current food bowl so they associate it with mealtime. Run a few manual dispenses while your pet watches so they understand where the food comes from. Gradually transition from manual feeding to the automated schedule over 5-7 days. Most pets adapt quickly once they hear the familiar dispensing sound.</p>

      <h2>Our Top Recommendation</h2>
      <p>For most pet parents, we recommend the <strong>Granary Smart Camera Feeder</strong>. It combines precise 1-gram portion control, a 5L capacity hopper, HD camera with night vision, two-way audio, and a backup battery — all controlled through an intuitive app. It's the complete package for modern pet care, and our best-selling feeder for three years running.</p>
    `,
  },
  {
    id: "2",
    slug: "why-your-cat-needs-water-fountain",
    title: "Why Your Cat Needs a Water Fountain: 5 Health Benefits",
    excerpt:
      "Cats are notoriously bad at staying hydrated, which can lead to serious kidney and urinary issues. Discover how a simple water fountain can dramatically improve your cat's health and water intake.",
    category: "Hydration",
    author: "Dr. Emily Park",
    author_role: "Feline Health Specialist",
    published_at: "2026-03-12",
    read_time: 5,
    image_url:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&h=630&fit=crop",
    tags: ["cat health", "water fountain", "hydration", "kidney health"],
    featured: true,
    content: `
      <h2>The Hidden Danger of Dehydration in Cats</h2>
      <p>As a feline health specialist, one of the most common issues I see is chronic dehydration. Cats evolved as desert animals and have a naturally low thirst drive, which means they often don't drink enough water from a still bowl. <strong>Chronic dehydration</strong> is a leading contributor to kidney disease, urinary crystals, and bladder infections — conditions that affect nearly 1 in 3 cats over the age of 10.</p>

      <h2>5 Proven Health Benefits of Water Fountains</h2>
      <p>Research and clinical experience consistently show that water fountains encourage cats to drink more. Here are the five key benefits:</p>

      <h3>1. Increased Water Intake</h3>
      <p>Studies show that cats drink <strong>up to 50% more water</strong> from a fountain compared to a still bowl. The movement and sound of flowing water triggers their natural instinct to seek out fresh, running water sources — a behavior inherited from their wild ancestors.</p>

      <h3>2. Better Kidney Health</h3>
      <p>Proper hydration helps the kidneys flush toxins efficiently. Veterinarians consistently recommend water fountains for cats with early-stage kidney disease, and many cat parents report improved kidney values after switching to a fountain.</p>

      <h3>3. Reduced Risk of Urinary Issues</h3>
      <p>Diluted urine means fewer crystals and a lower risk of painful urinary blockages. This is especially critical for male cats, who are more prone to life-threatening urinary obstructions.</p>

      <h3>4. Fresher, Cleaner Water</h3>
      <p>Quality water fountains include multi-stage filtration that removes hair, debris, and impurities. The constant circulation prevents bacterial growth that occurs in stagnant water bowls within just 24 hours.</p>

      <h3>5. Encourages Finicky Drinkers</h3>
      <p>Many cats refuse to drink from bowls placed near their food, or they only drink from the bathroom faucet. A fountain gives them the moving water experience they prefer, placed wherever works best in your home.</p>

      <h2>Choosing the Right Fountain</h2>
      <p>Look for fountains made from <strong>stainless steel or ceramic</strong> rather than plastic, which can harbor bacteria and cause chin acne in sensitive cats. A quiet pump is essential — some cats are startled by loud motors. We recommend the <strong>Dockstream 2 Smart Fountain</strong> for its ultra-quiet operation, 5-stage filtration, and smart app integration that reminds you when to change the filter.</p>
    `,
  },
  {
    id: "3",
    slug: "smart-litter-box-vs-traditional",
    title: "Smart Litter Box vs Traditional: Which Is Right for You?",
    excerpt:
      "Self-cleaning smart litter boxes promise to eliminate scooping forever, but are they worth the investment? We break down the pros, cons, and real-world performance of both options.",
    category: "Product Guides",
    author: "Mark Thompson",
    author_role: "Pet Tech Reviewer",
    published_at: "2026-03-10",
    read_time: 6,
    image_url:
      "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=1200&h=630&fit=crop",
    tags: [
      "litter box",
      "smart litter box",
      "cat care",
      "product comparison",
    ],
    featured: false,
    content: `
      <h2>The Great Litter Box Debate</h2>
      <p>If you're a cat parent, you know that the litter box is the least glamorous part of the job. <strong>Smart self-cleaning litter boxes</strong> have emerged as a premium solution, promising to handle the dirty work automatically. But with prices ranging from $400 to $700, many cat owners wonder if they're worth the upgrade from a $20 traditional box. Let's break it down honestly.</p>

      <h2>Traditional Litter Boxes: The Case For Simplicity</h2>
      <p>Traditional litter boxes have been the standard for decades, and they work. Here's what they offer:</p>
      <ul>
        <li><strong>Low upfront cost:</strong> A quality open or covered litter box costs $15-40.</li>
        <li><strong>No moving parts:</strong> Nothing to break, no motors to replace, no app to troubleshoot.</li>
        <li><strong>Any litter type:</strong> Works with clumping, non-clumping, crystal, pine — whatever your cat prefers.</li>
        <li><strong>Simple for cats:</strong> No mechanical sounds that might scare timid cats away from using the box.</li>
      </ul>
      <p>The downside? You're scooping at least once daily, dealing with odors between cleanings, and manually tracking your cat's bathroom habits.</p>

      <h2>Smart Litter Boxes: The Premium Experience</h2>
      <p>Modern smart litter boxes like the <strong>Luma Self-Cleaning Litter Box</strong> offer a fundamentally different experience:</p>
      <ul>
        <li><strong>Automatic cleaning:</strong> The box scoops itself minutes after your cat uses it, depositing waste into a sealed compartment.</li>
        <li><strong>Odor control:</strong> Sealed waste compartments and carbon filters eliminate smells almost entirely.</li>
        <li><strong>Health monitoring:</strong> Smart sensors track usage frequency, duration, and weight — alerting you to potential health issues before symptoms appear.</li>
        <li><strong>App notifications:</strong> Know when the waste drawer needs emptying, when to add litter, and receive usage reports.</li>
      </ul>

      <h2>The Verdict: Who Should Upgrade?</h2>
      <p>A smart litter box makes the most sense if you have a busy lifestyle and don't want to scoop daily, if you have multiple cats and need better odor control, or if you want health monitoring data for aging cats. The Luma pays for itself in time savings within 6-8 months for most owners. If you have a single cat, a tight budget, or a cat that's easily spooked by mechanical devices, a traditional box with diligent scooping is perfectly fine.</p>
    `,
  },
  {
    id: "4",
    slug: "signs-pet-not-drinking-enough-water",
    title: "10 Signs Your Pet Isn't Drinking Enough Water",
    excerpt:
      "Dehydration in pets can sneak up on you and lead to serious health problems. Learn the warning signs every pet parent should watch for, and what to do about it.",
    category: "Health & Wellness",
    author: "Dr. Emily Park",
    author_role: "Feline Health Specialist",
    published_at: "2026-03-08",
    read_time: 4,
    image_url:
      "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&h=630&fit=crop",
    tags: ["dehydration", "pet health", "water intake", "warning signs"],
    featured: false,
    content: `
      <h2>Why Hydration Matters More Than You Think</h2>
      <p>Water makes up about <strong>60-70% of your pet's body weight</strong>, and even mild dehydration can affect organ function, digestion, and energy levels. Unlike humans, pets can't tell you they're thirsty — so it's up to you to recognize the signs. Here are the 10 most important warning signals.</p>

      <h2>The 10 Warning Signs</h2>

      <h3>1. Dry or Sticky Gums</h3>
      <p>Lift your pet's lip and touch their gums. Healthy gums should be wet and slippery. If they feel dry, tacky, or sticky, your pet is likely dehydrated.</p>

      <h3>2. Loss of Skin Elasticity</h3>
      <p>Gently pinch the skin between your pet's shoulder blades and release. In a well-hydrated pet, the skin snaps back immediately. If it stays tented or returns slowly, dehydration is likely.</p>

      <h3>3. Sunken Eyes</h3>
      <p>Dehydrated pets often have eyes that appear dull or slightly sunken into their sockets. This is a more advanced sign and warrants immediate attention.</p>

      <h3>4. Lethargy and Low Energy</h3>
      <p>If your usually playful pet seems unusually tired, unwilling to play, or reluctant to move, dehydration could be the culprit.</p>

      <h3>5. Dark Yellow or Concentrated Urine</h3>
      <p>Healthy urine should be light yellow. Dark, strong-smelling urine indicates your pet isn't getting enough water to properly dilute their waste.</p>

      <h3>6. Decreased Appetite</h3>
      <p>Dehydration often leads to nausea and reduced interest in food. If your pet is skipping meals, check their water intake.</p>

      <h3>7. Panting Excessively (Dogs)</h3>
      <p>While panting is normal after exercise, excessive panting at rest can indicate dehydration or overheating.</p>

      <h3>8. Dry Nose</h3>
      <p>A consistently dry, cracked nose — especially in dogs — can be an indicator of inadequate hydration, though it's not always reliable on its own.</p>

      <h3>9. Reduced Urination</h3>
      <p>If your pet is urinating less frequently or producing smaller amounts, they may not be drinking enough water.</p>

      <h3>10. Thick Saliva</h3>
      <p>Healthy saliva should be thin and watery. Thick, ropy saliva is a sign your pet needs more fluids.</p>

      <h2>What to Do About It</h2>
      <p>If you notice any of these signs, offer fresh water immediately and contact your vet if symptoms persist for more than a few hours. For long-term prevention, consider a <strong>pet water fountain</strong> — the flowing water encourages pets to drink more naturally. Place multiple water stations around your home, and always ensure fresh water is available.</p>
    `,
  },
  {
    id: "5",
    slug: "transition-pet-to-automatic-feeder",
    title: "How to Transition Your Pet to an Automatic Feeder",
    excerpt:
      "Switching from manual to automatic feeding doesn't have to be stressful. Follow our proven step-by-step process to help your pet adapt smoothly and confidently.",
    category: "Feeding & Nutrition",
    author: "Dr. Sarah Mitchell",
    author_role: "Veterinary Nutritionist",
    published_at: "2026-03-05",
    read_time: 5,
    image_url:
      "https://images.unsplash.com/photo-1450778869180-e77d3083f9c0?w=1200&h=630&fit=crop",
    tags: ["automatic feeder", "pet training", "feeding schedule", "transition"],
    featured: false,
    content: `
      <h2>Why the Transition Period Matters</h2>
      <p>Pets are creatures of habit, and any change to their feeding routine can cause anxiety or reluctance. Rushing the transition to an automatic feeder is the number one reason pet parents give up on them. <strong>A gradual, patient approach</strong> ensures your pet associates the new feeder with positive experiences, not stress. Most pets fully adapt within 7-10 days when you follow the right steps.</p>

      <h2>Step-by-Step Transition Guide</h2>

      <h3>Days 1-2: Introduction Without Feeding</h3>
      <p>Place the automatic feeder near your pet's current food bowl, but don't use it yet. Let your pet sniff and investigate the new device at their own pace. If your pet is nervous around new objects, place treats on and around the feeder to create positive associations.</p>

      <h3>Days 3-4: Manual Dispensing</h3>
      <p>Use the feeder's manual dispense button to release food while your pet is watching. This helps them connect the sound and sight of the feeder with food delivery. Continue feeding their normal meals from the regular bowl alongside this.</p>

      <h3>Days 5-6: Hybrid Feeding</h3>
      <p>Start feeding one meal per day from the automatic feeder while keeping other meals manual. Set the automatic meal for when your pet is typically hungriest — they'll be more motivated to eat from the new source.</p>

      <h3>Days 7-10: Full Transition</h3>
      <p>Gradually shift all meals to the automatic feeder. Remove the old food bowl once your pet is consistently eating from the feeder without hesitation. Monitor their food intake for the first few weeks to ensure they're eating their full portions.</p>

      <h2>Troubleshooting Common Issues</h2>
      <ul>
        <li><strong>Pet is scared of the dispensing sound:</strong> Start with smaller portions that make less noise. Some feeders have adjustable motor speeds.</li>
        <li><strong>Pet tries to break into the hopper:</strong> Choose a feeder with a secure locking lid and anti-tamper design.</li>
        <li><strong>Pet ignores the feeder:</strong> Try adding a small amount of a high-value treat on top of the dispensed food to attract them.</li>
        <li><strong>Multi-pet household conflicts:</strong> Consider RFID feeders that only open for the designated pet, preventing food theft.</li>
      </ul>

      <h2>Setting the Right Schedule</h2>
      <p>Consult your veterinarian about the ideal feeding schedule and portion sizes for your pet's breed, age, and weight. Most adult dogs do well with two meals per day, while cats often prefer 3-4 smaller meals. The beauty of a smart feeder is the precision — you can dial in exact portions and timing, then adjust based on your pet's response.</p>
    `,
  },
  {
    id: "6",
    slug: "ultimate-guide-smart-home-pet-devices",
    title: "The Ultimate Pet Parent's Guide to Smart Home Devices",
    excerpt:
      "From smart feeders to self-cleaning litter boxes, the world of connected pet devices is booming. Here's everything you need to know to build the ultimate smart pet home.",
    category: "Pet Care Tips",
    author: "Mark Thompson",
    author_role: "Pet Tech Reviewer",
    published_at: "2026-03-01",
    read_time: 7,
    image_url:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=1200&h=630&fit=crop",
    tags: ["smart home", "pet tech", "iot", "connected devices", "pet gadgets"],
    featured: true,
    content: `
      <h2>The Smart Pet Home Revolution</h2>
      <p>The pet tech industry has exploded in recent years, growing from a niche market to a <strong>$10 billion global industry</strong>. Today's smart pet devices don't just make your life easier — they actively improve your pet's health and wellbeing through data-driven insights, automated care, and real-time monitoring. Whether you're a first-time pet parent or a seasoned pro, there's never been a better time to upgrade your pet care setup.</p>

      <h2>The Essential Smart Pet Devices</h2>

      <h3>Smart Feeders</h3>
      <p>The cornerstone of any smart pet home. Modern feeders like the <strong>Granary Smart Camera Feeder</strong> offer precise portion control down to 1 gram, scheduling for multiple meals per day, and built-in cameras with two-way audio. The best models include backup batteries so your pet never misses a meal, even during power outages.</p>

      <h3>Water Fountains</h3>
      <p>Smart water fountains ensure your pet always has access to fresh, filtered water. Look for models with app-connected filter replacement reminders, water level sensors, and multi-stage filtration. The <strong>Dockstream 2</strong> leads the category with its ultra-quiet pump and 5-stage purification system.</p>

      <h3>Self-Cleaning Litter Boxes</h3>
      <p>Perhaps the most life-changing device for cat parents. Smart litter boxes automatically clean after each use, track your cat's bathroom habits for health monitoring, and send notifications when the waste drawer needs emptying. The <strong>Luma Smart Litter Box</strong> adds weight tracking and usage analytics.</p>

      <h3>Pet Cameras</h3>
      <p>Standalone pet cameras let you check in on your furry friends throughout the day. Premium models offer treat dispensing, two-way audio, and motion alerts. Many smart feeders now include built-in cameras, reducing the need for a separate device.</p>

      <h2>Building Your Connected Ecosystem</h2>
      <p>The real magic happens when your devices work together. Look for products that share a single app ecosystem — this lets you monitor feeding, hydration, and litter box usage from one dashboard. You'll start to see patterns: maybe your cat drinks more water on days she eats more dry food, or your dog's feeding schedule affects his energy levels. These insights help you optimize your pet's care routine based on real data, not guesswork.</p>

      <h2>What to Budget</h2>
      <p>A complete smart pet setup — feeder, fountain, and litter box — typically runs between $500-900. While the upfront cost is higher than traditional alternatives, the time savings, health monitoring, and peace of mind pay dividends over your pet's lifetime. Many brands offer <strong>bundle discounts of 15-25%</strong> when you purchase multiple devices together, making the upgrade more accessible.</p>
    `,
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getFeaturedPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.featured);
}

export function getRelatedPosts(currentSlug: string, limit = 3): BlogPost[] {
  const current = getBlogPostBySlug(currentSlug);
  if (!current) return blogPosts.slice(0, limit);

  return blogPosts
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 1 : 0;
      const bMatch = b.category === current.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}

export function getPostsByCategory(category: string): BlogPost[] {
  return blogPosts.filter((post) => post.category === category);
}
