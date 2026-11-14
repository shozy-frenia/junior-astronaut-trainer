# Outpost 30 — Junior Astronaut Mission Trainer

**▶ Play:** https://shozy-frenia.github.io/junior-astronaut-trainer/

Outpost 30 is a browser card game for kids aged 7–12, built for the NASA Space Apps Challenge "Build a Junior Astronaut Mission Trainer". You and a crewmate run a small base at Jezero crater on Mars for 30 sols (Mars days). Every sol you pick 2 of 3 cards, and every card costs something: making oxygen drains power, building a radiation shield costs water, and hiding from a storm costs you a turn. You balance three bars (Life Support, Power and Shield) while the game replays **real NASA space weather**: solar flares, CMEs and particle storms from NASA's DONKI database. When the browser is online it fetches the last 30 days from NASA live; when it is offline it uses an embedded archive and clearly says so. Every real fact in the game has a "Where does this come from?" button that links to its NASA or CSA source. At the end, a debrief replays your mission to show which 3 choices mattered most.

## How to play

1. Open the game (link above, or open `index.html` in any browser; it works offline).
2. **Read the morning report.** It shows today's real space weather, dust storms and broken machines.
3. **Pick 2 of your 3 cards.** No skipping, and no card is free.
4. **Press sunset.** The base uses air, power and Shield, then the next sol starts.
5. **Win:** reach sol 30 with all three bars above 0, plus ⭐ 3 science stars and 🌱 5 harvests. Keep at least 4 mSv of Shield for 3 stars.

Tips: tap any dotted word (sol, mSv, CME...) for a one-sentence explanation. Kip, your guide, gives hints. Add `?seed=123` to the URL to replay the same mission.

Files: `index.html` (game engine and UI), `data.js` (all real data, each value with source URL and retrieval date), `style.css`, `SOURCES.md` (full source notes and caveats). Plain HTML/CSS/JS, no build step, no accounts.

## Datasets used

All saved data was retrieved on **2026-11-14** and is an archive, not live. Only the DONKI space weather can be fetched live, and the game labels which one you are seeing. Card costs, power numbers and chances are game numbers, not real measurements. See [SOURCES.md](SOURCES.md) for details and caveats.

| Dataset | Used for |
|---|---|
| [NASA CCMC DONKI](https://ccmc.gsfc.nasa.gov/DONKI-API/) | Solar flares, CMEs and particle storms (live or archived 2025-11-15 to 2026-11-14) |
| [NASA JPL Horizons](https://ssd.jpl.nasa.gov/api/horizons.api) | Earth–Mars radio delay on the Call Earth card |
| Curiosity RAD radiation on Mars ([SwRI release](https://swri.org/node/9079), [2017 storm](https://www.swri.org/newsroom/press-releases/large-solar-storm-sparks-global-aurora-doubles-radiation-levels-mars)) | Daily dose of 0.67 mSv per sol, Forbush dip, debrief comparison |
| [NASA OSDR RadLab](https://visualization.osdr.nasa.gov/radlab/) | ISS astronaut dose for the debrief comparison |
| [NASA OSDR](https://osdr.nasa.gov/bio/repo/data/studies/OSD-342) (OSD-342, OSD-684, OSD-530, Inspiration4 OSD-569/570/571/575) and [Barger et al. 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436) | Real astronaut-health facts on the Lab experiment card and in the debrief |
| [Mars Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html), [Earth Fact Sheet](https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html) | Sol length; Mars sunlight (about 43% of Earth's) behind the solar power numbers |
| [NASA MOXIE](https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/) | MOXIE oxygen maker card |
| [ISS water recovery](https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/) | Recycler overtime card, broken recycler |
| [Opportunity](https://www.jpl.nasa.gov/edu/resources/teachable-moment/mars-rover-mission-comes-to-an-end-but-science-legacy-live-on/), [InSight](https://www.jpl.nasa.gov/news/nasas-insight-still-hunting-marsquakes-as-power-levels-diminish/) | Dust storm event, Clean solar panels card, broken solar string |
| [Solar conjunction 2026 (NASA MAVEN blog)](https://science.nasa.gov/blogs/maven/2025/12/23/nasa-works-maven-spacecraft-issue-ahead-of-solar-conjunction/) | "Mars is behind the Sun" event that blocks Call Earth |
| [CSA: Growing food in space](https://www.asc-csa.gc.ca/eng/sciences/food-production/growing-healthy-food-in-space-and-remote-areas.asp), [CSA Interplanetary Farming (PDF)](https://www.asc-csa.gc.ca/pdf/eng/youth-educators/activities/fitness-and-nutrition/interplanetary-farming.pdf) | Grow food card |
| [Mars Ice Home](https://www.nasa.gov/centers-and-facilities/langley/nasalangley100-sojourning-to-mars/), [regolith shielding](https://ntrs.nasa.gov/citations/19900062325), [Orion storm shelter](https://science.nasa.gov/science-research/heliophysics/how-nasa-will-protect-astronauts-from-space-radiation-at-the-moon/), [Perseverance sample tubes](https://science.nasa.gov/photojournal/the-33-sample-tubes-collected-by-perseverance/), [ISS 3D printer](https://www.nasa.gov/missions/station/open-for-business-3-d-printer-creates-first-object-in-space-on-international-space-station) | Water wall, Dirt roof, Storm shelter, Rock-sample walk and Fix-it cards |

The in-game **Data sources** screen (footer link) lists every dataset and link.

## Team

**Nabeghlavi** (solo entry).

## License

Code: [MIT](LICENSE) © 2026 Nabeghlavi. NASA and CSA data and linked pages belong to their owners and follow their own terms; the game links to each source.
