import { PrismaClient, IntentLevel } from "@prisma/client";

const prisma = new PrismaClient();

// Demo user emails
const DEMO_USER_INR = "demo-india@intentify.com";
const DEMO_USER_USD = "demo-global@intentify.com";

interface WebsiteConfig {
  domain: string;
  visitorCount: number;
  revenueINR: number; // in rupees
  revenueUSD: number; // in dollars
  aovINR: number;
  aovUSD: number;
  conversionRate: number;
  campaigns: {
    name: string;
    type: "MODAL" | "SLIDE_IN" | "FLOATING" | "BANNER" | "BOTTOM_SHEET";
    coupon: string;
  }[];
}

const websiteConfigs: WebsiteConfig[] = [
  {
    domain: "intentify.com",
    visitorCount: 125000,
    revenueINR: 12000000, // ₹1.2Cr
    revenueUSD: 150000,   // $150K
    aovINR: 3500,
    aovUSD: 45,
    conversionRate: 0.035, // 3.5%
    campaigns: [
      { name: "First Purchase - 25% Off", type: "MODAL", coupon: "FIRST25" },
      { name: "Exit Intent - Free Shipping", type: "SLIDE_IN", coupon: "FREESHIP" },
      { name: "Cart Abandonment Saver", type: "FLOATING", coupon: "SAVE15" },
      { name: "WhatsApp VIP Deals", type: "FLOATING", coupon: "WHATSAPP10" },
      { name: "Flash Sale - 30% Off", type: "BANNER", coupon: "FLASH30" },
      { name: "Newsletter Signup", type: "BOTTOM_SHEET", coupon: "NEWS10" },
    ],
  },
  {
    domain: "demosite.com",
    visitorCount: 55000,
    revenueINR: 5000000, // ₹50L
    revenueUSD: 60000,   // $60K
    aovINR: 2800,
    aovUSD: 35,
    conversionRate: 0.032, // 3.2%
    campaigns: [
      { name: "Welcome Offer - 20% Off", type: "MODAL", coupon: "WELCOME20" },
      { name: "Exit Intent Discount", type: "SLIDE_IN", coupon: "STAY10" },
      { name: "Limited Time Offer", type: "BANNER", coupon: "LIMITED15" },
      { name: "WhatsApp Exclusive", type: "FLOATING", coupon: "WA20" },
      { name: "Email Signup Bonus", type: "BOTTOM_SHEET", coupon: "EMAIL5" },
    ],
  },
  {
    domain: "demosite2.com",
    visitorCount: 6500,
    revenueINR: 800000, // ₹8L
    revenueUSD: 10000,  // $10K
    aovINR: 2200,
    aovUSD: 28,
    conversionRate: 0.028, // 2.8%
    campaigns: [
      { name: "New Customer Discount", type: "MODAL", coupon: "NEW15" },
      { name: "Don't Leave Empty", type: "SLIDE_IN", coupon: "COMEBACK10" },
      { name: "Festive Special", type: "BANNER", coupon: "FEST20" },
      { name: "Join Our Community", type: "BOTTOM_SHEET", coupon: "JOIN5" },
    ],
  },
];

const sources = [
  { name: "instagram", medium: "social", weight: 25 },
  { name: "google", medium: "cpc", weight: 22 },
  { name: null, medium: null, weight: 18 }, // direct
  { name: "facebook", medium: "social", weight: 15 },
  { name: "whatsapp", medium: "referral", weight: 10 },
  { name: "twitter", medium: "social", weight: 5 },
  { name: "email", medium: "email", weight: 5 },
];

const devices = [
  { type: "mobile", os: ["Android", "iOS"], weight: 72 },
  { type: "desktop", os: ["Windows", "macOS"], weight: 28 },
];

const browsers = ["Chrome", "Safari", "Firefox", "Edge"];
const cities = {
  INR: ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"],
  USD: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "London", "Toronto", "Sydney", "Berlin", "Paris"],
};

const pages = ["/", "/products", "/products/item-1", "/products/item-2", "/cart", "/checkout", "/about", "/contact"];

function weightedRandom<T>(items: { weight: number }[] & T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item;
  }
  return items[items.length - 1];
}

async function createDemoUser(email: string, name: string) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        plan: "PRO",
      },
    });
    console.log(`✅ Created user: ${email}`);
  } else {
    console.log(`📍 Found existing user: ${email}`);
  }
  return user;
}

async function seedDataForUser(userId: string, currency: "INR" | "USD") {
  const isINR = currency === "INR";
  const country = isINR ? "India" : "United States";
  const cityList = isINR ? cities.INR : cities.USD;

  console.log(`\n${"═".repeat(60)}`);
  console.log(`🌍 Seeding ${currency} data for user...`);
  console.log(`${"═".repeat(60)}`);

  for (const config of websiteConfigs) {
    console.log(`\n📦 Setting up: ${config.domain}`);

    // Delete existing data for this website
    const existingWebsite = await prisma.website.findFirst({
      where: { userId, domain: config.domain },
    });

    if (existingWebsite) {
      console.log("🗑️  Clearing old data...");
      await prisma.event.deleteMany({ where: { visitor: { websiteId: existingWebsite.id } } });
      await prisma.visitor.deleteMany({ where: { websiteId: existingWebsite.id } });
      await prisma.campaign.deleteMany({ where: { websiteId: existingWebsite.id } });
      await prisma.website.delete({ where: { id: existingWebsite.id } });
    }

    // Create website
    const website = await prisma.website.create({
      data: {
        userId,
        domain: config.domain,
        scriptKey: `key_${config.domain.replace(/\./g, "_")}_${currency.toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`,
      },
    });

    // Create campaigns
    const campaigns = await Promise.all(
      config.campaigns.map((c, idx) =>
        prisma.campaign.create({
          data: {
            websiteId: website.id,
            name: c.name,
            popupType: c.type,
            status: "ACTIVE",
            priority: 10 - idx,
            content: {
              title: c.name,
              couponCode: c.coupon,
              ctaText: "Claim Now",
              currency,
            },
            triggerRules: { delay: 3000 + idx * 500, scrollDepth: 25 + idx * 10 },
          },
        })
      )
    );
    console.log(`   ✅ Created ${campaigns.length} campaigns`);

    // Calculate targets
    const targetRevenue = isINR ? config.revenueINR : config.revenueUSD;
    const aov = isINR ? config.aovINR : config.aovUSD;
    const requiredPurchases = Math.ceil(targetRevenue / aov);
    const now = new Date();

    let stats = { visitors: 0, impressions: 0, clicks: 0, couponCopies: 0, conversions: 0, purchases: 0, revenue: 0 };

    // Create visitors in batches
    const batchSize = 500;
    const totalBatches = Math.ceil(config.visitorCount / batchSize);

    for (let batch = 0; batch < totalBatches; batch++) {
      const batchStart = batch * batchSize;
      const batchEnd = Math.min(batchStart + batchSize, config.visitorCount);
      const visitorsToCreate = [];
      const eventsToCreate: any[] = [];

      for (let i = batchStart; i < batchEnd; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const hoursAgo = Math.floor(Math.random() * 24);
        // Weekday bias (Mon-Fri higher traffic)
        const dayOfWeek = (now.getDay() - daysAgo % 7 + 7) % 7;
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        if (isWeekend && Math.random() < 0.3) continue; // Skip 30% of weekend traffic

        const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
        const source = weightedRandom(sources);
        const device = weightedRandom(devices);
        const visitCount = Math.floor(Math.random() * 8) + 1;
        const intentScore = Math.floor(Math.random() * 100);
        const intentLevel: IntentLevel = intentScore >= 60 ? IntentLevel.HIGH : intentScore >= 30 ? IntentLevel.MEDIUM : IntentLevel.LOW;

        const visitorId = `v_${config.domain.split(".")[0]}_${currency}_${i}_${Math.random().toString(36).substring(2, 6)}`;

        visitorsToCreate.push({
          websiteId: website.id,
          visitorHash: visitorId,
          visitCount,
          pagesViewed: pages.slice(0, Math.floor(Math.random() * 6) + 1),
          timeOnSiteSeconds: Math.floor(Math.random() * 600) + 30,
          utmSource: source.name,
          utmMedium: source.medium,
          utmCampaign: source.name && Math.random() < 0.3 ? `${source.name}_campaign_${Math.floor(Math.random() * 3)}` : null,
          referrer: source.name ? `https://${source.name}.com` : null,
          device: device.type,
          browser: browsers[Math.floor(Math.random() * browsers.length)],
          os: device.os[Math.floor(Math.random() * device.os.length)],
          country,
          city: cityList[Math.floor(Math.random() * cityList.length)],
          scrollDepth: Math.floor(Math.random() * 100),
          intentScore,
          intentLevel,
          firstSeen: createdAt,
          lastSeen: new Date(createdAt.getTime() + Math.random() * 1800000),
        });

        stats.visitors++;
      }

      // Batch insert visitors
      await prisma.visitor.createMany({ data: visitorsToCreate });

      // Get created visitors for events
      const createdVisitors = await prisma.visitor.findMany({
        where: { websiteId: website.id },
        orderBy: { firstSeen: "desc" },
        take: visitorsToCreate.length,
      });

      // Create events for each visitor
      for (const visitor of createdVisitors) {
        const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
        const eventDate = visitor.firstSeen;

        // 85% see popup impression
        if (Math.random() < 0.85) {
          eventsToCreate.push({
            visitorId: visitor.id,
            campaignId: campaign.id,
            eventType: "POPUP_IMPRESSION",
            metadata: { page: pages[Math.floor(Math.random() * pages.length)] },
            createdAt: eventDate,
          });
          stats.impressions++;

          // 18% of impressions click
          if (Math.random() < 0.18) {
            eventsToCreate.push({
              visitorId: visitor.id,
              campaignId: campaign.id,
              eventType: "POPUP_CLICK",
              metadata: { page: pages[Math.floor(Math.random() * pages.length)] },
              createdAt: new Date(eventDate.getTime() + 2000),
            });
            stats.clicks++;

            // 55% of clicks copy coupon
            if (Math.random() < 0.55) {
              const coupon = (campaign.content as any)?.couponCode || "SAVE10";
              eventsToCreate.push({
                visitorId: visitor.id,
                campaignId: campaign.id,
                eventType: "COUPON_COPY",
                metadata: { couponCode: coupon },
                createdAt: new Date(eventDate.getTime() + 4000),
              });
              stats.couponCopies++;
            }

            // 40% of clicks convert
            if (Math.random() < 0.40) {
              eventsToCreate.push({
                visitorId: visitor.id,
                campaignId: campaign.id,
                eventType: "POPUP_CONVERSION",
                metadata: { type: "lead" },
                createdAt: new Date(eventDate.getTime() + 6000),
              });
              stats.conversions++;
            }
          }
        }

        // Purchase events (based on conversion rate)
        if (stats.purchases < requiredPurchases && Math.random() < config.conversionRate * 1.2) {
          const variance = 0.5;
          const minOrder = aov * (1 - variance);
          const maxOrder = aov * (1 + variance);
          const orderAmount = Math.floor(Math.random() * (maxOrder - minOrder) + minOrder);

          eventsToCreate.push({
            visitorId: visitor.id,
            campaignId: campaign.id,
            eventType: "POPUP_CONVERSION",
            metadata: {
              isPurchase: true,
              amount: orderAmount,
              currency,
              orderId: `ORD${Date.now()}${Math.floor(Math.random() * 10000)}`,
            },
            createdAt: new Date(eventDate.getTime() + 300000),
          });
          stats.purchases++;
          stats.revenue += orderAmount;
        }
      }

      // Batch insert events
      if (eventsToCreate.length > 0) {
        await prisma.event.createMany({ data: eventsToCreate });
      }

      // Progress
      const progress = Math.round(((batch + 1) / totalBatches) * 100);
      process.stdout.write(`\r   Progress: ${progress}% (${Math.min((batch + 1) * batchSize, config.visitorCount).toLocaleString()} visitors)`);
    }

    // Print stats
    const currencySymbol = isINR ? "₹" : "$";
    console.log("\n");
    console.log(`   📊 ${config.domain} Stats:`);
    console.log(`   ${"─".repeat(40)}`);
    console.log(`   Visitors:      ${stats.visitors.toLocaleString()}`);
    console.log(`   Impressions:   ${stats.impressions.toLocaleString()}`);
    console.log(`   Clicks:        ${stats.clicks.toLocaleString()} (${((stats.clicks / Math.max(stats.impressions, 1)) * 100).toFixed(1)}% CTR)`);
    console.log(`   Coupon Copies: ${stats.couponCopies.toLocaleString()}`);
    console.log(`   Conversions:   ${stats.conversions.toLocaleString()}`);
    console.log(`   Purchases:     ${stats.purchases.toLocaleString()}`);
    console.log(`   Revenue:       ${currencySymbol}${stats.revenue.toLocaleString()}`);
    console.log(`   Avg Order:     ${currencySymbol}${stats.purchases > 0 ? Math.round(stats.revenue / stats.purchases).toLocaleString() : 0}`);
  }
}

async function main() {
  console.log("🌱 Starting demo data seed...\n");

  // Create INR demo user
  const inrUser = await createDemoUser(DEMO_USER_INR, "Demo User (India)");
  await seedDataForUser(inrUser.id, "INR");

  // Create USD demo user
  const usdUser = await createDemoUser(DEMO_USER_USD, "Demo User (Global)");
  await seedDataForUser(usdUser.id, "USD");

  console.log(`\n${"═".repeat(60)}`);
  console.log("✅ Demo data seeded successfully!");
  console.log(`${"═".repeat(60)}`);
  console.log(`\nDemo user IDs:`);
  console.log(`  INR: ${inrUser.id}`);
  console.log(`  USD: ${usdUser.id}`);
  console.log(`\nUpdate DEMO_USER_ID in dashboard/page.tsx to use these.`);
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
