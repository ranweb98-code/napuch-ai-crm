import { createLead, addActivity } from "../src/lib/leads";

/**
 * Optional sample data so the app doesn't open to a completely empty
 * dashboard the first time you run it. Safe to skip — run with:
 *   npm run db:seed
 */
async function main() {
  const today = new Date();
  const inDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return d;
  };

  const acme = await createLead({
    businessName: "Acme Logistics",
    contactName: "Dana Cohen",
    phone: "+972 50 123 4567",
    channelSource: "WEBSITE_FORM",
    status: "INTERESTED",
    notes: "Wants an AI agent to triage incoming support emails.",
    nextFollowUp: inDays(-1),
  });
  await addActivity(acme.id, {
    type: "EMAIL",
    content: "Sent intro deck and pricing overview.",
  });

  const bright = await createLead({
    businessName: "Bright Dental Clinic",
    contactName: "Dr. Yossi Levi",
    phone: "+972 52 987 6543",
    channelSource: "WHATSAPP_INQUIRY",
    status: "MEETING_SCHEDULED",
    notes: "Interested in an automated appointment-reminder agent.",
    nextFollowUp: inDays(0),
  });
  await addActivity(bright.id, {
    type: "MEETING",
    content: "Booked a demo call for Thursday 3pm.",
  });

  await createLead({
    businessName: "Northline Realty",
    contactName: "Maya Ben-David",
    phone: null,
    channelSource: "REFERRAL",
    status: "NEW",
    notes: "Referred by Dana at Acme.",
    nextFollowUp: inDays(3),
  });

  const closedDeal = await createLead({
    businessName: "Solaris Consulting",
    contactName: "Tomer Avraham",
    phone: "+972 54 111 2222",
    channelSource: "MANUAL_OUTREACH",
    status: "CLOSED_WON",
    notes: "Signed a 3-month pilot for a lead-qualification agent.",
    nextFollowUp: null,
  });
  await addActivity(closedDeal.id, {
    type: "NOTE",
    content: "Contract signed and first invoice sent.",
  });

  console.log("Seeded 4 example leads.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
