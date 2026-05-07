/* Mock data for the live meeting view */

window.MOCK = {
  client: {
    name: "Aviv Capital",
    industry: "Fintech · Series B",
    region: "Tel Aviv, IL",
    contact: "Yael Ben-David",
    role: "VP Engineering",
    deal: "Vertex AI Migration",
    arr: "$1.4M ARR (potential)",
  },
  goal: "Follow-up on previous Vertex AI discussion. Probe latency requirements and current Bedrock spend; surface Model Garden + regional endpoints.",
  participants: [
    { name: "Yael Ben-David",  role: "VP Engineering, Aviv Capital", side: "client", color: "#EA4335", initials: "YB" },
    { name: "Daniel Cohen",     role: "Staff ML Engineer, Aviv",      side: "client", color: "#F9AB00", initials: "DC" },
    { name: "You — Noa Levi",   role: "Sr. Cloud SE",                  side: "rep",    color: "#1A73E8", initials: "NL" },
  ],

  // Live transcript (mix of HE and EN). startedAt seconds.
  transcript: [
    { t: "00:42", speaker: "client", name: "Yael",  lang: "he", text: "אז כמו שאמרתי, אנחנו כרגע מריצים את המודלים שלנו על Bedrock, וזה עובד — אבל יש לנו בעיית latency משמעותית מהלקוחות באירופה.", trans: "So as I said, we're currently running our models on Bedrock — it works, but we have significant latency issues from European customers." },
    { t: "00:58", speaker: "rep",    name: "Noa",   lang: "en", text: "Got it. When you say significant — what range are we looking at, p95?" },
    { t: "01:04", speaker: "client", name: "Yael",  lang: "en", text: "Around 1.8 to 2.2 seconds end-to-end. Honestly anything above one second feels broken for our traders.", entities: ["latency", "p95"] },
    { t: "01:18", speaker: "client", name: "Daniel",lang: "he", text: "וגם המחיר על Claude Sonnet התחיל לטפס. אנחנו כבר ב‑$38K לחודש רק על inference, וזה לפני שאנחנו מתחילים לדבר על fine-tuning.", trans: "And the price on Claude Sonnet has started climbing. We're already at $38K/month just on inference, before we even talk about fine-tuning.", entities: ["Claude Sonnet", "Bedrock", "$38K/mo"] },
    { t: "01:34", speaker: "rep",    name: "Noa",   lang: "en", text: "Understood. Are you doing any model versioning across teams, or is it one shared endpoint right now?" },
    { t: "01:41", speaker: "client", name: "Daniel",lang: "en", text: "One shared endpoint. It's becoming a problem — risk team wants stable behavior, research wants the latest. We're hacking around it with prompt prefixes.", entities: ["model versioning", "shared endpoint"], sentiment: "concern" },
    { t: "01:55", speaker: "client", name: "Yael",  lang: "he", text: "תקשיב, אם אנחנו עוברים, אנחנו צריכים שזה יקרה ברבעון הזה. ה‑board לוחץ.", trans: "Look — if we migrate, it has to happen this quarter. The board is pushing.", sentiment: "buying" },
  ],

  // Proactive hints, surfaced over time
  hints: [
    {
      id: "h1",
      title: "AWS Bedrock mentioned",
      category: "Competitive",
      color: "blue",
      summary: "Client is running Anthropic Claude on Bedrock. Reframe around Model Garden's one-click access to 200+ models including Claude, Llama, Gemini and pay-as-you-go pricing.",
      proofPoints: [
        "Vertex AI Model Garden supports Anthropic, Meta, Mistral & Google models from a single endpoint.",
        "Multi-model A/B routing without redeploying infrastructure.",
        "Regional endpoints in europe-west4 (Eemshaven) cut p95 by ~40% for EU traffic.",
      ],
      sources: ["Battlecard: Bedrock vs. Vertex (Q1)", "Customer story: NeoBank — 1.9s → 380ms"],
      confidence: 0.92,
      timestamp: "01:22",
    },
    {
      id: "h2",
      title: "Latency pain — 1.8–2.2s p95",
      category: "Problem→Solution",
      color: "red",
      summary: "Client mentioned 1.8–2.2s end-to-end latency from EU traders. Their endpoint is likely us-east. Surface regional Vertex endpoints + provisioned throughput.",
      proofPoints: [
        "europe-west4 + private Service Connect typically lands sub-500ms for Tel Aviv ↔ Frankfurt.",
        "Provisioned throughput removes cold-start variance for trading workloads.",
        "Auto-failover across two EU regions for compliance.",
      ],
      sources: ["Latency calculator", "Reference arch: low-latency inference"],
      confidence: 0.88,
      timestamp: "01:09",
    },
    {
      id: "h3",
      title: "Cost climbing — $38K/mo on inference",
      category: "Commercial",
      color: "yellow",
      summary: "Spend on Claude Sonnet via Bedrock is escalating. Position committed-use discounts + Gemini 2.5 Flash for non-critical paths.",
      proofPoints: [
        "CUDs on Vertex give 25–52% off list for 1y/3y commitments.",
        "Hybrid routing: Gemini Flash for triage, Claude on Vertex for high-value queries — typically 30–45% TCO drop.",
      ],
      sources: ["Pricing model (sheet)", "ROI calculator"],
      confidence: 0.83,
      timestamp: "01:31",
    },
  ],

  // Suggested follow-up questions (keep short)
  followups: [
    "Which AWS region are your model endpoints in today?",
    "Have you benchmarked Gemini 2.5 Flash for the triage tier?",
    "Who owns the model-versioning policy — research, risk, or platform?",
    "What's your hard ceiling on p95 latency before this becomes a board issue?",
  ],

  // Sentiment timeline (0..100 = engagement)
  sentimentSeries: [
    62, 64, 66, 65, 60, 55, 52, 56, 61, 68, 74, 78, 81, 84, 86, 84, 82, 85, 88, 90,
  ],
  sentimentEvents: [
    { at: 5,  label: "Small talk",        kind: "neutral" },
    { at: 8,  label: "Hesitation detected", kind: "concern" },
    { at: 12, label: "Engagement rising",   kind: "positive" },
    { at: 18, label: "Buying signal",       kind: "buying"  },
  ],

  // Pinned context from pre-meeting docs
  context: [
    { kind: "url",   label: "avivcapital.com",         note: "Series B fintech, algo trading desk" },
    { kind: "doc",   label: "Discovery call notes — Mar 14", note: "Bedrock spend, multi-model interest" },
    { kind: "case",  label: "NeoBank — Vertex migration", note: "Comparable EU latency story" },
    { kind: "doc",   label: "Aviv security review.pdf", note: "VPC-SC + CMEK requirements" },
  ],

  // Comments / private notes from the rep
  notes: [
    { t: "00:21", text: "Yael seemed cooler than last call — board pressure?" },
  ],
};
