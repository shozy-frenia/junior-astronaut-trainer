# Outpost 30 - SOURCES

All data was retrieved **2026-11-14**. It is an **archive, not live**. Every real value in `data.js` is an entry with `value, unit, source, url, retrieved`. Tuned game numbers ([T] in SPEC.md) are not in `data.js`.

## Answers to your questions

- **Does DONKI work without an API key?** Yes. `https://ccmc.gsfc.nasa.gov/DONKI-API/get/{FLR|CME|SEP}?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` returned JSON with no key (tested 2026-11-14 from a browser). Max 60 days per request. The old `api.nasa.gov/DONKI` and `kauai.ccmc.gsfc.nasa.gov` routes were retired on 2026-09-30 (announcement: https://ccmc.gsfc.nasa.gov/news/major-updates/); I did not re-test the old routes myself.
- **Event link pattern:** `https://ccmc.gsfc.nasa.gov/DONKI/view/{FLR|CME|SEP}/{id}/-1` (matches the `link` field the API returns).

## What is in data.js

| Section | What | Source | Count |
|---|---|---|---|
| `donki.flares` | Peak time, GOES class, link | DONKI FLR | 400 (15 X, 283 M, 102 C) |
| `donki.cmes` | Start time, speed km/s, Mars-arrival estimate, glancing flag, link | DONKI CME | 207 |
| `donki.seps` | Event time, detector and energy channel, linked flare/CME, link | DONKI SEP | 37 |
| `earthMars` | One-way light time 10.94 to 20.16 min (every 10th day), distance 1.316 to 2.424 AU | JPL Horizons | 37 samples |
| `iss` | ISS absorbed dose rate and dose equivalent, typical day and storm day | RadLab / ALTEA-Survey | 2 days |
| `mars.planet`, `mars.jezero` | Sol length, gravity, sunlight, pressure, temperature, Jezero weather | Mars Fact Sheet, NASA MEDA reports | see file |
| `mars.radiation` | RAD dose 0.67 mSv/day, cruise 1.8 mSv/day, Sept 2017 storm | SwRI/NASA, GRL, Space Weather | see file |
| `anchors` | MOXIE, ISS water recovery, Opportunity, InSight, Ingenuity, 2026 solar conjunction | NASA / JPL pages | see file |
| `csaFood` | 4 food-in-space facts | Canadian Space Agency | 4 |
| `osdr` | 5 astronaut-health sentences with study IDs | NASA OSDR + 1 flagged non-OSDR | 5 |
| `glossary` | One-sentence pop-ups for science words | written for kids | 17 |

Window for DONKI: 2025-11-15 to 2026-11-14 (UTC). Curation: flares = C, M, X (B dropped); CMEs = all that DONKI models as hitting Mars (153) plus all of 1000 km/s or faster (54 more); SEPs = all 37 listed.

### Key figures

- **Biggest events in the window:** flare X8.1 on 2026-02-01 (id 44361); fastest CME 1903 km/s on 2025-12-01 (id 43155); SEP cluster 2026-01-18 to 21 tied to the X1.9 flare and a 1820 km/s CME.
- **ISS typical day (2012-03-15):** 7.64 µGy/h absorbed, 31.37 µSv/h dose equivalent = **0.753 mSv/day**.
- **ISS storm day (2012-03-07):** 15.22 µGy/h absorbed, 42.41 µSv/h dose equivalent = **1.018 mSv/day** (peak 471.4 µSv/h at 15:24 UTC). Same day DONKI lists an X5.4 flare (00:24 UTC) and a CME of 2200 km/s.
- **Mars surface (Curiosity RAD, Gale crater):** 0.67 mSv/day average, Aug 2012 to Jun 2013.

## Source list

| Source | URL | Used for |
|---|---|---|
| NASA CCMC DONKI | https://ccmc.gsfc.nasa.gov/DONKI-API/ | Flares, CMEs, SEPs |
| NASA JPL Horizons | https://ssd.jpl.nasa.gov/api/horizons.api | Earth-Mars light time, distance |
| NASA OSDR RadLab | https://visualization.osdr.nasa.gov/radlab/ | ISS dose rates (ALTEA-Survey) |
| Mars Fact Sheet (updated 19 May 2025) | https://nssdc.gsfc.nasa.gov/planetary/factsheet/marsfact.html | Sol, gravity, sunlight, pressure, temperature, distance |
| Earth Fact Sheet (updated 15 Nov 2024) | https://nssdc.gsfc.nasa.gov/planetary/factsheet/earthfact.html | Earth sunlight for the 43% ratio |
| NASA first MEDA weather report | https://www.nasa.gov/directorates/stmd/nasas-first-weather-report-from-jezero-crater-on-mars/ | Jezero pressure, temperatures, gust |
| NASA JPL MEDA preview | https://www.jpl.nasa.gov/news/mars-is-getting-a-new-robotic-meteorologist/ | Modelled night/afternoon temperatures |
| Nature Geoscience MEDA abstract | https://link.springer.com/article/10.1038/s41561-022-01084-0 | Jezero coordinates, landing date |
| Phys.org (Nature Geoscience press release) | https://phys.org/news/2023-01-rich-meteorology-mars-perseverance-rover.pdf | Season-average air temperature -55 C (secondary) |
| MEDA pressure dataset record (JGR 2024) | https://fmi.b2share.csc.fi/records/axmwh-rjx51 | Daily pressure swing 2-5% |
| SwRI Dec 2013 release (via Phys.org / Meteorite-list / SwRI) | https://phys.org/news/2013-12-scientists-publish-surface-mars.amp , https://pairlist2.pair.net/pipermail/meteorite-list/2013-December/095655.html , https://swri.org/node/9079 | 0.67 and 1.8 mSv/day, 0.66 Sv transit, 1 Sv mission, cancer-risk context |
| SwRI Sept 2017 release | https://www.swri.org/newsroom/press-releases/large-solar-storm-sparks-global-aurora-doubles-radiation-levels-mars | Storm more than doubled dose, lasted over 2 days |
| Zeitlin et al. 2018 (GRL) | https://eld.bl.uk/catalog/100084451995_0x000001 | Factor 2-3 rise, ~15% shock drop |
| Hassler et al. 2018 (Space Weather) | https://eld.bl.uk/catalog/100075398968_0x000001 | Integrated dose only slightly higher |
| MOXIE | https://www.nasa.gov/missions/mars-2020-perseverance/perseverance-rover/nasas-oxygen-generating-experiment-moxie-completes-mars-mission/ | 122 g, 12 g/h, 98% purity |
| ISS water recovery | https://www.nasa.gov/missions/station/iss-research/nasa-achieves-water-recovery-milestone-on-international-space-station/ | 98% (was 93-94%) |
| Opportunity | https://science.nasa.gov/mission/mer-opportunity/ , https://www.jpl.nasa.gov/edu/resources/teachable-moment/mars-rover-mission-comes-to-an-end-but-science-legacy-live-on/ | Last contact 2018-06-10, tau 10.8 vs 0.5 |
| InSight | https://www.jpl.nasa.gov/news/nasas-insight-still-hunting-marsquakes-as-power-levels-diminish/ , https://www.nasa.gov/missions/insight/nasa-retires-insight-mars-lander-mission-after-years-of-science/ , https://science.nasa.gov/blogs/insight/2022/12/ | 5,000 to ~500 to 285 Wh/sol, end 2022-12-21 |
| Ingenuity | https://www.nasa.gov/news-release/after-three-years-on-mars-nasas-ingenuity-helicopter-mission-ends/ | 72 flights vs 5 planned |
| Solar conjunction 2026 | https://science.nasa.gov/blogs/maven/2025/12/23/nasa-works-maven-spacecraft-issue-ahead-of-solar-conjunction/ , https://science.nasa.gov/blog/curiosity-blog-sols-4750-4762-see-you-on-the-other-side-of-the-sun/ | 2025-12-29 to 2026-01-16 (NASA); 2025-12-27 to 2026-01-20 (Curiosity blog) |
| CSA food page (modified 2026-07-24) | https://www.asc-csa.gc.ca/eng/sciences/food-production/growing-healthy-food-in-space-and-remote-areas.asp | Resupply, 1,900-3,200 kcal/day |
| CSA Interplanetary Farming PDF (undated) | https://www.asc-csa.gc.ca/pdf/eng/youth-educators/activities/fitness-and-nutrition/interplanetary-farming.pdf | Crop growth times, shielded greenhouse |
| OSDR OSD-342 (record on data.gov) | https://catalog.data.gov/dataset/targeting-myostatin-activin-a-protects-against-skeletal-muscle-and-bone-loss-during-spacef | Mouse bone and muscle loss, 33 days |
| OSDR OSD-684 (record on data.gov) | https://catalog.data.gov/dataset/human-skeletal-muscle-tissue-chip-autonomous-payload-reveals-changes-in-fiber-type-and-met | Human muscle tissue chip on ISS |
| JAXA Cell-Free Epigenome, OSD-530 | https://pmc.ncbi.nlm.nih.gov/articles/PMC11166646 | Six astronauts, 120+ days |
| Inspiration4 in OSDR | https://www.nasa.gov/osdr-latest-news-i4-mission-datasets/ , https://pmc.ncbi.nlm.nih.gov/articles/PMC11094041 | 590 km orbit, OSD-569/570/571/575 |
| Barger et al. 2014 (Lancet Neurology) | https://pmc.ncbi.nlm.nih.gov/articles/PMC4188436 | ISS astronaut sleep 6.09 h |

## Could not fetch, and what I used instead

1. **ISS dose rate for a recent typical day and storm day.** RadLab has no 2025-26 data, and only the ALTEA-Survey instrument has dose equivalent. **Used:** ALTEA-Survey, storm 2012-03-07 and typical 2012-03-15. The "typical" day is ordinary, not perfectly calm (DONKI lists an M7.9 flare on 2012-03-13). The storm day has 1252 of 1440 minutes (about 87%) of readings, so its daily mean is from partial coverage.
2. **Jezero surface radiation.** No dosimeter has measured the dose at Jezero. **Used:** Curiosity RAD at Gale crater, about 3,700 km away. `mars.radiation.noJezeroDosimeter` says so; the game should say "about" for Jezero.
3. **The 0.67 mSv/day figure.** I could not open the Science paper (Hassler et al. 2014; the page blocked fetching). **Used:** the SwRI press-release text (reprinted by Phys.org). I did not check whether the paper's own abstract gives a slightly different number, so treat 0.67 as "press release value".
4. **Astronaut-only OSDR findings.** Almost all OSDR studies use mice, plants or cells; the astronaut ones are mainly omics (blood/gene data). I found no OSDR astronaut study on sleep, bone loss or muscle. **Used:** two mouse/cell studies for bone and muscle (OSD-342, OSD-684, labelled by subject), two astronaut datasets (OSD-530, Inspiration4), and **one non-OSDR sleep finding** (Barger et al. 2014), flagged in the file. The Inspiration4 entry says what was measured, not a result.
5. **OSDR study pages.** They load with JavaScript, so I could not read them directly. OSD-342 and OSD-684 were confirmed through their data.gov catalogue records (OSD-684 via the DOI redirect); OSD-530 from the SOMA portal and the paper; OSD-569/570/571/575 from the npj Microgravity paper. Open each link once before the demo.
6. **Light-time list.** I stored every 10th day (37 values, one decimal), not all 366. The Horizons URL in each entry regenerates the full list.
7. **DONKI old routes.** I did not test `api.nasa.gov/DONKI` myself; the 2026-09-30 retirement comes from NASA's CCMC announcement and developer reports.
8. **Shell network.** The workspace shell blocks these sites, so all fetching went through the browser and web tools.
9. **Season-average Jezero air temperature (-55 C)** comes from a press release about the paper, not the paper (marked secondary in the file).

## Spec numbers that disagree with real data

- **Forbush dip:** real drop was about 15% (Sept 2017). SPEC says -30% for 2 sols [T].
- **Storm hit:** the real Sept 2017 storm raised the dose RATE 2-3 times for over 2 days, but the total dose barely changed. SPEC's -4 mSv hit is exaggerated [T]; tell kids so in the debrief.
- **ISS vs Mars:** ISS typical day is 0.753 mSv/day vs 0.67 mSv/day on the Mars surface, so Mars is not "worse than ISS" on a normal day; the extra risk is the long trip and storms.
- **Solar conjunction dates:** NASA gives 2025-12-29 to 2026-01-16, the Curiosity blog 2025-12-27 to 2026-01-20. The file keeps both.

## Not real data (do not label as real)

Life Support -5% per sol, 30 kWh solar, card costs, and similar tuned values are [T] in SPEC.md and were not fetched.
