import express from 'express';

const router = express.Router();

const FAQ_DATABASE = [
  {
    keywords: ['eligibility', 'eligible', 'who can donate', 'age', 'weight'],
    answer: "To be eligible to donate blood, you must be between 18 and 65 years old, weigh at least 50 kg (110 lbs), and be in good general health. You should not have had any recent tattoos, piercings, or major surgeries in the last 6 months, and you should not be on certain medications or have infectious diseases."
  },
  {
    keywords: ['gap', 'frequently', 'how often', 'period', 'days', 'months', 'next donation'],
    answer: "Healthy individuals can donate whole blood every 90 days (3 months). This gap allows your body to fully replenish its red blood cells and iron stores. Platelet donors can donate more frequently, up to once every 7 days (up to 24 times a year)."
  },
  {
    keywords: ['universal donor', 'universal recipient', 'compatibility', 'receive', 'give to', 'match'],
    answer: "Blood compatibility guidelines:\n- O negative (O-) is the Universal Donor; O- blood can be transfused to patients of any blood type.\n- AB positive (AB+) is the Universal Recipient; AB+ patients can receive blood of any type.\n- Otherwise, donors can give to matching types (e.g., A+ can give to A+ and AB+, and receive from A+, A-, O+, O-)."
  },
  {
    keywords: ['types of donation', 'whole blood', 'platelets', 'plasma'],
    answer: "There are three main types of donation:\n1. Whole Blood Donation: The most common type, where all components are collected. Takes about 8-10 minutes.\n2. Platelet Donation (Apheresis): Separates platelets and returns the red cells/plasma. Great for cancer patients. Takes 1.5 - 2 hours.\n3. Plasma Donation: Collects liquid plasma, used for burn victims and clotting treatments. Takes about 1 hour."
  },
  {
    keywords: ['benefits', 'why donate', 'help', 'good for health'],
    answer: "Donating blood saves lives! A single donation can save up to three lives. Health benefits for you include: a free health screening (pulse, blood pressure, temperature, hemoglobin), reduced iron overload (which is good for cardiovascular health), and a wonderful sense of community service."
  },
  {
    keywords: ['post-donation', 'after care', 'dizzy', 'faint', 'recovery', 'eat', 'drink'],
    answer: "After donating:\n- Drink plenty of fluids (water/juice) for the next 24-48 hours.\n- Keep the bandage on for a few hours and avoid heavy lifting or strenuous exercise for the rest of the day.\n- Eat iron-rich foods.\n- If you feel lightheaded, sit down or lie down with your feet elevated until it passes."
  },
  {
    keywords: ['hello', 'hi', 'hey', 'start', 'welcome', 'greetings'],
    answer: "Hello! I am LifeFlow AI, your blood bank assistant. How can I help you today? You can ask me about: donation eligibility, compatibility charts, donation gaps, or recovery care."
  }
];

// @desc    Chatbot response endpoint
// @route   POST /api/chatbot
// @access  Public
router.post('/', (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    const cleanMsg = message.toLowerCase();
    
    // Simple keyword matching search
    let matchedAnswer = null;
    
    for (const faq of FAQ_DATABASE) {
      const match = faq.keywords.some(keyword => cleanMsg.includes(keyword));
      if (match) {
        matchedAnswer = faq.answer;
        break;
      }
    }

    if (!matchedAnswer) {
      matchedAnswer = "I'm not sure I fully understand that question. I can help with topics like blood donation eligibility, donation gaps (how often you can donate), blood group compatibility (universal donors/recipients), types of donations, or post-donation care. Could you please rephrase or ask about one of those?";
    }

    res.json({
      success: true,
      reply: matchedAnswer,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Chatbot error', error: error.message });
  }
});

export default router;
