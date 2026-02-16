// /data/flashDeals.js
// RELUXE Flash Deals master list
// Each deal runs for a single calendar promo day, from 12:01am to 11:59:59pm (local time).
// Timezone assumed ET (-05:00). Adjust if needed.
// Page logic will filter to "active" based on current time.

// If you want an early-bird code for first 2 hours for any deal, add:
// firstTwoHourCode: {
//   code: 'CODESTRING',
//   extraDetails: 'Whatever marketing line',
//   expireAfterHours: 2
// }

export const flashDeals = {
  services: [
    //
    // 11/24
    //
    {
      id: 'evolvex-first-session',
      name: 'EvolveX Body Contouring',
      blurb: '$50 first session, then $500 for 5 more.',
      flashPrice: '$50 first session',
      regularPrice: '$150/session',
      limitNote: 'limit 1',
      notes: null,
      linkBook: '/book/flash-evolvex',
      linkShare: 'https://reluxe.click/evolvex',
      startTime: '2025-11-23T00:01:00-05:00',
      endTime: '2025-11-25T23:59:59-05:00',
    },

    //
    // 11/25
    //
    {
      id: 'massage-60-70',
      name: '60-Minute Massage',
      blurb: '60 minutes for $70. Buy up to 10.',
      flashPrice: '$70',
      regularPrice: '$125',
      limitNote: 'Buy up to 10',
      notes: null,
      linkBook: '/book/flash-cleanser',
      linkShare: 'https://reluxe.click/massage60',
      startTime: '2025-11-25T00:01:00-05:00',
      endTime: '2025-11-25T23:59:59-05:00',
    },

    //
    // 11/26
    //
    {
      id: 'versa-or-rha-500',
      name: 'Versa or RHA Filler',
      blurb: '$500 per syringe.',
      flashPrice: '$500 / syringe',
      regularPrice: 'Typically higher',
      limitNote: null,
      notes: null,
      linkBook: '/book/flash-filler',
      linkShare: 'https://reluxe.click/filler',
      startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-02T04:59:59-05:00',
    },

    //
    // 11/27
    //
    {
      id: 'salt-sauna-free',
      name: 'Salt Sauna Session',
      blurb: 'Free Salt Sauna Session as a Thank You.',
      flashPrice: 'FREE',
      regularPrice: 'Reg. Price',
      limitNote: null,
      notes: null,
      linkBook: '/book/flash-sauna',
      linkShare: 'https://reluxe.click/salt-sauna',
      startTime: '2025-11-26T00:01:00-05:00',
      endTime: '2025-11-27T23:59:59-05:00',
    },

    //
    // 11/28 (Black Friday)
    //
    {
      id: 'free-10',
      name: '$10 Free. Thank You For Supporting Our Small Business',
      blurb: 'As a thank you, get $10 account credit to use at RELUXE. Expires on 3/31/26.',
      flashPrice: 'FREE',
      regularPrice: '$10',
      limitNote: 'Limit 1 per person. Expires 3/31/26',
      notes: 'No Catch. New or Existing Patients. Must claim online. Limited availability.',
      linkBook: '/book/flash-free',
      linkShare: 'https://reluxe.click/glo2facial',
      startTime: '2025-11-29T00:01:00-05:00',
      endTime: '2025-11-29T23:59:59-05:00',
    },
    {
      id: 'glo2facial-150-bf',
      name: '$150 RELUXE Glo2Facial (Save $100)',
      blurb: 'Reg $250 → $150. 1 per person.',
      flashPrice: '$150',
      regularPrice: '$250',
      limitNote: 'Limit 1 per person',
      notes: null,
      linkBook: '/book/flash-glo2',
      linkShare: 'https://reluxe.click/glo2facial',
      startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-02T04:59:59-05:00',
    },
    {
      id: 'b12-pack-30-bf',
      name: '3-Pack B12 Shots for $30',
      blurb: '3-pack for $30 (Reg $75).',
      flashPrice: '$30 / 3-pack',
      regularPrice: '$75',
      limitNote: 'Limit 1 package per person',
      notes: null,
      linkBook: '/book/flash-b12',
      linkShare: 'https://reluxe.click/b12',
      startTime: '2025-11-27T00:01:00-05:00',
      endTime: '2025-11-29T23:59:59-05:00',
    },
    {
      id: 'membership-100-bf',
      name: '$100 Monthly Membership',
      blurb:
        '$100/mo for 12 months ($900 total). That is 3 months free!',
      flashPrice: '$900/mo',
      regularPrice: '$1200 per year ($100/month)',
      limitNote: null,
      notes: 'Prepay for entire 12-month commitment',
      linkBook: '/book/flash-100member',
      linkShare: 'https://reluxe.click/membership-100',
      startTime: '2025-11-27T00:01:00-05:00',
      endTime: '2025-11-29T23:59:59-05:00',
    },
    {
      id: 'membership-200-bf',
      name: '$200 Monthly Membership',
      blurb:
        '$200/mo for 12 months ($1800 total) — That is 3 months free!',
      flashPrice: '$1800 for 12 months)',
      regularPrice: '$2400 per year ($200/month)',
      limitNote: null,
      notes: 'Prepay for entire 12-month commitment',
      linkBook: '/book/flash-200member',
      linkShare: 'https://reluxe.click/membership-200',
     startTime: '2025-11-27T00:01:00-05:00',
      endTime: '2025-11-29T23:59:59-05:00',
    },
    {
      id: 'lhr-large-bogo',
      name: 'BOGO Large Area Laser Hair Removal (8-Pack)',
      blurb: 'Buy a Large Area package and get a second area free at every visit.',
      flashPrice: '$2,250 (8 Large sessions)',
      regularPrice: '$2,875 for Large & Standard Area (Save $625)',
      limitNote: 'Limit 1 per person. New & existing patients.',
      notes: 'Includes 8 Large Area sessions for the price of 5. At each appointment, pair your Large Area with a FREE Standard or Small Area (same person, same visit).',
      linkBook: '/book/flash-lhr-large',
      linkShare: 'https://reluxe.click/lhr-large-bogo',
      startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-02T04:59:59-05:00',
    },
    {
      id: 'lhr-standard-bogo',
      name: 'BOGO Standard Area Laser Hair Removal (8-Pack)',
      blurb: 'Buy a Standard Area package and treat a second area free at every visit.',
      flashPrice: '$1,250 (8 Standard sessions)',
      regularPrice: '$1,875 (Save $625)',
      limitNote: 'Limit 1 per person. New & existing patients.',
      notes: 'Includes 8 Standard Area sessions for the price of 5. At each appointment, pair your Standard Area with a FREE 2nd Standard or Small Area (same person, same visit).',
      linkBook: '/book/flash-lhr-standard',
      linkShare: 'https://reluxe.click/lhr-standard-bogo',
     startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-02T04:59:59-05:00',
    },
    {
      id: 'lhr-small-bogo',
      name: 'BOGO Small Area Laser Hair Removal (8-Pack)',
      blurb: 'Buy a Small Area package and get a second Small area free at every visit.',
      flashPrice: '$500 (8 Small sessions)',
      regularPrice: '$750 (Save $250)',
      limitNote: 'Limit 1 per person. New & existing patients.',
      notes: 'Includes 8 Small Area sessions for the price of 5. At each appointment, treat your primary Small Area plus a FREE second Small (or X-Small) Area (same person, same visit).',
      linkBook: '/book/flash-lhr-small',
      linkShare: 'https://reluxe.click/lhr-small-bogo',
      startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-02T04:59:59-05:00',
    },
    {
      id: 'iv-therapy-99',
      name: 'IV Therapy for $99 - House of Health Carmel ONLY',
      blurb: 'Choose from our most-requested IVs for only $99.',
      flashPrice: '$99',
      regularPrice: '$150–$250 (Save up to $150)',
      limitNote: 'Limit 1 per person. New & existing patients.',
      notes: 'Valid for any IV Therapy appointment. Redeem at House of Health in Carmel.',
      linkBook: '/book/flash-iv',
      linkShare: 'https://reluxe.click/iv99',
      startTime: '2025-11-27T00:01:00-05:00',
      endTime: '2025-11-29T23:59:59-05:00',
    },
    {
      id: 'hbot-49',
      name: 'HBOT First Session for $49 - House of Health Carmel ONLY',
      blurb: 'Try Hyperbaric Oxygen Therapy for the very first time.',
      flashPrice: '$49',
      regularPrice: '$99 (Save $50)',
      limitNote: 'FIRST session only. New HBOT patients.',
      notes: 'One time only per person. Valid at House of Health at Carmel.',
      linkBook: '/book/flash-hbot',
      linkShare: 'https://reluxe.click/hbot49',
      startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-02T04:59:59-05:00',
    },


    //
    // 11/29
    //
    {
      id: 'clearlift-6pack-950',
      name: 'ClearLift Laser (6-Pack)',
      blurb: '6-pack for $950 (Reg $1500).',
      flashPrice: '$950 / 6-pack',
      regularPrice: '$1500',
      limitNote: null,
      notes: null,
      linkBook: '/book/clearlift',
      linkShare: 'https://reluxe.click/clearlift',
      startTime: '2025-11-29T00:01:00-05:00',
      endTime: '2025-11-29T23:59:59-05:00',
    },

    //
    // 11/30
    //
    // You didn't give deals for 11/30 yet, but we still include a placeholder day
    // so that if you add them, date math is still consistent. We'll leave it commented.
    // {
    //   id: 'todo-1130-service',
    //   name: 'TBD Service',
    //   blurb: 'Describe it.',
    //   flashPrice: '$X',
    //   regularPrice: '$Y',
    //   limitNote: null,
    //   notes: null,
    //   linkBook: '/book/tbd',
    //   linkShare: 'https://reluxe.click/tbd',
    //   startTime: '2025-11-30T00:01:00-05:00',
    //   endTime: '2025-11-30T23:59:59-05:00',
    // },


    //
    // 11/27
    //
    
    //
    // 11/28 (Black Friday)
    //

    //
    // 11/30
    //
    // (Placeholder for future product drop)
    // {
    //   id: 'todo-1130-product',
    //   name: 'TBD Product',
    //   blurb: 'Describe it.',
    //   flashPrice: '$X',
    //   regularPrice: '$Y',
    //   limitNote: null,
    //   notes: null,
    //   linkBook: '/shop/tbd',
    //   linkShare: 'https://reluxe.click/tbd',
    //   startTime: '2025-11-30T00:01:00-05:00',
    //   endTime: '2025-11-30T23:59:59-05:00',
    // },

    //
    // 12/1 (Cyber Monday)
    //
    {
      id: 'a-team-140-cm',
      name: 'A-Team Duo Kit',
      blurb:
        'Reg $185 → $140 (Save $45). Top Seller.',
      flashPrice: '$140',
      regularPrice: '$185',
      limitNote: 'Top Seller',
      notes: 'Save $45',
      linkBook: '/book/flash-ateam',
      linkShare: 'https://reluxe.click/a-team',
      startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-01T23:59:59-05:00',
    },
    {
      id: 'universeskin-custom-130-cm',
      name: 'UniverseSkin AM/PM Custom (2 actives each)',
      blurb:
        'Reg $180 → $130 (Save $50). Personalized AM/PM set.',
      flashPrice: '$130',
      regularPrice: '$180',
      limitNote: null,
      notes: 'Save $50',
      linkBook: '/book/flash-uskin',
      linkShare: 'https://reluxe.click/universeskin',
      startTime: '2025-12-01T00:01:00-05:00',
      endTime: '2025-12-01T23:59:59-05:00',
    },
  ],
}
