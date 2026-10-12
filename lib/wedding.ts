export const wedding = {
  bride: "Juliet John",
  groom: "Christopher Okafor",
  dateLabel: "Wednesday | 23rd | December 2026",
  // RSVPs close the day before; adjust as needed.
  deadlineISO: "2026-12-16T23:59:59+01:00",
  deadlineLabel: "16th December 2026",
  families: [
    {
      head: "Apostle Ogbonna John",
      from: "of Umuohu Okpula Ndume Ibeku, Umuahia, North LGA, Abia State",
    },
    {
      head: "Mr & Mrs Okafor",
      from: "of Nde-Ajero Family, Obinkita, Arochukwu, LGA, Abia State",
    },
  ],
  events: [
    {
      title: "Wedding Ceremony",
      venue: "Reens Suites & Apartments, PHC Field",
      time: "11:00 AM",
    },
    {
      title: "Wedding Reception",
      venue: "Reens Suites & Apartments, PHC Main Hall",
      time: "1:00 PM",
    },
  ],
  colors: [
    { name: "Ivory", hex: "#fbf6ec" },
    { name: "Olive Green", hex: "#5b6b2e" },
    { name: "Blush", hex: "#f2808c" },
    { name: "Gold", hex: "#b8913f" },
    { name: "White", hex: "#ffffff" },
  ],
  rsvpPhone: "07034670696",
} as const;
