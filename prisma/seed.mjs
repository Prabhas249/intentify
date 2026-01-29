import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

// Helper: random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Date helpers
const daysAgo = (d) => new Date(Date.now() - d * 86400000);
const hoursAgo = (h) => new Date(Date.now() - h * 3600000);

async function main() {
  console.log("Seeding database...\n");

  // 1. Find or create the dev user
  let user = await db.user.findUnique({ where: { email: "admin@popup.dev" } });
  if (!user) {
    user = await db.user.create({
      data: {
        name: "Admin",
        email: "admin@popup.dev",
        plan: "STARTER",
        visitorsUsedThisMonth: 0,
        billingCycleStart: daysAgo(15),
      },
    });
    console.log("Created user:", user.email);
  } else {
    // Upgrade plan for demo
    user = await db.user.update({
      where: { id: user.id },
      data: { plan: "STARTER", billingCycleStart: daysAgo(15) },
    });
    console.log("Found existing user:", user.email);
  }

  // 2. Create demo websites
  const websitesData = [
    { domain: "freshkart.in", settings: { brandColor: "#22c55e", position: "bottom-right" } },
    { domain: "learnhub.co.in", settings: { brandColor: "#6366f1", position: "center" } },
  ];

  const websites = [];
  for (const w of websitesData) {
    const existing = await db.website.findUnique({
      where: { userId_domain: { userId: user.id, domain: w.domain } },
    });
    if (existing) {
      websites.push(existing);
      console.log("Website exists:", w.domain);
    } else {
      const created = await db.website.create({
        data: { userId: user.id, domain: w.domain, settings: w.settings },
      });
      websites.push(created);
      console.log("Created website:", w.domain);
    }
  }

  const [freshkart, learnhub] = websites;

  // 3. Create campaigns
  const campaignsData = [
    {
      websiteId: freshkart.id,
      name: "Welcome Offer - 15% Off",
      popupType: "MODAL",
      status: "ACTIVE",
      priority: 8,
      frequency: "ONCE_PER_SESSION",
      triggerRules: {
        conditions: [
          { field: "visit_count", operator: "equals", value: 1 },
          { field: "time_on_site", operator: "greater_than", value: 5 },
        ],
      },
      content: {
        title: "Welcome to FreshKart!",
        body: "Get 15% off on your first order. Use code FRESH15 at checkout.",
        ctaText: "Shop Now",
        ctaUrl: "/products",
        style: { bgColor: "#ffffff", textColor: "#111827", ctaColor: "#22c55e" },
      },
    },
    {
      websiteId: freshkart.id,
      name: "Exit Intent - Cart Recovery",
      popupType: "SLIDE_IN",
      status: "ACTIVE",
      priority: 9,
      frequency: "ONCE_PER_DAY",
      triggerRules: {
        conditions: [
          { field: "intent_level", operator: "equals", value: "HIGH" },
          { field: "exit_intent", operator: "equals", value: true },
        ],
      },
      content: {
        title: "Wait! Don't leave yet",
        body: "Complete your order and get free shipping on orders above ₹499",
        ctaText: "Complete Order",
        ctaUrl: "/cart",
        style: { bgColor: "#fef3c7", textColor: "#92400e", ctaColor: "#f59e0b" },
      },
    },
    {
      websiteId: freshkart.id,
      name: "WhatsApp Support",
      popupType: "FLOATING",
      status: "ACTIVE",
      priority: 3,
      frequency: "EVERY_TIME",
      triggerRules: {
        conditions: [{ field: "page_url", operator: "contains", value: "/products" }],
      },
      content: {
        title: "Need help choosing?",
        body: "Chat with us on WhatsApp",
        ctaText: "Chat Now",
        ctaUrl: "https://wa.me/919876543210",
        style: { bgColor: "#25d366", textColor: "#ffffff", ctaColor: "#128c7e" },
      },
    },
    {
      websiteId: learnhub.id,
      name: "Free Webinar Signup",
      popupType: "MODAL",
      status: "ACTIVE",
      priority: 7,
      frequency: "ONCE_EVER",
      triggerRules: {
        conditions: [
          { field: "scroll_depth", operator: "greater_than", value: 40 },
          { field: "time_on_site", operator: "greater_than", value: 30 },
        ],
      },
      content: {
        title: "Free Live Webinar This Saturday",
        body: "Learn Full-Stack Development in 90 minutes. Register now - limited seats!",
        ctaText: "Register Free",
        ctaUrl: "/webinar",
        collectEmail: true,
        style: { bgColor: "#eef2ff", textColor: "#3730a3", ctaColor: "#6366f1" },
      },
    },
    {
      websiteId: learnhub.id,
      name: "Course Discount Banner",
      popupType: "BANNER",
      status: "ACTIVE",
      priority: 5,
      frequency: "ONCE_PER_SESSION",
      triggerRules: {
        conditions: [{ field: "visit_count", operator: "greater_than", value: 2 }],
      },
      content: {
        title: "Returning Learner Discount",
        body: "Get 25% off any course - use code LEARN25",
        ctaText: "Browse Courses",
        ctaUrl: "/courses",
        style: { bgColor: "#6366f1", textColor: "#ffffff", ctaColor: "#fbbf24" },
      },
    },
  ];

  const campaigns = [];
  for (const c of campaignsData) {
    // Delete existing campaigns for this website with same name to avoid duplicates
    await db.campaign.deleteMany({
      where: { websiteId: c.websiteId, name: c.name },
    });
    const created = await db.campaign.create({ data: c });
    campaigns.push(created);
    console.log("Created campaign:", c.name);
  }

  // 4. Create visitors
  const devices = ["mobile", "desktop", "tablet"];
  const browsers = ["Chrome", "Safari", "Firefox", "Edge", "Samsung Internet"];
  const oses = ["Android", "iOS", "Windows", "macOS", "Linux"];
  const countries = ["IN", "IN", "IN", "IN", "IN", "US", "AE", "GB", "SG", "CA"]; // 50% India
  const citiesByCountry = {
    IN: ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow"],
    US: ["New York", "San Francisco", "Los Angeles", "Chicago"],
    AE: ["Dubai", "Abu Dhabi"],
    GB: ["London", "Manchester"],
    SG: ["Singapore"],
    CA: ["Toronto", "Vancouver"],
  };
  const utmSources = [null, null, "google", "google", "facebook", "instagram", "whatsapp", "youtube", "twitter", "email"];
  const utmMediums = [null, "cpc", "social", "organic", "referral", "email"];
  const utmCampaigns = [null, null, "summer_sale", "diwali_offer", "new_launch", "brand_awareness", "retarget"];
  const referrers = [null, null, "https://google.com", "https://instagram.com", "https://facebook.com", "https://youtube.com", "https://t.co"];

  const freshkartPages = ["/", "/products", "/products/organic-honey", "/products/green-tea", "/products/protein-bar", "/cart", "/checkout", "/about", "/blog", "/pricing"];
  const learnhubPages = ["/", "/courses", "/courses/react-mastery", "/courses/python-ml", "/courses/nextjs-saas", "/webinar", "/blog", "/pricing", "/about", "/testimonials"];

  // Generate 80 visitors across both sites
  const visitorRecords = [];
  for (let i = 0; i < 80; i++) {
    const isFreshkart = i < 50; // 50 for freshkart, 30 for learnhub
    const website = isFreshkart ? freshkart : learnhub;
    const pages = isFreshkart ? freshkartPages : learnhubPages;

    const visitCount = rand(1, 12);
    const viewedCount = Math.min(rand(1, 8), pages.length);
    const pagesViewed = pickN(pages, viewedCount);
    const timeOnSite = rand(5, 600);
    const scrollDepth = rand(10, 100);
    const country = pick(countries);
    const city = pick(citiesByCountry[country]);
    const device = pick(devices);
    const os = device === "mobile" ? pick(["Android", "iOS"]) : device === "tablet" ? pick(["iOS", "Android"]) : pick(["Windows", "macOS", "Linux"]);
    const browser = os === "iOS" ? pick(["Safari", "Chrome"]) : os === "Android" ? pick(["Chrome", "Samsung Internet"]) : pick(browsers);

    // Intent scoring
    let intentScore = 0;
    if (visitCount > 1) intentScore += 10;
    if (visitCount > 3) intentScore += 20;
    if (pagesViewed.some((p) => p.includes("pricing") || p.includes("checkout"))) intentScore += 30;
    if (timeOnSite > 120) intentScore += 15;
    if (scrollDepth > 50) intentScore += 10;
    intentScore = Math.min(intentScore, 100);

    const intentLevel = intentScore >= 61 ? "HIGH" : intentScore >= 31 ? "MEDIUM" : "LOW";

    const firstSeenDays = rand(1, 30);
    const lastSeenDays = rand(0, Math.min(firstSeenDays, 3));

    visitorRecords.push({
      websiteId: website.id,
      visitorHash: `demo_visitor_${i}_${Date.now().toString(36)}`,
      visitCount,
      pagesViewed,
      timeOnSiteSeconds: timeOnSite,
      utmSource: pick(utmSources),
      utmMedium: pick(utmMediums),
      utmCampaign: pick(utmCampaigns),
      referrer: pick(referrers),
      intentScore,
      intentLevel,
      scrollDepth,
      device,
      browser,
      os,
      country,
      city,
      firstSeen: daysAgo(firstSeenDays),
      lastSeen: daysAgo(lastSeenDays),
      countedForMonth: daysAgo(firstSeenDays),
    });
  }

  // Delete old demo visitors to avoid duplicates
  for (const w of websites) {
    await db.event.deleteMany({
      where: { visitor: { websiteId: w.id, visitorHash: { startsWith: "demo_visitor_" } } },
    });
    await db.visitor.deleteMany({
      where: { websiteId: w.id, visitorHash: { startsWith: "demo_visitor_" } },
    });
  }

  const visitors = [];
  for (const v of visitorRecords) {
    const created = await db.visitor.create({ data: v });
    visitors.push(created);
  }
  console.log(`Created ${visitors.length} visitors`);

  // Update user visitor count
  await db.user.update({
    where: { id: user.id },
    data: { visitorsUsedThisMonth: visitors.length },
  });

  // 5. Create events for visitors
  const eventTypes = ["PAGE_VIEW", "POPUP_IMPRESSION", "POPUP_CLICK", "POPUP_CONVERSION", "POPUP_DISMISS"];
  let eventCount = 0;

  for (let vi = 0; vi < visitors.length; vi++) {
    const visitor = visitors[vi];
    const isFreshkart = vi < 50;
    const websiteCampaigns = campaigns.filter(
      (c) => c.websiteId === (isFreshkart ? freshkart.id : learnhub.id)
    );
    const pages = isFreshkart ? freshkartPages : learnhubPages;

    // Every visitor gets PAGE_VIEW events
    const pageViewCount = rand(1, Math.min(visitor.visitCount * 2, 8));
    for (let e = 0; e < pageViewCount; e++) {
      await db.event.create({
        data: {
          visitorId: visitor.id,
          eventType: "PAGE_VIEW",
          metadata: { page: pick(pages), referrer: visitor.referrer },
          createdAt: new Date(
            visitor.firstSeen.getTime() +
              rand(0, (visitor.lastSeen.getTime() - visitor.firstSeen.getTime()) || 3600000)
          ),
        },
      });
      eventCount++;
    }

    // ~60% get popup impression
    if (Math.random() < 0.6 && websiteCampaigns.length > 0) {
      const campaign = pick(websiteCampaigns);
      const impressionTime = new Date(
        visitor.firstSeen.getTime() +
          rand(0, (visitor.lastSeen.getTime() - visitor.firstSeen.getTime()) || 3600000)
      );

      await db.event.create({
        data: {
          visitorId: visitor.id,
          campaignId: campaign.id,
          eventType: "POPUP_IMPRESSION",
          metadata: { page: pick(pages) },
          createdAt: impressionTime,
        },
      });
      eventCount++;

      // ~40% of impressions get a click
      if (Math.random() < 0.4) {
        await db.event.create({
          data: {
            visitorId: visitor.id,
            campaignId: campaign.id,
            eventType: "POPUP_CLICK",
            metadata: { page: pick(pages) },
            createdAt: new Date(impressionTime.getTime() + rand(1000, 30000)),
          },
        });
        eventCount++;

        // ~50% of clicks convert
        if (Math.random() < 0.5) {
          await db.event.create({
            data: {
              visitorId: visitor.id,
              campaignId: campaign.id,
              eventType: "POPUP_CONVERSION",
              metadata: { page: pick(pages), value: rand(200, 5000) },
              createdAt: new Date(impressionTime.getTime() + rand(30000, 120000)),
            },
          });
          eventCount++;
        }
      } else if (Math.random() < 0.3) {
        // Some dismiss
        await db.event.create({
          data: {
            visitorId: visitor.id,
            campaignId: campaign.id,
            eventType: "POPUP_DISMISS",
            metadata: { page: pick(pages) },
            createdAt: new Date(impressionTime.getTime() + rand(500, 5000)),
          },
        });
        eventCount++;
      }
    }
  }
  console.log(`Created ${eventCount} events`);

  // 6. Create leads
  const firstNames = ["Priya", "Rahul", "Sneha", "Arjun", "Meera", "Vikram", "Ananya", "Karthik", "Divya", "Rohan", "Aisha", "Nikhil", "Pooja", "Amit", "Shreya"];
  const lastNames = ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Nair", "Joshi", "Verma", "Iyer"];
  const domains = ["gmail.com", "outlook.com", "yahoo.co.in", "hotmail.com"];

  const leadsData = [];
  for (let i = 0; i < 20; i++) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const isFreshkart = i < 12;
    const websiteCampaigns = campaigns.filter(
      (c) => c.websiteId === (isFreshkart ? freshkart.id : learnhub.id)
    );
    leadsData.push({
      websiteId: isFreshkart ? freshkart.id : learnhub.id,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}${rand(1, 99)}@${pick(domains)}`,
      phone: i % 3 === 0 ? `+919${rand(100000000, 999999999)}` : null,
      name: `${fn} ${ln}`,
      campaignId: websiteCampaigns.length > 0 ? pick(websiteCampaigns).id : null,
      utmSource: pick(["google", "instagram", "facebook", "direct", null]),
      pageUrl: isFreshkart ? pick(freshkartPages) : pick(learnhubPages),
      createdAt: daysAgo(rand(0, 25)),
    });
  }

  // Delete old demo leads
  await db.lead.deleteMany({
    where: { websiteId: { in: websites.map((w) => w.id) } },
  });

  for (const l of leadsData) {
    await db.lead.create({ data: l });
  }
  console.log(`Created ${leadsData.length} leads`);

  console.log("\nSeed complete!");
  console.log(`  User: ${user.email} (${user.plan})`);
  console.log(`  Websites: ${websites.map((w) => w.domain).join(", ")}`);
  console.log(`  Campaigns: ${campaigns.length}`);
  console.log(`  Visitors: ${visitors.length}`);
  console.log(`  Events: ${eventCount}`);
  console.log(`  Leads: ${leadsData.length}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
