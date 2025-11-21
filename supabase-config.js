// 🔧 REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = "https://ifzdkxqreopnllabfxym.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmemRreHFyZW9wbmxsYWJmeHltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3MDgwNTYsImV4cCI6MjA3OTI4NDA1Nn0.MpMlxLYytTgMwzAuejhxfHVXc-3xRhd6TM9pCjYIfNY";

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Fallback data in case Supabase is not available
const fallbackMaterials = [
  {
    id: "1",
    name: "Plastic Bottles",
    category: "plastic",
    disposal_instructions:
      "Rinse and place in plastic recycling bins found across Doha",
    recycling_tips: [
      "Remove caps",
      "Flatten bottles",
      "Check for recycling symbols",
    ],
  },
  {
    id: "2",
    name: "Glass Containers",
    category: "glass",
    disposal_instructions: "Clean and place in glass recycling bins",
    recycling_tips: [
      "Remove lids",
      "No broken glass",
      "Separate by color if possible",
    ],
  },
  {
    id: "3",
    name: "Batteries",
    category: "hazardous",
    disposal_instructions: "Take to designated e-waste centers in Doha",
    recycling_tips: [
      "Store separately",
      "No regular trash",
      "Check Qatar Green Center",
    ],
  },
];

const fallbackLocations = [
  {
    id: "1",
    name: "Al Rayyan Recycling Center",
    latitude: 25.32,
    longitude: 51.37,
    type: "Recycling Center",
    materials: ["plastic", "glass", "paper", "metal"],
  },
  {
    id: "2",
    name: "West Bay Drop-off Point",
    latitude: 25.33,
    longitude: 51.52,
    type: "Drop-off Point",
    materials: ["plastic", "paper"],
  },
  {
    id: "3",
    name: "Doha Festival City Bins",
    latitude: 25.42,
    longitude: 51.35,
    type: "Donation Bin",
    materials: ["clothing", "electronics"],
  },
];
