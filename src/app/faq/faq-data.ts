export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionData {
  title: string;
  iconName: string;
  items: FAQItem[];
}

export const faqSections: FAQSectionData[] = [
  {
    title: "Shipping & Delivery",
    iconName: "Truck",
    items: [
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping typically takes 5-7 business days. Express shipping arrives in 2-3 business days, and overnight delivery is available for orders placed before 2 PM EST. All orders are processed within 1-2 business days before shipping.",
      },
      {
        question: "Do you offer free shipping?",
        answer:
          "Yes! We offer free standard shipping on all orders over $75 within the contiguous United States. Orders under $75 ship for a flat rate of $5.99.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "Currently, we ship to the United States and Canada. International shipping rates and delivery times vary by destination. We're working on expanding to more countries — sign up for our newsletter to be notified.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order ships, you'll receive a confirmation email with a tracking number. You can also track your order anytime on our Track Order page by entering your order number and email address.",
      },
    ],
  },
  {
    title: "Returns & Exchanges",
    iconName: "RotateCcw",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy on most items. Products must be in their original condition with all packaging and accessories included. Electronics must be unused and in sealed packaging to qualify for a full refund.",
      },
      {
        question: "How do I start a return?",
        answer:
          "Visit our Returns page or contact our support team at support@petandangel.com. We'll provide a prepaid return label and process your refund within 5-7 business days of receiving the returned item.",
      },
      {
        question: "Can I exchange an item instead of returning it?",
        answer:
          "Absolutely. When initiating your return, select 'Exchange' and choose the replacement item. If there's a price difference, we'll charge or refund the difference accordingly.",
      },
      {
        question: "What items cannot be returned?",
        answer:
          "For hygiene reasons, opened food products, used litter box liners, and personalized items cannot be returned. Filters and other consumable accessories are also non-returnable once opened.",
      },
    ],
  },
  {
    title: "Products & Compatibility",
    iconName: "Package",
    items: [
      {
        question: "Are your smart products compatible with all pets?",
        answer:
          "Our feeders and fountains are designed for cats and small to medium-sized dogs. Each product page lists specific weight and size recommendations. The RFID feeder supports multi-pet households with individual profiles.",
      },
      {
        question: "Do I need Wi-Fi for the smart features?",
        answer:
          "Yes, a 2.4GHz Wi-Fi connection is required for app connectivity and remote features. However, all products function normally without Wi-Fi — scheduled feedings, water circulation, and auto-cleaning will continue to work.",
      },
      {
        question: "How often should I replace filters?",
        answer:
          "Fountain filters should be replaced every 2-4 weeks depending on usage and water hardness. Feeder desiccant pads last about 30 days. We offer convenient subscription plans so you never run out.",
      },
      {
        question: "Is the Pet and Angels app free?",
        answer:
          "Yes, the Pet and Angels app is completely free for iOS and Android. All smart features including scheduling, monitoring, and notifications are included at no extra cost. There are no subscription fees for app functionality.",
      },
    ],
  },
  {
    title: "Orders & Payments",
    iconName: "ShoppingBag",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, Apple Pay, Google Pay, and Shop Pay. All transactions are secured with SSL encryption.",
      },
      {
        question: "Can I modify or cancel my order?",
        answer:
          "Orders can be modified or cancelled within 2 hours of placement. After that, your order enters our fulfillment process. Contact us immediately at support@petandangel.com and we'll do our best to accommodate changes.",
      },
      {
        question: "Do you offer discounts for multiple items?",
        answer:
          "Yes! We frequently run bundle deals where you can save 15-25% when purchasing complementary products together. Check our Flash Sale page for current promotions, and sign up for our newsletter for exclusive discount codes.",
      },
    ],
  },
  {
    title: "Account & Support",
    iconName: "User",
    items: [
      {
        question: "Do I need an account to place an order?",
        answer:
          "No, you can check out as a guest. However, creating an account lets you track orders, save favorites, access order history, and check out faster on future purchases.",
      },
      {
        question: "How do I contact customer support?",
        answer:
          "You can reach us via our Contact page, email at support@petandangel.com, or call us at (888) 555-PETS during business hours (Mon-Fri 9 AM - 6 PM EST, Sat 10 AM - 4 PM EST).",
      },
      {
        question: "Is my personal information secure?",
        answer:
          "Absolutely. We use industry-standard SSL encryption and never store your full payment details. Your data is protected in compliance with our Privacy Policy, and we never sell personal information to third parties.",
      },
    ],
  },
];
