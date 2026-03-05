"use client";

import { useState, useEffect, useMemo } from "react";
import { db } from "@/lib/db/database";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useVisitorStore } from "@/modules/visitors/store/visitorStore";
import type { NormalizedNPCVisitor } from "@/types/data";

export default function VisitorsPage() {
  const [visitors, setVisitors] = useState<NormalizedNPCVisitor[]>([]);
  const { visitLog, addVisit, removeVisit } = useVisitorStore();

  useEffect(() => {
    db.npcVisitors.toArray().then(setVisitors);
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  // Get start of week (Sunday)
  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  }, []);

  const weekVisitors = useMemo(() => {
    return new Set(visitLog.filter((v) => v.visitDate >= weekStart).map((v) => v.npcId));
  }, [visitLog, weekStart]);

  const visitCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const v of visitLog) {
      counts[v.npcId] = (counts[v.npcId] ?? 0) + 1;
    }
    return counts;
  }, [visitLog]);

  const lastVisits = useMemo(() => {
    const last: Record<string, string> = {};
    for (const v of visitLog) {
      if (!last[v.npcId] || v.visitDate > last[v.npcId]) {
        last[v.npcId] = v.visitDate;
      }
    }
    return last;
  }, [visitLog]);

  const todayVisitors = useMemo(() => {
    return new Set(visitLog.filter((v) => v.visitDate === today).map((v) => v.npcId));
  }, [visitLog, today]);

  const toggleToday = (npcId: string) => {
    const entryId = `${npcId}-${today}`;
    if (todayVisitors.has(npcId)) {
      removeVisit(entryId);
    } else {
      addVisit(npcId, today);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text">NPC Visitors</h1>
        <p className="text-text-secondary mt-1">
          Track the 11 weekly rotating visitors. Click a visitor to mark them as here today.
        </p>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-semibold text-text">{dayName}</span>
            <span className="text-sm text-text-muted ml-2">{today}</span>
          </div>
          <span className="text-sm text-text-muted">
            {weekVisitors.size} / 11 logged this week
          </span>
        </div>
      </Card>

      {/* NPC Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {visitors.map((npc) => {
          const isHereToday = todayVisitors.has(npc.id);
          const totalVisits = visitCounts[npc.id] ?? 0;
          const lastVisit = lastVisits[npc.id];

          return (
            <div
              key={npc.id}
              className={`
                relative rounded-2xl bg-bg-card border-2 p-4
                flex flex-col items-center text-center cursor-pointer
                transition-all duration-200
                ${isHereToday
                  ? "border-primary-400 bg-primary-50 shadow-md"
                  : "border-border hover:border-border-strong hover:shadow-sm"
                }
              `}
              onClick={() => toggleToday(npc.id)}
            >
              {/* NPC Image */}
              {npc.imageUri ? (
                <img
                  src={npc.imageUri}
                  alt={npc.name}
                  width={80}
                  height={80}
                  className={`w-20 h-20 rounded-full object-cover border-3 transition-all duration-200 ${
                    isHereToday ? "border-primary-400" : "border-border"
                  }`}
                  loading="lazy"
                />
              ) : (
                <div className={`w-20 h-20 rounded-full flex items-center justify-center border-3 ${
                  isHereToday ? "border-primary-400 bg-primary-100" : "border-border bg-bg-hover"
                }`}>
                  <span className="text-xl font-bold text-text-muted">{npc.name.charAt(0)}</span>
                </div>
              )}

              {/* Name */}
              <h3 className="text-sm font-bold text-text mt-3">{npc.name}</h3>

              {/* Status */}
              {isHereToday ? (
                <Badge variant="donated" className="mt-1.5">Here Today</Badge>
              ) : (
                <span className="text-[10px] text-text-muted mt-1.5">Tap to log visit</span>
              )}

              {/* Visit count */}
              {totalVisits > 0 && (
                <span className="text-[10px] text-text-muted mt-1">
                  {totalVisits} visit{totalVisits !== 1 ? "s" : ""}
                </span>
              )}

              {/* Last seen */}
              {lastVisit && !isHereToday && (
                <span className="text-[10px] text-text-muted">
                  Last: {lastVisit}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail cards */}
      <h2 className="text-lg font-bold text-text mt-6">Visitor Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visitors.map((npc) => (
          <Card key={`detail-${npc.id}`} className="flex items-start gap-4">
            {npc.imageUri && (
              <img
                src={npc.imageUri}
                alt={npc.name}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                loading="lazy"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-text">{npc.name}</h3>
              <p className="text-xs text-primary-600 font-medium">{npc.schedule}</p>
              <p className="text-xs text-text-secondary mt-1">{npc.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Other NPCs */}
      <h2 className="text-lg font-bold text-text mt-8">Other NPCs</h2>
      <p className="text-text-secondary text-sm mb-3">
        Permanent residents, shop owners, and special characters you&apos;ll encounter on your island.
      </p>
      <OtherNPCSection />
    </div>
  );
}

/* ─── Other NPCs ──────────────────────────────────────────── */

interface OtherNPC {
  name: string;
  role: string;
  location: string;
  description: string;
  imageId: string;
}

const OTHER_NPCS: { category: string; npcs: OtherNPC[] }[] = [
  {
    category: "Resident Services",
    npcs: [
      {
        name: "Tom Nook",
        role: "Island Representative",
        location: "Resident Services",
        description: "The raccoon who runs your island. Handles infrastructure, home loans, and island development. Talk to him about bridges, inclines, moving buildings, and paying off your home.",
        imageId: "rcm",
      },
      {
        name: "Isabelle",
        role: "Island Secretary",
        location: "Resident Services",
        description: "Your cheerful assistant who handles island evaluations, resident complaints, flag/tune changes, and daily announcements. Unlocks after upgrading Resident Services.",
        imageId: "sza",
      },
    ],
  },
  {
    category: "Shops",
    npcs: [
      {
        name: "Timmy & Tommy",
        role: "Shop Owners",
        location: "Nook's Cranny",
        description: "Tom Nook's nephews run the general store. Buy tools, furniture, wallpaper, flooring, and seeds. Sell your items here. The hot item of the day sells for 2x price.",
        imageId: "ttlA",
      },
      {
        name: "Mabel",
        role: "Tailor",
        location: "Able Sisters",
        description: "Runs the Able Sisters clothing shop with her sister Sable. Sells clothing, accessories, and wands. The fitting room lets you try outfits before buying.",
        imageId: "hgh",
      },
      {
        name: "Sable",
        role: "Seamstress",
        location: "Able Sisters",
        description: "The quiet, hardworking sister at the sewing machine. Talk to her daily for 10+ days and she'll start giving you custom design patterns for furniture.",
        imageId: "hga",
      },
    ],
  },
  {
    category: "Museum",
    npcs: [
      {
        name: "Blathers",
        role: "Museum Curator",
        location: "Museum",
        description: "The owl who runs your museum. Donate fish, bugs, sea creatures, fossils, and art. He'll assess unidentified fossils and tell you about each donation (at length).",
        imageId: "owl",
      },
    ],
  },
  {
    category: "Airport",
    npcs: [
      {
        name: "Orville",
        role: "Airport Attendant",
        location: "Dodo Airlines (counter)",
        description: "The dodo at the front desk. Handles online play, local play, sending mail to other islands, and using Dodo Codes. Controls the airport gates.",
        imageId: "dod",
      },
      {
        name: "Wilbur",
        role: "Pilot",
        location: "Dodo Airlines (seaplane)",
        description: "The pilot who flies you to mystery islands with Nook Miles Tickets, and to friends' islands. Also handles rescue services if you get stuck.",
        imageId: "doc",
      },
    ],
  },
  {
    category: "Weekly Visitors",
    npcs: [
      {
        name: "K.K. Slider",
        role: "Musician",
        location: "Plaza (Saturday evenings)",
        description: "The legendary dog musician performs every Saturday at 6 PM in the plaza. Request songs by name or let him pick. He'll give you a recording of each song.",
        imageId: "tkkA",
      },
      {
        name: "Daisy Mae",
        role: "Turnip Seller",
        location: "Roaming (Sunday mornings)",
        description: "Joan's granddaughter sells turnips every Sunday from 5 AM to 12 PM. Buy low, sell high at Nook's Cranny during the week. Prices change twice daily.",
        imageId: "boc",
      },
    ],
  },
  {
    category: "Special Encounters",
    npcs: [
      {
        name: "Pascal",
        role: "Otter Philosopher",
        location: "Ocean (when you catch a scallop)",
        description: "Appears when you dive and catch a scallop. Give him the scallop and he'll reward you with mermaid furniture DIY recipes, pearls, or mermaid clothing.",
        imageId: "ust",
      },
      {
        name: "Kapp'n",
        role: "Boat Tour Captain",
        location: "Pier (2.0 update)",
        description: "The sea turtle captain at your pier. For 1,000 Nook Miles, he'll take you on a boat tour to mysterious islands with rare items, different seasons, and star fragment trees.",
        imageId: "kpp",
      },
      {
        name: "Brewster",
        role: "Barista",
        location: "The Roost (museum cafe, 2.0 update)",
        description: "The pigeon barista who runs The Roost cafe in the museum basement. Buy coffee daily to collect rewards. Invite amiibo characters and friends for coffee.",
        imageId: "pge",
      },
      {
        name: "Luna",
        role: "Dream Guide",
        location: "Sleep in a bed",
        description: "Access Luna by sleeping in any bed in your house. She lets you visit dream versions of other players' islands using Dream Addresses, without affecting the real island.",
        imageId: "tap",
      },
    ],
  },
  {
    category: "Harv's Island Plaza (2.0)",
    npcs: [
      {
        name: "Harriet",
        role: "Hairstylist",
        location: "Harv's Island plaza",
        description: "Unlocks new hairstyles and reactions that aren't available at the mirror. Visit her on Harv's Island after funding her shop.",
        imageId: "bpt",
      },
      {
        name: "Katrina",
        role: "Fortune Teller",
        location: "Harv's Island plaza",
        description: "The panther fortune teller who reads your luck daily. Pay 1,000 Bells for a general reading or 10,000 for a luck boost/cleanse. Affects item luck, friendship, and more.",
        imageId: "ftc",
      },
      {
        name: "Reese & Cyrus",
        role: "Customization Experts",
        location: "Harv's Island plaza",
        description: "The alpaca couple can customize furniture with colors and patterns you can't do at a DIY bench. Cyrus does the work; bring the item and pay a fee.",
        imageId: "alp",
      },
      {
        name: "Tortimer",
        role: "Retired Mayor",
        location: "Harv's Island plaza",
        description: "The retired tortoise mayor from previous games. Set up a storage service on Harv's Island that lets you access your home storage remotely.",
        imageId: "kot",
      },
    ],
  },
  {
    category: "Seasonal / Event Characters",
    npcs: [
      {
        name: "Zipper T. Bunny",
        role: "Bunny Day Host",
        location: "Roaming (April 1-12)",
        description: "The suspicious bunny who hosts Bunny Day. Hides eggs around your island in 6 types. Collect them to craft egg furniture and clothing DIY recipes.",
        imageId: "pyn",
      },
      {
        name: "Rover",
        role: "May Day Guide",
        location: "May Day maze island (May 1-7)",
        description: "The friendly cat from previous games. Appears at the end of the May Day maze island challenge. Completing the maze earns you Rover's Briefcase.",
        imageId: "xct",
      },
      {
        name: "Pave",
        role: "Festivale Host",
        location: "Plaza (Festivale, mid-February)",
        description: "The peacock dance master who hosts Festivale. Collect feathers from around your island and trade them to Pave for exclusive Festivale float furniture.",
        imageId: "pck",
      },
      {
        name: "Jack",
        role: "Czar of Halloween",
        location: "Plaza (October 31, after 5 PM)",
        description: "The pumpkin-headed Halloween host. Give him candy and lollipops on Halloween night to receive spooky furniture and clothing rewards.",
        imageId: "pkn",
      },
      {
        name: "Franklin",
        role: "Turkey Day Chef",
        location: "Plaza (4th Thursday of November)",
        description: "The turkey chef who hosts Turkey Day. Help him cook by gathering ingredients from your island. Complete all 4 courses for exclusive Turkey Day furniture.",
        imageId: "tuk",
      },
      {
        name: "Jingle",
        role: "Toy Day Reindeer",
        location: "Plaza (December 24)",
        description: "Santa's reindeer helper who appears on Toy Day. He gives you a Magic Bag to deliver presents to your villagers. Doing so earns you Jingle's Photo and Toy Day items.",
        imageId: "rei",
      },
    ],
  },
];

function OtherNPCSection() {
  return (
    <div className="space-y-4">
      {OTHER_NPCS.map((group) => (
        <div key={group.category}>
          <h3 className="text-sm font-semibold text-text mb-2">{group.category}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {group.npcs.map((npc) => (
              <Card key={npc.name} className="flex items-start gap-4">
                <img
                  src={`https://acnhcdn.com/latest/NpcIcon/${npc.imageId}.png`}
                  alt={npc.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-text">{npc.name}</h4>
                  <p className="text-xs text-primary-600 font-medium">{npc.role}</p>
                  <p className="text-[10px] text-text-muted">{npc.location}</p>
                  <p className="text-xs text-text-secondary mt-1">{npc.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
