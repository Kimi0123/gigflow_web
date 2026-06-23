import type { Project } from "./dashboard.types";

export const categories = ["All", "Design", "Development", "Writing", "Marketing"];

export const projectTypes = ["All projects", "Fixed price", "Hourly"];

export const skills = [
  "Figma",
  "React",
  "Node.js",
  "Branding",
  "SEO",
  "Swift",
  "After Effects",
  "TypeScript",
];

export const projects: Project[] = [
  {
    company: "Meridian Analytics",
    initials: "ME",
    rating: "4.9",
    reviews: "34",
    title: "Senior UI/UX Designer for SaaS Analytics Dashboard",
    description:
      "We're rebuilding our core analytics dashboard and need an experienced designer to lead UX. You'll define information architecture, create wireframes, and deliver high-fidelity Figma prototypes ready for handoff.",
    tags: ["Figma", "Dashboard Design", "UX Research", "Design Systems"],
    budget: "Rs. 50000 -70000",
    type: "Fixed price",
    duration: "1-2 months",
    proposals: "8 proposals",
    posted: "2 hours ago",
    location: "Kathmandu, Nepal",
    featured: true,
  },
  {
    company: "Meridian Analytics",
    initials: "ME",
    rating: "4.9",
    reviews: "34",
    title: "Senior UI/UX Designer for SaaS Analytics Dashboard",
    description:
      "We're rebuilding our core analytics dashboard and need an experienced designer to lead UX. You'll define information architecture, create wireframes, and deliver high-fidelity Figma prototypes ready for handoff.",
    tags: ["Figma", "Dashboard Design", "UX Research", "Design Systems"],
    budget: "Rs. 50000 -60000",
    type: "Fixed price",
    duration: "1-2 months",
    proposals: "8 proposals",
    posted: "2 hours ago",
    location: "Kathmandu, Nepal",
    featured: true,
  },
  {
    company: "Verdant Foods",
    initials: "VE",
    rating: "4.5",
    reviews: "7",
    title: "Brand Identity Designer - Sustainable Food Startup",
    description:
      "We're a seed-stage food startup launching in Q3 and need a complete brand identity system: logo, colour palette, typography, packaging guidelines, and a brand deck. Earth-forward, modern, and approachable.",
    tags: ["Branding", "Logo Design", "Illustrator", "Packaging"],
    budget: "Rs. 2000 - 4000",
    type: "Fixed price",
    duration: "3-5 weeks",
    proposals: "22 proposals",
    posted: "1 day ago",
    location: "London, UK",
  },
];
