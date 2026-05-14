const { createClient } = require("@supabase/supabase-js");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const supabase = createClient(
  "https://aeuvjwfkpznixhebvroh.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFldXZqd2ZrcHpuaXhoZWJ2cm9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4OTkyNjMsImV4cCI6MjA5MzQ3NTI2M30.qtd8BB8XSxJ-Hwk3hiuNxsz3evWV4WK2tu7nwuthUdI"
);

// FIFA World Cup 2026 - Complete Group Stage Schedule
// Source: Official FIFA draw + schedule
const matches = [
  // === MATCHDAY 1 ===
  // June 11
  { kickoff_at: "2026-06-11T16:00:00Z", team_1: "MEX", team_2: "RSA", group_code: "A" },
  { kickoff_at: "2026-06-11T19:00:00Z", team_1: "KOR", team_2: "CZE", group_code: "A" },
  { kickoff_at: "2026-06-11T22:00:00Z", team_1: "USA", team_2: "PAR", group_code: "D" },

  // June 12
  { kickoff_at: "2026-06-12T13:00:00Z", team_1: "CAN", team_2: "BIH", group_code: "B" },
  { kickoff_at: "2026-06-12T16:00:00Z", team_1: "QAT", team_2: "SUI", group_code: "B" },
  { kickoff_at: "2026-06-12T19:00:00Z", team_1: "BRA", team_2: "MAR", group_code: "C" },
  { kickoff_at: "2026-06-12T22:00:00Z", team_1: "HAI", team_2: "SCO", group_code: "C" },

  // June 13
  { kickoff_at: "2026-06-13T13:00:00Z", team_1: "AUS", team_2: "TUR", group_code: "D" },
  { kickoff_at: "2026-06-13T16:00:00Z", team_1: "GER", team_2: "CUW", group_code: "E" },
  { kickoff_at: "2026-06-13T19:00:00Z", team_1: "CIV", team_2: "ECU", group_code: "E" },
  { kickoff_at: "2026-06-13T22:00:00Z", team_1: "NED", team_2: "JPN", group_code: "F" },

  // June 14
  { kickoff_at: "2026-06-14T13:00:00Z", team_1: "SWE", team_2: "TUN", group_code: "F" },
  { kickoff_at: "2026-06-14T16:00:00Z", team_1: "BEL", team_2: "EGY", group_code: "G" },
  { kickoff_at: "2026-06-14T19:00:00Z", team_1: "IRN", team_2: "NZL", group_code: "G" },
  { kickoff_at: "2026-06-14T22:00:00Z", team_1: "ESP", team_2: "CPV", group_code: "H" },

  // June 15
  { kickoff_at: "2026-06-15T13:00:00Z", team_1: "KSA", team_2: "URU", group_code: "H" },
  { kickoff_at: "2026-06-15T16:00:00Z", team_1: "FRA", team_2: "SEN", group_code: "I" },
  { kickoff_at: "2026-06-15T19:00:00Z", team_1: "IRQ", team_2: "NOR", group_code: "I" },
  { kickoff_at: "2026-06-15T22:00:00Z", team_1: "ARG", team_2: "ALG", group_code: "J" },

  // June 16
  { kickoff_at: "2026-06-16T13:00:00Z", team_1: "AUT", team_2: "JOR", group_code: "J" },
  { kickoff_at: "2026-06-16T16:00:00Z", team_1: "POR", team_2: "COD", group_code: "K" },
  { kickoff_at: "2026-06-16T19:00:00Z", team_1: "UZB", team_2: "COL", group_code: "K" },
  { kickoff_at: "2026-06-16T22:00:00Z", team_1: "ENG", team_2: "CRO", group_code: "L" },

  // June 17
  { kickoff_at: "2026-06-17T13:00:00Z", team_1: "GHA", team_2: "PAN", group_code: "L" },

  // === MATCHDAY 2 ===
  // June 17
  { kickoff_at: "2026-06-17T16:00:00Z", team_1: "MEX", team_2: "KOR", group_code: "A" },
  { kickoff_at: "2026-06-17T19:00:00Z", team_1: "RSA", team_2: "CZE", group_code: "A" },
  { kickoff_at: "2026-06-17T22:00:00Z", team_1: "USA", team_2: "AUS", group_code: "D" },

  // June 18
  { kickoff_at: "2026-06-18T13:00:00Z", team_1: "CAN", team_2: "QAT", group_code: "B" },
  { kickoff_at: "2026-06-18T16:00:00Z", team_1: "BIH", team_2: "SUI", group_code: "B" },
  { kickoff_at: "2026-06-18T19:00:00Z", team_1: "BRA", team_2: "HAI", group_code: "C" },
  { kickoff_at: "2026-06-18T22:00:00Z", team_1: "MAR", team_2: "SCO", group_code: "C" },

  // June 19
  { kickoff_at: "2026-06-19T13:00:00Z", team_1: "PAR", team_2: "TUR", group_code: "D" },
  { kickoff_at: "2026-06-19T16:00:00Z", team_1: "GER", team_2: "CIV", group_code: "E" },
  { kickoff_at: "2026-06-19T19:00:00Z", team_1: "CUW", team_2: "ECU", group_code: "E" },
  { kickoff_at: "2026-06-19T22:00:00Z", team_1: "NED", team_2: "SWE", group_code: "F" },

  // June 20
  { kickoff_at: "2026-06-20T13:00:00Z", team_1: "JPN", team_2: "TUN", group_code: "F" },
  { kickoff_at: "2026-06-20T16:00:00Z", team_1: "BEL", team_2: "IRN", group_code: "G" },
  { kickoff_at: "2026-06-20T19:00:00Z", team_1: "EGY", team_2: "NZL", group_code: "G" },
  { kickoff_at: "2026-06-20T22:00:00Z", team_1: "ESP", team_2: "KSA", group_code: "H" },

  // June 21
  { kickoff_at: "2026-06-21T13:00:00Z", team_1: "CPV", team_2: "URU", group_code: "H" },
  { kickoff_at: "2026-06-21T16:00:00Z", team_1: "FRA", team_2: "IRQ", group_code: "I" },
  { kickoff_at: "2026-06-21T19:00:00Z", team_1: "SEN", team_2: "NOR", group_code: "I" },
  { kickoff_at: "2026-06-21T22:00:00Z", team_1: "ARG", team_2: "AUT", group_code: "J" },

  // June 22
  { kickoff_at: "2026-06-22T13:00:00Z", team_1: "ALG", team_2: "JOR", group_code: "J" },
  { kickoff_at: "2026-06-22T16:00:00Z", team_1: "POR", team_2: "UZB", group_code: "K" },
  { kickoff_at: "2026-06-22T19:00:00Z", team_1: "COD", team_2: "COL", group_code: "K" },
  { kickoff_at: "2026-06-22T22:00:00Z", team_1: "ENG", team_2: "GHA", group_code: "L" },

  // June 23
  { kickoff_at: "2026-06-23T13:00:00Z", team_1: "CRO", team_2: "PAN", group_code: "L" },

  // === MATCHDAY 3 (simultaneous kick-offs per group) ===
  // June 23
  { kickoff_at: "2026-06-23T19:00:00Z", team_1: "MEX", team_2: "CZE", group_code: "A" },
  { kickoff_at: "2026-06-23T19:00:00Z", team_1: "RSA", team_2: "KOR", group_code: "A" },
  { kickoff_at: "2026-06-23T22:00:00Z", team_1: "USA", team_2: "TUR", group_code: "D" },
  { kickoff_at: "2026-06-23T22:00:00Z", team_1: "PAR", team_2: "AUS", group_code: "D" },

  // June 24
  { kickoff_at: "2026-06-24T16:00:00Z", team_1: "CAN", team_2: "SUI", group_code: "B" },
  { kickoff_at: "2026-06-24T16:00:00Z", team_1: "BIH", team_2: "QAT", group_code: "B" },
  { kickoff_at: "2026-06-24T19:00:00Z", team_1: "BRA", team_2: "SCO", group_code: "C" },
  { kickoff_at: "2026-06-24T19:00:00Z", team_1: "MAR", team_2: "HAI", group_code: "C" },
  { kickoff_at: "2026-06-24T22:00:00Z", team_1: "GER", team_2: "ECU", group_code: "E" },
  { kickoff_at: "2026-06-24T22:00:00Z", team_1: "CUW", team_2: "CIV", group_code: "E" },

  // June 25
  { kickoff_at: "2026-06-25T16:00:00Z", team_1: "NED", team_2: "TUN", group_code: "F" },
  { kickoff_at: "2026-06-25T16:00:00Z", team_1: "JPN", team_2: "SWE", group_code: "F" },
  { kickoff_at: "2026-06-25T19:00:00Z", team_1: "BEL", team_2: "NZL", group_code: "G" },
  { kickoff_at: "2026-06-25T19:00:00Z", team_1: "EGY", team_2: "IRN", group_code: "G" },
  { kickoff_at: "2026-06-25T22:00:00Z", team_1: "ESP", team_2: "URU", group_code: "H" },
  { kickoff_at: "2026-06-25T22:00:00Z", team_1: "CPV", team_2: "KSA", group_code: "H" },

  // June 26
  { kickoff_at: "2026-06-26T16:00:00Z", team_1: "FRA", team_2: "NOR", group_code: "I" },
  { kickoff_at: "2026-06-26T16:00:00Z", team_1: "SEN", team_2: "IRQ", group_code: "I" },
  { kickoff_at: "2026-06-26T19:00:00Z", team_1: "ARG", team_2: "JOR", group_code: "J" },
  { kickoff_at: "2026-06-26T19:00:00Z", team_1: "ALG", team_2: "AUT", group_code: "J" },
  { kickoff_at: "2026-06-26T22:00:00Z", team_1: "POR", team_2: "COL", group_code: "K" },
  { kickoff_at: "2026-06-26T22:00:00Z", team_1: "COD", team_2: "UZB", group_code: "K" },

  // June 27
  { kickoff_at: "2026-06-27T19:00:00Z", team_1: "ENG", team_2: "PAN", group_code: "L" },
  { kickoff_at: "2026-06-27T19:00:00Z", team_1: "CRO", team_2: "GHA", group_code: "L" },
];

async function seed() {
  console.log(`Seeding ${matches.length} group stage matches...`);

  // Clear existing matches
  const { error: delErr } = await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (delErr) console.log("Warning clearing:", delErr.message);

  // Insert all matches
  const rows = matches.map((m) => ({
    ...m,
    stage: "group",
    status: "scheduled",
  }));

  const { data, error } = await supabase.from("matches").insert(rows).select("id");

  if (error) {
    console.error("Error inserting:", error.message);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} matches successfully!`);
}

seed();
