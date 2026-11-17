/** Leadership team for the About page (photos live in public/assets). */
export const LEADERS = [
  {
    name: 'Mr. Parthiban A.P.',
    role: 'Managing Director',
    photo: '/assets/parthiban.jpeg',
    summary:
      'Distinguished professional with over 25 years of extensive experience in infrastructure and construction. Successfully overseen the development of more than 2.5 million square feet of infrastructure in Chennai. Expertise spans IoT platform integration, cross-sector innovation, and strategic business analysis across fintech, infrastructure, robotics, food processing and automation sectors globally.',
    highlights: [
      { value: '25+', label: 'Years Experience' },
      { value: '2.5M+', label: 'Sq Ft Developed' },
      { value: '6+', label: 'Companies Led' },
    ],
    fullName: 'Parthiban Perumal',
    fullTitle: 'Director',
    bio: [
      {
        paragraphs: [
          'Mr. Parthiban A.P. is a distinguished professional with over 25 years of extensive experience in the infrastructure and construction industry. He holds a postgraduate degree in finance and management and has successfully overseen the development of more than 2.5 million square feet of infrastructure in Chennai as Managing Director. His expertise spans IoT platform integration, cross-sector innovation, and strategic business analysis.',
          'Mr. Parthiban A.P. is a dedicated entrepreneur, currently serving as Director at BGR NEO Limited, Director at Enexio Power Cooling Solutions India Private Limited, Director at Swadhika Foods LLP, Managing Director of Alphafour Infrastructure Pvt Ltd, and Finance Director at Nanoax, making significant contributions to the fintech, infrastructure, robotics, food processing, and automation sectors globally.',
        ],
      },
      {
        heading: 'Professional Experience Director, BGR NEO Limited',
        paragraphs: [
          'Mr. Parthiban A.P. serves as a Director at BGR NEO Limited, a company specializing in robotics and automation solutions for the FMCG sector worldwide. His role involves guiding the strategic direction and operational excellence of BGR NEO, contributing to its global expansion and innovation in the field of robotics.',
        ],
      },
    ],
  },
  {
    name: 'Ms. Swarnamugi Raghupathy',
    role: 'Director & Chairman',
    photo: '/assets/Swarnam%20mam_photo.jpg',
    summary:
      'Seasoned business leader and visionary strategist, currently serving as the Chairman of Enexio Power Cooling Solutions India Pvt Ltd. An Engineer with a Post Graduate Diploma in embedded systems and 19 years of experience. Founder and Director of BGR NEO LTD providing robotic and automation solutions for varied MNC and FMCG sectors across India.',
    highlights: [
      { value: '19+', label: 'Years Experience' },
      { value: 'Engineer', label: 'Technical Background' },
      { value: 'Founder', label: 'BGR NEO LTD' },
    ],
    fullName: 'Swarnamugi Raghupathy',
    fullTitle: 'Founder & Director',
    bio: [
      {
        paragraphs: [
          'Ms. Swarnamugi Raghupathy is a highly accomplished and visionary leader in the Robotics and Automation industry. As the Founder and Director of BGR NEO Limited, she is known for her strategic focus on establishing global leadership and becoming the preferred partner in this rapidly evolving sector. With an engineering background and a Post Graduate Diploma in Embedded Systems, she has accumulated 20 years of experience, which she leverages to drive innovation and excellence in the company.',
          'Her vision for a “NEO World of Automation” underscores her commitment to advancing technology and delivering cutting-edge solutions tailored to meet customer needs. Under her leadership, BGR NEO’s mission is to consistently deliver high-quality, innovative, and reliable automation solutions, fostering long-term relationships with clients through timely and cost-effective project delivery. She emphasizes Ownership, Excellence, and Innovation as the core values guiding the company’s operations.',
          'In addition to her role at BGR NEO, Ms. Swarnamugi serves as the Chairman and Managing Director of Enexio Power Cooling Solutions India Pvt Ltd, a company recognized for its excellence in Power Cooling Solutions. She is also the Founder and Director of Swadhika Foods LLP, where she emphasizes innovation, quality, and sustainability in food products, and the Director of Alphafour Infrastructure Pvt Ltd, focusing on large-scale infrastructure projects that enhance regional development.',
          'Ms. Swarnamugi’s leadership has been instrumental in the growth and success of these organizations, enabling them to harness extensive industry experience and deliver unparalleled solutions on a global scale. Her strategic foresight and commitment to excellence continue to position her companies as leaders in their respective fields.',
        ],
      },
    ],
  },
];

/**
 * Directors page content, carried over from the original site. parthiban.jpeg is only 237 × 237,
 * so keep that portrait small on screen. Parthiban's roles follow the About page; the original file
 * repeated Swarnamugi's list for him.
 */
export const DIRECTORS = [
  {
    id: 1,
    slug: 'parthiban-perumal',
    name: 'Parthiban Perumal',
    position: 'Managing Director & Founder',
    portrait: '/assets/parthiban.jpeg',
    bio: 'Mr. Parthiban A.P., with over 25 years in infrastructure and construction, is the Managing Director at Alphafour Infrastructure Pvt Ltd, and Director at BGR Neo and Enexio Power Cooling Solutions India Pvt Ltd. His expertise includes IoT, fintech, and strategic business analysis. He has led the development of over 2.5 million square feet of infrastructure in Chennai.',
    highlights: [
      {
        title: '25+ Years of Industry Leadership',
        description: 'Extensive expertise across infrastructure, construction, finance, and strategic business management.',
      },
      {
        title: '2.5+ Million Sq. Ft. Delivered',
        description: 'Successfully led major infrastructure development projects across Chennai as Managing Director.',
      },
      {
        title: 'Multi-Sector Entrepreneur',
        description: 'Leadership experience spanning infrastructure, robotics, fintech, automation, food processing, and IoT.',
      },
      {
        title: 'Strategic Business Leader',
        description: 'Director and senior leadership roles driving innovation, operational excellence, and global business growth.',
      },
    ],
    experience: [
      { role: 'Managing Director', org: 'Alphafour Infrastructure Pvt Ltd', period: 'Present' },
      { role: 'Director', org: 'Enexio Power Cooling Solutions India Pvt Ltd', period: 'Present' },
      { role: 'Director', org: 'BGR NEO Limited', period: 'Present' },
      { role: 'Director', org: 'Swadhika Foods LLP', period: 'Present' },
      { role: 'Finance Director', org: 'Nanoax', period: 'Present' },
    ],
  },
  {
    id: 2,
    slug: 'swarnamugi-raghupathy',
    name: 'Swarnamugi Raghupathy',
    position: 'Director',
    portrait: '/assets/Swarnam%20mam_photo.jpg',
    bio: 'Ms. Swarnamugi Raghupathy, Chairman of Enexio Power Cooling Solutions India Pvt Ltd and Founder/Director of BGR NEO LTD, is a seasoned engineer and strategist with 19 years of experience in power cooling, robotics, and automation solutions.',
    highlights: [
      {
        title: '20+ Years of Industry Experience',
        description: 'Extensive expertise in robotics, automation, embedded systems, engineering, and strategic business leadership.',
      },
      {
        title: 'Visionary Robotics & Automation Leader',
        description: 'Founder and Director of BGR NEO Limited, driving innovation and building global leadership in robotics and automation.',
      },
      {
        title: 'Multi-Industry Business Leader',
        description:
          'Leadership across robotics, power cooling solutions, food products, and infrastructure through BGR NEO, Enexio, Swadhika Foods, and Alphafour Infrastructure Pvt Ltd.',
      },
      {
        title: 'Innovation-Driven Strategist',
        description:
          'Focused on delivering high-quality, reliable, and customer-centric solutions through ownership, excellence, innovation, and sustainable growth.',
      },
    ],
    experience: [
      { role: 'Founder & Director', org: 'BGR NEO Limited', period: 'Present' },
      { role: 'Chairman & Managing Director', org: 'Enexio Power Cooling Solutions India Pvt Ltd', period: 'Present' },
      { role: 'Founder & Director', org: 'Swadhika Foods LLP', period: 'Present' },
      { role: 'Director', org: 'Alphafour Infrastructure Pvt Ltd', period: 'Present' },
    ],
  },
];

/** Private client advisors (portraits from docs/media-library.md). */
export const ADVISORS = [
  {
    name: 'Aditi Sharma',
    title: 'Senior Luxury Advisor, Chennai',
    portrait: '1605993439219-9d09d2020fa5',
    phone: '+91 98400 26101',
    languages: ['English', 'Hindi', 'Tamil'],
    cities: ['Chennai'],
  },
  {
    name: 'Daniel Fernandes',
    title: 'Director, Private Client Sales',
    portrait: '1560250097-0b93528c311a',
    phone: '+91 98400 26102',
    languages: ['English', 'Tamil', 'Malayalam'],
    cities: ['Chennai'],
  },
  {
    name: 'Zoya Merchant',
    title: 'NRI & International Desk',
    portrait: '1618835962148-cf177563c6c0',
    phone: '+971 50 426 2026',
    languages: ['English', 'Hindi', 'Arabic'],
    cities: ['Chennai'],
  },
  {
    name: 'Kabir Sethi',
    title: 'Advisor, OMR & East Coast Road',
    portrait: '1633332755192-727a05c4013d',
    phone: '+91 98400 26104',
    languages: ['English', 'Tamil', 'Telugu'],
    cities: ['Chennai'],
  },
];

export const advisorFor = (city) => ADVISORS.find((a) => a.cities.includes(city)) ?? ADVISORS[0];
