// ─── Mock Data ───────────────────────────────────────────────
// All UI is wired to this file. When backend is ready, swap api calls.

export const MOCK_USER = {
  id: "1",
  full_name: "Kesi Farmer",
  email: "kesi@farm.com",
  role: "farmer" as const,
};

export const MOCK_ADMIN = {
  id: "2",
  full_name: "Admin User",
  email: "admin@agriguard.com",
  role: "admin" as const,
};

export const MOCK_ANIMALS = [
  {
    id: 1, name: "Lakshmi", animal_type: "cow", breed: "Gir",
    age_months: 36, weight_kg: 420, tag_number: "TAG-001",
    image_url: null, device_id: 1, farmer_id: 1,
    qr_code: "qr-lakshmi-001",
    last_temp: 38.9, last_hr: 68, active_alerts: 0,
    device_status: "online" as const,
  },
  {
    id: 2, name: "Kamala", animal_type: "cow", breed: "HF Cross",
    age_months: 48, weight_kg: 480, tag_number: "TAG-002",
    image_url: null, device_id: 2, farmer_id: 1,
    qr_code: "qr-kamala-002",
    last_temp: 40.1, last_hr: 92, active_alerts: 2,
    device_status: "online" as const,
  },
  {
    id: 3, name: "Murugan", animal_type: "goat", breed: "Boer",
    age_months: 18, weight_kg: 35, tag_number: "TAG-003",
    image_url: null, device_id: 3, farmer_id: 1,
    qr_code: "qr-murugan-003",
    last_temp: 39.0, last_hr: 75, active_alerts: 0,
    device_status: "offline" as const,
  },
  {
    id: 4, name: "Chittu", animal_type: "chicken", breed: "Country",
    age_months: 6, weight_kg: 2.1, tag_number: "TAG-004",
    image_url: null, device_id: null, farmer_id: 1,
    qr_code: "qr-chittu-004",
    last_temp: null, last_hr: null, active_alerts: 0,
    device_status: "unassigned" as const,
  },
  {
    id: 5, name: "Bruno", animal_type: "dog", breed: "Indie",
    age_months: 24, weight_kg: 18, tag_number: "TAG-005",
    image_url: null, device_id: 4, farmer_id: 1,
    qr_code: "qr-bruno-005",
    last_temp: 38.6, last_hr: 88, active_alerts: 1,
    device_status: "online" as const,
  },
];

export const MOCK_DEVICES = [
  { id: 1, device_serial: "AGD-COL-0001", device_type: "collar",     status: "online" as const,  last_seen: new Date(Date.now() - 120000).toISOString(), battery_pct: 78, assigned_animal: { id: 1, name: "Lakshmi" },   firmware_version: "v2.1.3" },
  { id: 2, device_serial: "AGD-COL-0002", device_type: "collar",     status: "online" as const,  last_seen: new Date(Date.now() - 60000).toISOString(),  battery_pct: 91, assigned_animal: { id: 2, name: "Kamala" },    firmware_version: "v2.1.3" },
  { id: 3, device_serial: "AGD-ETG-0001", device_type: "ear_tag",    status: "offline" as const, last_seen: new Date(Date.now() - 3600000).toISOString(), battery_pct: 12, assigned_animal: { id: 3, name: "Murugan" },  firmware_version: "v1.8.0" },
  { id: 4, device_serial: "AGD-ANK-0001", device_type: "ankle_band", status: "online" as const,  last_seen: new Date(Date.now() - 180000).toISOString(), battery_pct: 55, assigned_animal: { id: 5, name: "Bruno" },    firmware_version: "v2.0.1" },
  { id: 5, device_serial: "AGD-COL-0003", device_type: "collar",     status: "unassigned" as const, last_seen: null, battery_pct: 100, assigned_animal: null,                                                           firmware_version: "v2.1.3" },
];

export const MOCK_ALERTS = [
  { id: 1, animal_id: 2, animal_name: "Kamala",  alert_type: "fever",       message: "Temperature 40.1°C exceeds warning threshold (39.2°C)",        severity: "warning"  as const, is_resolved: false, created_at: new Date(Date.now() - 900000).toISOString(), resolved_at: null },
  { id: 2, animal_id: 2, animal_name: "Kamala",  alert_type: "heart_rate",  message: "Heart rate 92 bpm above normal range for cow (>90 bpm)",        severity: "warning"  as const, is_resolved: false, created_at: new Date(Date.now() - 800000).toISOString(), resolved_at: null },
  { id: 3, animal_id: 5, animal_name: "Bruno",   alert_type: "inactivity",  message: "Activity level dropped below 10 for 2+ hours",                   severity: "info"     as const, is_resolved: false, created_at: new Date(Date.now() - 7200000).toISOString(), resolved_at: null },
  { id: 4, animal_id: 3, animal_name: "Murugan", alert_type: "device_offline", message: "Device AGD-ETG-0001 has not reported in over 60 minutes",    severity: "critical" as const, is_resolved: true,  created_at: new Date(Date.now() - 86400000).toISOString(), resolved_at: new Date(Date.now() - 43200000).toISOString() },
];

export const MOCK_HEALTH_HISTORY = Array.from({ length: 24 }, (_, i) => {
  const baseTemp = 38.5 + (i > 18 ? 1.5 : 0);
  return {
    id: i + 1,
    animal_id: 2,
    temperature: +(baseTemp + Math.random() * 0.4 - 0.2).toFixed(1),
    heart_rate: Math.round(65 + Math.random() * 20 + (i > 18 ? 15 : 0)),
    activity_level: +(40 + Math.random() * 30).toFixed(1),
    rumination_score: +(60 + Math.random() * 20).toFixed(1),
    timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
  };
});

export const MOCK_ADMIN_USERS = [
  { id: 1, full_name: "Kesi Farmer",  email: "kesi@farm.com",     role: "farmer" as const, is_active: true,  animals_count: 5, created_at: "2026-01-10T10:00:00Z" },
  { id: 2, full_name: "Admin User",   email: "admin@agriguard.com", role: "admin" as const, is_active: true,  animals_count: 0, created_at: "2025-12-01T08:00:00Z" },
  { id: 3, full_name: "Ravi Farm",    email: "ravi@farm.com",     role: "farmer" as const, is_active: true,  animals_count: 3, created_at: "2026-02-05T09:00:00Z" },
  { id: 4, full_name: "Meena Goats",  email: "meena@farm.com",    role: "farmer" as const, is_active: false, animals_count: 8, created_at: "2026-01-20T11:00:00Z" },
];

export const MOCK_STATS = {
  total_farmers: 3,
  total_animals: 16,
  devices_online: 8,
  open_alerts: 5,
  readings_today: 2847,
};
