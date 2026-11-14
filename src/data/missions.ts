import { Mission } from '../types/game';

export const MISSIONS: Mission[] = [
  // ==========================================
  // MISSION 01: THE FIRST FOOTPRINT
  // ==========================================
  {
    id: 'mission-01',
    number: 1,
    code: 'M-01',
    title: 'The First Footprint',
    subtitle: 'Outpost Construction & Site Foundation',
    objective: 'Touch down on the landing zone and establish a survivable, pressurized habitat with core survival loops.',
    learningGoal: 'Building an outpost requires prioritizing essential survival systems over luxuries and balancing mass, volume, and protection.',
    durationSols: 14,
    environmentCondition: 'Surface landing complete. Ambient temperature: -130°C to +120°C. Background cosmic radiation detected.',
    badgeId: 'badge-first-footprint',
    badgeTitle: 'Pioneer Architect',
    badgeDescription: 'Successfully established the outpost foundation and balanced primary survival infrastructure.',
    potentialEvents: [
      {
        id: 'event-regolith-abrasion',
        title: 'Sharp Regolith Dust Infiltration',
        description: 'Microscopic electrostatically charged dust grains stuck to airlock joints during EVA.',
        severity: 'minor',
        resourceImpact: { lifeSupport: -5, protection: -5 },
        explanation: 'Lunar and Martian dust grains are not smoothed by water or wind. They stick like burrs to seals.',
        nasaRealWorldCase: 'Apollo 17 astronaut Gene Cernan reported lunar dust degraded rover joints and suit seals.'
      }
    ],
    challenges: [
      {
        id: 'm1-c1-habitat-config',
        order: 1,
        category: 'habitat',
        title: 'Challenge 1: Habitat Architecture Choice',
        situation: 'The heavy lander has touched down safely. You must select which structural architecture to deploy as your central crew quarters.',
        contextFact: 'Every kilogram launched into space costs thousands of dollars in rocket fuel. Heavy shielding protects better, but takes payload space away from food and water.',
        visualState: 'nominal',
        hint: 'Inflatable modules give massive living volume for low launch mass, but require external regolith burial for radiation shielding.',
        choices: [
          {
            id: 'm1-c1-opt-inflatable',
            title: 'Expandable Inflatable TransHab with Regolith Berm',
            tagline: 'Lightweight launch mass, maximum crew volume, requires rover dirt burial.',
            description: 'Deploy a multi-layer kevlar inflatable dome, then command autonomous robotic rovers to pile a 1.5-meter blanket of local regolith dirt over it.',
            benefits: ['+15% Life Support volume', '+10% Science lab space', 'Safe radiation thermal mass'],
            costs: ['Requires 20% Power allocation for rover sintering', 'Takes 48 hours to fully bury'],
            resourceDeltas: { lifeSupport: 15, power: -15, protection: 10, food: 0, science: 10 },
            feedbackText: 'Dome inflated perfectly! Rovers began piling regolith. Living space is spacious, though battery reserves took an initial hit.',
            scientificExplanation: 'Kevlar and Vectran fabrics pack tight for launch and inflate to huge volume. Adding local regolith (In-Situ Resource Utilization) provides radiation shielding without launching heavy concrete from Earth.',
            nasaFact: 'NASA tested the TransHab concept on the ISS with the Bigelow Expandable Activity Module (BEAM), which has performed flawlessly for over 7 years in orbit!',
            nasaSource: 'NASA ISS BEAM Technology Demonstration'
          },
          {
            id: 'm1-c1-opt-rigid',
            title: 'Pre-fabricated Metallic Titanium Modules',
            tagline: 'Instant turnkey pressurized bunker, heavy launch mass, compact interior.',
            description: 'Land rigid welded titanium-aluminum cylinders ready for immediate crew occupancy with built-in storm shielding.',
            benefits: ['Instant 100% airtight seal', '+20% Protection immediately', 'Zero rover assembly needed'],
            costs: ['Very heavy mass restricts scientific gear (-15% Science)', 'Cramped quarters limit food storage'],
            resourceDeltas: { lifeSupport: 10, power: -5, protection: 20, food: -5, science: -15 },
            feedbackText: 'The rigid bunker locked into place within minutes. Astronauts are safe from radiation, though storage room is noticeably tight.',
            scientificExplanation: 'Rigid metallic modules offer structural certainty and micrometeorite armor, but payload volume limits mean leaving some scientific instruments behind.',
            nasaFact: 'The Apollo Lunar Module and Artemis Human Landing System both leverage aerospace aluminum-lithium alloys for high strength-to-weight ratios.',
            nasaSource: 'NASA Artemis Lunar Architecture whitepaper'
          },
          {
            id: 'm1-c1-opt-lava-tube',
            title: 'Subterranean Lava Tube Cavern Shelter',
            tagline: 'Natural rock vault, absolute radiation immunity, difficult access.',
            description: 'Anchor the habitat inside a naturally carved underground volcanic lava tube cave.',
            benefits: ['+25% Protection from natural 10-meter basalt ceiling', 'Stable -20°C temperature year-round'],
            costs: ['Elevators and crane rigging drain -20% Power', 'No direct rooftop solar sunlight'],
            resourceDeltas: { lifeSupport: 5, power: -20, protection: 25, food: 0, science: 5 },
            feedbackText: 'Outpost anchored in the cavern. Radiation levels dropped to zero, but running power cables up to surface solar arrays requires vigilance.',
            scientificExplanation: 'Ancient lava tubes on the Moon and Mars are hundreds of meters wide. Their thick basalt roofs block 100% of cosmic rays, micrometeorites, and extreme surface temperature swings.',
            nasaFact: 'NASA’s Lunar Reconnaissance Orbiter (LRO) radar found hundreds of skylight pits leading to stable underground caves on the Moon.',
            nasaSource: 'NASA LRO Diviner & Mini-RF radar findings'
          }
        ]
      },
      {
        id: 'm1-c2-power-allocation',
        order: 2,
        category: 'power',
        title: 'Challenge 2: Primary Energy Grid Setup',
        situation: 'The habitat structure is upright! Now you must power the environmental life support, heaters, lighting, and communication radios.',
        contextFact: 'The Moon experiences a 14-day night, while Mars experiences frequent dust haze that cuts sunlight by up to 70%. Power must never run dry.',
        visualState: 'nominal',
        hint: 'Nuclear Kilopower is immune to night and dust, but solar arrays with regenerative fuel cells are lighter and modular.',
        choices: [
          {
            id: 'm1-c2-opt-kilopower',
            title: 'Deploy Compact Fission Reactor (Kilopower KRUSTY)',
            tagline: 'Steady 10 kW continuous power 24/7, requires remote standoff exclusion zone.',
            description: 'Unpack a small Stirling-engine nuclear fission reactor and place it 500 meters away behind a protective regolith berm.',
            benefits: ['+25% Continuous Power day and night', 'Immune to dust storms and darkness', 'Enables heavy science drills'],
            costs: ['High setup effort drains initial life support crew time (-10% Life Support)'],
            resourceDeltas: { lifeSupport: -10, power: 25, protection: 5, food: 0, science: 10 },
            feedbackText: 'Kilopower reactor hums to life! Base power grid is rock solid, unaffected by day or night.',
            scientificExplanation: 'NASA’s Kilopower project uses a small solid-cast U-235 uranium core and sodium heat pipes connected to Stirling engines to produce electricity continuously for 10+ years without refueling.',
            nasaFact: 'NASA Glenn Research Center successfully proved the Kilopower KRUSTY reactor in full-power testing in the Nevada desert.',
            nasaSource: 'NASA Kilopower Reactor Using Stirling Technology (KRUSTY)'
          },
          {
            id: 'm1-c2-opt-solar-storage',
            title: 'High-Efficiency Solar Photovoltaic Arrays + Regenerative Fuel Cells',
            tagline: 'Zero radioactive materials, clean renewable energy, requires massive night batteries.',
            description: 'Unfurl lightweight flexible solar arrays on the crater rim and install hydrogen-oxygen fuel cell tanks to store daytime energy.',
            benefits: ['+15% Power during daylight', 'Water byproducts help life support (+10% Life Support)', 'Safe crew maintenance'],
            costs: ['Vulnerable to dust buildup (-10% Power during storms)', 'Limited nighttime surplus'],
            resourceDeltas: { lifeSupport: 10, power: 10, protection: 0, food: 0, science: 5 },
            feedbackText: 'Solar wings unrolled! Fuel cells are producing clean water as they store night power.',
            scientificExplanation: 'During the day, solar panels split water into hydrogen and oxygen via electrolysis. At night, fuel cells recombine them into pure drinking water while generating electricity!',
            nasaFact: 'Apollo spacecraft and the Space Shuttle used hydrogen-oxygen fuel cells as both their main electricity source and drinking water supply.',
            nasaSource: 'NASA Space Shuttle Life Support History'
          }
        ]
      },
      {
        id: 'm1-c3-eclss-baseline',
        order: 3,
        category: 'eclss',
        title: 'Challenge 3: Oxygen & Water Loop Initialization',
        situation: 'The base pressure hull is pressurized with nitrogen/oxygen at 101.3 kPa. You must configure the Environmental Control and Life Support System (ECLSS).',
        contextFact: 'Humans consume roughly 0.84 kg of oxygen and 2.5 liters of drinking water per day, exhaling 1.0 kg of carbon dioxide.',
        visualState: 'nominal',
        hint: 'A closed-loop Sabatier reactor recycles water from exhaled breath, but consumes more electricity than simple replaceable chemical canisters.',
        choices: [
          {
            id: 'm1-c3-opt-closed-loop',
            title: 'Full Closed-Loop Sabatier & Electrolysis Assembly',
            tagline: 'Recycles 98% of water and recovers oxygen from exhaled CO2, high power draw.',
            description: 'Hook up the Sabatier carbon dioxide reduction reactor with catalytic water processors and oxygen generation electrolysis cells.',
            benefits: ['+25% Life Support independence', '+10% Water reserves for hydroponics', 'Long-term self-sufficiency'],
            costs: ['Draws significant continuous power (-15% Power)'],
            resourceDeltas: { lifeSupport: 25, power: -15, protection: 0, food: 5, science: 0 },
            feedbackText: 'Sabatier reactor online! Exhaled carbon dioxide is now reacting with hydrogen to create fresh water and oxygen.',
            scientificExplanation: 'The Sabatier reaction: CO2 + 4H2 -> CH4 + 2H2O at 400°C over a nickel catalyst. The water is then split into breathable oxygen and hydrogen gas, closing the human life-support loop.',
            nasaFact: 'NASA’s Environmental Control and Life Support System (ECLSS) on the ISS achieved a historic 98% water recovery milestone in 2023!',
            nasaSource: 'NASA ISS Exploration ECLSS Milestone Report'
          },
          {
            id: 'm1-c3-opt-open-tanks',
            title: 'Consumable Cryogenic Storage & Lithium Hydroxide Canisters',
            tagline: 'Simple, ultra-low power consumption, depletes stored consumable inventory.',
            description: 'Run basic fans through chemical LiOH carbon scrubber canisters and vent waste gas, relying on pressurized liquid oxygen tanks.',
            benefits: ['Draws minimal power (+10% Power saved)', 'No complex pumps to calibrate'],
            costs: ['Consumables expire quickly (-15% Life Support buffer)'],
            resourceDeltas: { lifeSupport: -10, power: 10, protection: 0, food: 0, science: -5 },
            feedbackText: 'Simple scrubbers engaged. Power draw is low, but the clock is ticking on consumable canister inventory.',
            scientificExplanation: 'Open-loop systems are mechanically simple and fail-safe for short missions (like Apollo), but impossible for permanent outposts because supply rockets cannot deliver thousands of heavy canisters.',
            nasaFact: 'Apollo 13 famously had to build a makeshift adapter ("the mailbox") to fit square command module LiOH canisters into the lunar module round sockets.',
            nasaSource: 'NASA Apollo 13 Mission Transcript'
          }
        ]
      },
      {
        id: 'm1-c4-construction-balance',
        order: 4,
        category: 'protection',
        title: 'Challenge 4: Outpost Micrometeorite & Perimeter Defense',
        situation: 'Radar sensors report high micrometeorite flux in your orbital corridor. You need to reinforce exterior airlocks and the communication tower.',
        contextFact: 'Without a thick atmosphere like Earth’s to burn up space pebbles, micrometeorites hit the lunar and Martian surface at speeds up to 20 kilometers per second (45,000 mph)!',
        visualState: 'warning',
        hint: 'Automated 3D microwave sintering rovers fuse regolith into rock shields without tiring out the crew.',
        choices: [
          {
            id: 'm1-c4-opt-rover-sintering',
            title: 'Robotic 3D Regolith Microwave Sintering',
            tagline: 'Autonomous rovers melt dirt into ceramic tiles, burns battery power.',
            description: 'Deploy solar-powered robotic rovers that use microwave heat beams to melt local regolith into solid blast walls and shields.',
            benefits: ['+20% Protection integrity', 'Zero crew EVA fatigue or spacesuit wear'],
            costs: ['Consumes -10% Power reserve during construction'],
            resourceDeltas: { lifeSupport: 5, power: -10, protection: 20, food: 0, science: 5 },
            feedbackText: 'Rovers sintered a durable ceramic blast wall around habitat airlocks. Micrometeorite radar warnings neutralized.',
            scientificExplanation: 'Lunar regolith contains abundant nanophase iron and silicates. When hit with 2.45 GHz microwaves, it melts in minutes into hard, high-density ceramic armor stronger than concrete.',
            nasaFact: 'NASA’s Lunar Surface Innovation Initiative (LSII) funds automated 3D printing and sintering rovers for the Artemis Moon base.',
            nasaSource: 'NASA Marshall Space Flight Center Lunar Construction Lab'
          },
          {
            id: 'm1-c4-opt-eva-astronauts',
            title: 'Crew EVA Sandbagging & Whipple Shield Rigging',
            tagline: 'Saves base battery power, puts human astronauts at risk on the surface.',
            description: 'Send two astronauts outside on a grueling 6-hour spacewalk to manually shovel regolith bags over airlock hatches and install aluminum Whipple bumper plates.',
            benefits: ['Preserves power grid (+5% Power available)'],
            costs: ['Tires out crew (-15% Food & physical stamina)', 'Risk of spacesuit abrasion (-10% Life Support)'],
            resourceDeltas: { lifeSupport: -10, power: 5, protection: 15, food: -10, science: 0 },
            feedbackText: 'Crew completed the EVA safely and erected Whipple bumpers, but their spacesuits suffered fine dust abrasion and morale is exhausted.',
            scientificExplanation: 'Spacewalks (EVAs) are among the most dangerous space activities. Astronauts burn up to 500 calories per hour fighting stiff suit pressure, and sharp regolith degrades gloves and bearings.',
            nasaFact: 'Spacesuits maintain ~4.3 psi of pure oxygen, making joints feel like stiff basketballs that astronauts must continuously squeeze.',
            nasaSource: 'NASA Extravehicular Activity (EVA) Physiology Guide'
          }
        ]
      }
    ]
  },

  // ==========================================
  // MISSION 02: THE LAST OXYGEN
  // ==========================================
  {
    id: 'mission-02',
    number: 2,
    code: 'M-02',
    title: 'The Last Oxygen',
    subtitle: 'Emergency Oxygen Depletion & ECLSS Cascade',
    objective: 'Survive an emergency oxygen leak, scrubber saturation, and life-support cascade failure while keeping the crew alive.',
    learningGoal: 'Life-support systems are tightly interconnected: a problem in water recycling quickly impacts oxygen generation and electrical cooling.',
    durationSols: 30,
    environmentCondition: 'Extreme diurnal thermal cycle (-180°C to +110°C). Secondary loop coolant sensors showing pressure fluctuations.',
    badgeId: 'badge-eclss-hero',
    badgeTitle: 'Master Systems Engineer',
    badgeDescription: 'Solved interconnected life-support failures through systematic diagnostic trade-offs.',
    potentialEvents: [
      {
        id: 'event-pump-calcification',
        title: 'Urine Processor Assembly (UPA) Distillation Clog',
        description: 'Calcium sulfate mineral crystals precipitated inside the rotary distillation centrifuge.',
        severity: 'moderate',
        resourceImpact: { lifeSupport: -10, power: -5 },
        explanation: 'In microgravity and low gravity, human bones lose calcium, which concentrates in urine and forms hard gypsum crystals in distillation loops.',
        nasaRealWorldCase: 'On the ISS, NASA chemist-engineers had to reformulate chemical pre-treatments (chromium acid to phosphoric acid) to prevent UPA distillation clogs.'
      }
    ],
    challenges: [
      {
        id: 'm2-c1-water-recycler',
        order: 1,
        category: 'eclss',
        title: 'Challenge 1: Water Recovery Filtration Emergency',
        situation: 'The main catalytic water oxidizer sensor reports mineral buildup. Flow rate to the oxygen electrolysis generator has dropped by 45%.',
        contextFact: 'If water doesn’t flow to the Oxygen Generation System (OGS), oxygen production stops automatically to prevent dry electrode burnouts.',
        visualState: 'warning',
        hint: 'Flushing the line with concentrated acid cleaning wash uses toxic reserves, while thermal baking burns huge electricity.',
        choices: [
          {
            id: 'm2-c1-opt-thermal-flush',
            title: 'High-Temperature Thermal Desorption & Steam Blowdown',
            tagline: 'Clears lines completely using heat, drains severe electrical reserves.',
            description: 'Route emergency heating elements through the filtration pipes to vaporize mineral scale into exhaust traps without risking water contamination.',
            benefits: ['+20% Life Support restored to peak efficiency', '100% clean drinking water guaranteed'],
            costs: ['Drains -20% Power grid during the 8-hour bakeout cycle'],
            resourceDeltas: { lifeSupport: 20, power: -20, protection: 0, food: 0, science: 5 },
            feedbackText: 'Steam blowdown completed! Mineral scale cleared. Water flow to the oxygen generator is back at 100%, but batteries took a heavy hit.',
            scientificExplanation: 'High-temperature catalytic oxidation oxidizes organic contaminants and loosens scale into trap beds, restoring membrane permeability through thermal expansion.',
            nasaFact: 'NASA’s Catalytic Oxidizer on the ISS operates at 125°C (257°F) and 45 psi to pasteurize wastewater before final filtration.',
            nasaSource: 'NASA Marshall Water Recovery System Design'
          },
          {
            id: 'm2-c1-opt-bypass-filter',
            title: 'Emergency Filter Cartridge Bypass & Rationing',
            tagline: 'Conserves power, requires switching to emergency stored reserve tanks.',
            description: 'Bypass the clogged unit and feed the oxygen generator directly from precious emergency water bladder reserves while cleaning the filter manually.',
            benefits: ['Preserves electrical power (+5% Power)'],
            costs: ['Depletes -15% Life Support water reserve cushion', 'Crew must ration drinking water'],
            resourceDeltas: { lifeSupport: -10, power: 5, protection: 0, food: -5, science: 0 },
            feedbackText: 'Switched to reserve bladders. Power grid stayed relaxed, but reserve water levels are uncomfortably lean.',
            scientificExplanation: 'Switching to backup bladders prevents pump burnout, but eating into your non-renewable buffer leaves the base vulnerable to any subsequent leaks.',
            nasaFact: 'Astronauts on the ISS keep several 45-liter Contingency Water Containers (CWCs) in reserve for emergencies.',
            nasaSource: 'NASA ISS Flight Operations Water Inventory'
          }
        ]
      },
      {
        id: 'm2-c2-co2-scrubber-glitch',
        order: 2,
        category: 'eclss',
        title: 'Challenge 2: Carbon Dioxide Scrubber Saturation',
        situation: 'The Carbon Dioxide Removal Assembly (CDRA) desiccant bed is stuck in adsorption mode. Cabin CO2 levels are climbing from 3.0 mmHg to 5.5 mmHg.',
        contextFact: 'Even mild CO2 buildup causes headaches, confusion, and impaired decision-making in astronauts—a dangerous hazard when operating spacecraft.',
        visualState: 'warning',
        hint: 'Amine swing-bed scrubbers vent directly to space vacuum with zero power, but lose a tiny amount of cabin air pressure.',
        choices: [
          {
            id: 'm2-c2-opt-vacuum-swing',
            title: 'Engage Thermal Amine Vacuum-Swing Desorption',
            tagline: 'Uses the hard vacuum of space to flush CO2, vents a microscopic fraction of gas.',
            description: 'Expose the saturated amine resin beads directly to the vacuum of space through an external vent valve. Vacuum pulls the CO2 molecules off instantly.',
            benefits: ['Rapidly drops cabin CO2 to 1.5 mmHg (+15% Crew Health/Life Support)', 'Zero electrical heating needed'],
            costs: ['Vents tiny trace air mass (-5% Cabin Pressure buffer)'],
            resourceDeltas: { lifeSupport: 15, power: 5, protection: 0, food: 0, science: 0 },
            feedbackText: 'Vacuum-swing cycle complete! Astronauts report headaches vanished immediately. Air telemetry is crisp and clean.',
            scientificExplanation: 'Amine molecules chemically bind to CO2 at room pressure, but release it freely when exposed to a vacuum. By using space vacuum itself as a pump, engineers save kilowatts of power!',
            nasaFact: 'NASA’s Thermal Amine System (TAS) on the ISS tested this exact vacuum-swing regeneration technique, proving more reliable than mechanical zeolite beds.',
            nasaSource: 'NASA Advanced Exploration Systems Life Support'
          },
          {
            id: 'm2-c2-opt-crew-exercise-pause',
            title: 'Halt High-Intensity Crew Treadmill Exercises & Throttle Fan Speeds',
            tagline: 'Reduces human CO2 production at the source, avoids venting any cabin gas.',
            description: 'Order astronauts to sit resting in their sleep quarters and cancel scheduled aerobic treadmill sessions to cut crew CO2 respiration in half.',
            benefits: ['Conserves 100% of cabin air mass', 'Saves +5% Power'],
            costs: ['Canceling exercise risks muscle atrophy and drops crew stamina (-15% Food & Morale)'],
            resourceDeltas: { lifeSupport: 5, power: 5, protection: 0, food: -15, science: -5 },
            feedbackText: 'Crew grounded to quarters. CO2 levels leveled off, but astronauts are frustrated and losing conditioning.',
            scientificExplanation: 'A human at intense exercise produces 4 times more carbon dioxide per minute than at rest. However, in low gravity, daily exercise is mandatory to prevent heart and bone mass loss.',
            nasaFact: 'NASA astronauts must exercise 2.5 hours every day in space to prevent losing up to 1% to 2% of bone mineral density per month.',
            nasaSource: 'NASA Human Research Program (HRP) Exercise Countermeasures'
          }
        ]
      },
      {
        id: 'm2-c3-airlock-seal-failure',
        order: 3,
        category: 'emergency',
        title: 'Challenge 3: Airlock Outer Hatch Seal Micro-Puncture',
        situation: 'An audible hiss and pressure gauge drop indicates a high-speed micrometeoroid grazed the outer airlock silicone seal. Cabin pressure is leaking at 0.4 kPa per minute.',
        contextFact: 'Standard base pressure is 101.3 kPa (1 atmosphere). If pressure drops below 60 kPa, astronauts must put on pressurized spacesuits or risk hypoxia.',
        visualState: 'critical',
        hint: 'Quick-curing expandable polymer foam seals leaks in seconds, but hardens permanently and requires replacing the hatch later.',
        choices: [
          {
            id: 'm2-c3-opt-aerospace-patch',
            title: 'Deploy Quick-Curing Polyurethane Sealant & Magnetic Patch Plate',
            tagline: 'Instant seal, saves cabin air, consumes engineering spares.',
            description: 'Apply an aerospace elastomeric sealing compound over the puncture and clamp a magnetic aluminum patch plate over the airlock breach.',
            benefits: ['Pressure loss stopped within 3 minutes (+15% Life Support)', 'Restores full seal integrity (+10% Protection)'],
            costs: ['Consumes valuable specialized structural repair spares (-10% Science kit)'],
            resourceDeltas: { lifeSupport: 15, power: 0, protection: 10, food: 0, science: -10 },
            feedbackText: 'Patch sealed tight! Cabin pressure stabilized at 101.1 kPa. Emergency alarm silenced.',
            scientificExplanation: 'Fast-curing space sealants use anaerobic chemical reactions that don’t require atmospheric moisture to polymerize into tough rubberized seals.',
            nasaFact: 'When the Russian Mir space station suffered a leak in 1997, cosmonauts and astronauts used special sealing paste and clamps to save the station.',
            nasaSource: 'NASA Mir-Shuttle Program Incident Archive'
          },
          {
            id: 'm2-c3-opt-isolate-module',
            title: 'Emergency Bulkhead Hatch Isolation',
            tagline: 'Zero repair material cost, completely seals off the airlock module.',
            description: 'Slam and lock the internal titanium pressure bulkhead hatch, abandoning the outer airlock until a full scheduled EVA repair can be organized.',
            benefits: ['Preserves remaining cabin atmosphere', 'Costs zero repair resources'],
            costs: ['Airlock unusable for surface science expeditions (-15% Science)', 'Reduces accessible habitat volume (-5% Life Support)'],
            resourceDeltas: { lifeSupport: -5, power: 0, protection: 5, food: 0, science: -15 },
            feedbackText: 'Bulkhead sealed! The main living habitat is secure, but all outdoor science excursions are halted until the airlock is depressurized and rebuilt.',
            scientificExplanation: 'Subdividing habitats into compartmentalized pressure cells with quick-closing bulkheads prevents an entire outpost from depressurizing if one room is breached.',
            nasaFact: 'The ISS is divided into distinct airtight modules that can be individually isolated within seconds in case of a hull breach.',
            nasaSource: 'NASA ISS Emergency Response Procedures'
          }
        ]
      },
      {
        id: 'm2-c4-thermal-overload',
        order: 4,
        category: 'power',
        title: 'Challenge 4: Radiator Heat Exchanger Boil-Off',
        situation: 'The outpost is directly under peak noon solar radiation (+120°C). The ammonia cooling loop heat exchanger is running hot and threatening to overheat main computers.',
        contextFact: 'In space, there is no air to cool equipment down with breeze. Heat can only be dumped into the cold of space by radiating infrared light through giant reflective panels.',
        visualState: 'alert',
        hint: 'Tilting the radiators into the habitat’s shadow cools them instantly, but requires repointing communication dishes.',
        choices: [
          {
            id: 'm2-c4-opt-shadow-orient',
            title: 'Reposition Articulated Radiators into Habitat Shadow',
            tagline: 'Cools electronics rapidly, requires motorized rotation and antenna throttling.',
            description: 'Actuate the radiator gimbals to edge-on solar angle behind the habitat’s regolith shield so the panels see deep cold black space (3 Kelvin).',
            benefits: ['Electronics cooled immediately (+15% Power efficiency)', 'Extends equipment lifespan (+10% Life Support)'],
            costs: ['Motor rotation draws -10% Power temporarily', 'Interrupts real-time science telemetry (-5% Science)'],
            resourceDeltas: { lifeSupport: 10, power: 5, protection: 5, food: 0, science: -5 },
            feedbackText: 'Radiators rotated into shadow! Coolant temperatures plunged from 75°C back to nominal 18°C. Computers running at peak speed.',
            scientificExplanation: 'Radiative heat transfer follows the Stefan-Boltzmann law: heat radiated is proportional to T^4. Pointing radiators at empty 3K cosmic space creates a massive thermal dumping gradient.',
            nasaFact: 'The ISS uses huge 73-foot-long rotating radiator panels filled with liquid ammonia to vent the electrical heat generated by astronauts and experiments.',
            nasaSource: 'NASA Glenn Thermal Control Systems for Moon and Mars'
          },
          {
            id: 'm2-c4-opt-evaporative-water-vent',
            title: 'Flash Water Evaporative Sublimator Cooling',
            tagline: 'Instant ice sublimator blast, vents valuable clean water into space.',
            description: 'Spray a fine mist of recycled water across an exterior porous metal plate exposed to vacuum. As the water flashes to ice and sublimes, it pulls huge heat away.',
            benefits: ['Drops temperatures instantly within 60 seconds', 'Zero motor power used (+5% Power)'],
            costs: ['Permanently consumes -15% Life Support water reserve'],
            resourceDeltas: { lifeSupport: -15, power: 5, protection: 0, food: 0, science: 5 },
            feedbackText: 'Sublimator vented a burst of steam. Thermal crisis resolved in seconds, but 80 liters of precious water vaporized forever.',
            scientificExplanation: 'Sublimation (solid ice turning directly into vapor under vacuum) absorbs massive latent heat (2,834 kJ/kg), making it the most powerful emergency heat sink in aerospace.',
            nasaFact: 'Spacesuits worn by moonwalkers use water sublimators—astronauts can actually see tiny ice flakes puffing out as their suits keep them cool!',
            nasaSource: 'NASA Apollo & EMU Spacesuit Technical Manual'
          }
        ]
      }
    ]
  },

  // ==========================================
  // MISSION 03: RED FRONTIER
  // ==========================================
  {
    id: 'mission-03',
    number: 3,
    code: 'M-03',
    title: 'Red Frontier',
    subtitle: 'Space Weather Defense & Radiation Risk Mitigation',
    objective: 'Interpret authentic NASA space weather warning signals, retreat crew into storm shelters, and shield critical avionics.',
    learningGoal: 'Radiation protection involves balancing probabilistic risk assessment against concrete operational delays and resource costs.',
    durationSols: 5,
    environmentCondition: 'NASA SOHO/GOES detected an X5.8 solar flare and 1,450 km/s Coronal Mass Ejection heading directly toward your quadrant.',
    badgeId: 'badge-solar-guardian',
    badgeTitle: 'Solar Guardian',
    badgeDescription: 'Safely guided the outpost through an extreme space radiation storm with zero radiation casualties.',
    potentialEvents: [
      {
        id: 'event-solar-proton-storm',
        title: 'Solar Energetic Particle (SEP) Wave Arrival',
        description: 'High-energy protons moving at near-light speed began impacting surface sensors.',
        severity: 'critical',
        resourceImpact: { protection: -15, power: -10 },
        explanation: 'While light from a solar flare arrives in 8 minutes, the most dangerous energetic protons arrive within 20 to 60 minutes.',
        nasaRealWorldCase: 'The historic August 1972 solar storm happened between Apollo 16 and Apollo 17; had astronauts been on the lunar surface, they would have absorbed lethal radiation doses.'
      }
    ],
    challenges: [
      {
        id: 'm3-c1-warning-interpretation',
        order: 1,
        category: 'emergency',
        title: 'Challenge 1: NASA Space Weather Warning Analysis',
        situation: 'Mission Control relays a high-priority alert from NASA DONKI: An X5.8 flare erupted on the Sun’s Earth/Moon-facing meridian with a fast coronal mass ejection (CME).',
        contextFact: 'Solar flares send blinding X-rays and ultraviolet light at the speed of light (8 minutes), followed by a massive cloud of billions of tons of magnetized plasma arriving in 24 to 36 hours.',
        visualState: 'storm',
        hint: 'Immediate retreat ensures 100% safety, while finishing current rover sample drilling risks astronaut radiation sickness.',
        choices: [
          {
            id: 'm3-c1-opt-immediate-retreat',
            title: 'Immediate Code Red: Recall Rover Crew to Central Storm Haven',
            tagline: 'Abandon ongoing science drilling immediately, prioritize astronaut biological safety.',
            description: 'Sound the base klaxon. Order the two astronauts currently 2 kilometers away on the rover to abort their science drilling and drive at maximum safe speed back to the shelter.',
            benefits: ['100% crew safety, zero radiation dose (+20% Protection)', 'Guarantees crew survival (+10% Life Support)'],
            costs: ['Valuable rover core sample left behind (-15% Science)', 'Drives rover battery to zero (-10% Power)'],
            resourceDeltas: { lifeSupport: 10, power: -10, protection: 20, food: 0, science: -15 },
            feedbackText: 'Crew rushed through the airlock with 18 minutes to spare before the proton flux spiked! Radiation dosimeters read zero.',
            scientificExplanation: 'High-Z energetic (HZE) solar particles damage DNA strands in human bone marrow and organs. Immediate retreat to heavily shielded shelters is NASA’s primary protocol.',
            nasaFact: 'NASA’s Space Radiation Analysis Group (SRAG) at Johnson Space Center monitors the Sun 24/7/365 to warn astronauts in space.',
            nasaSource: 'NASA Space Radiation Analysis Group (SRAG) Operational Rules'
          },
          {
            id: 'm3-c1-opt-calculated-delay',
            title: 'Calculated Risk: 25-Minute Rapid Sample Seal & Return',
            tagline: 'Lock the science sample canister before retreating, exposes crew to low proton dose.',
            description: 'Instruct the rover crew to rush the capping procedure on the deep ice core sample for 25 minutes before speeding back.',
            benefits: ['Secures high-value breakthrough planetary core sample (+25% Science)'],
            costs: ['Crew absorbs 25 mSv radiation dose (-15% Protection)', 'Requires medical detox rations (-5% Food)'],
            resourceDeltas: { lifeSupport: -5, power: -5, protection: -15, food: -5, science: 25 },
            feedbackText: 'Sample secured! The rover made it back just as the first energetic particles bombarded the hull. Crew dosimeters show elevated counts.',
            scientificExplanation: 'Career radiation limits for astronauts are strictly monitored by NASA (measured in Sieverts). While 25 mSv is below acute sickness, it counts toward lifetime cancer risk thresholds.',
            nasaFact: 'An average person on Earth absorbs ~3 mSv per year from background rocks and radon. An astronaut on Mars absorbs ~300 mSv per year without shielding.',
            nasaSource: 'NASA Human Research Program Radiation Bio-dosimetry'
          }
        ]
      },
      {
        id: 'm3-c2-shelter-reinforcement',
        order: 2,
        category: 'protection',
        title: 'Challenge 2: Storm Shelter Wall Reinforcement',
        situation: 'The crew is inside the storm haven, but space weather models predict the CME shock front will be 30% more intense than average. You need extra shielding mass.',
        contextFact: 'Hydrogen-rich materials (like water, polyethylene plastic, and food rations) are far better at stopping fast protons than heavy lead because light atoms don’t produce secondary neutron splatter.',
        visualState: 'storm',
        hint: 'Lining the storm shelter walls with water supply bladders and food boxes creates a thick hydrogen shield without spending extra metal.',
        choices: [
          {
            id: 'm3-c2-opt-water-wall',
            title: 'Configure Water Bladder & Food Supply Jacket Walls',
            tagline: 'Pack drinking water and food bricks along the shelter perimeter.',
            description: 'Stack stored greywater bladders and dehydrated food ration lockers directly against the inner walls of the sleep quarters.',
            benefits: ['Absorbs 85% of incoming cosmic rays (+25% Protection)', 'Zero electrical energy consumed (+5% Power)'],
            costs: ['Temporary disruption to automated water recycling loops (-10% Life Support efficiency)'],
            resourceDeltas: { lifeSupport: -5, power: 5, protection: 25, food: 0, science: 5 },
            feedbackText: 'Water wall completed! The hydrogen in H2O molecules acts as a wonderful bumper against incoming protons. Interior dosimeters read green.',
            scientificExplanation: 'Water (H2O) has two light hydrogen atoms per molecule. When a fast solar proton hits a hydrogen nucleus (also a proton), it transfers momentum like two billiard balls, stopping it cleanly.',
            nasaFact: 'NASA’s Orion spacecraft uses the crew’s food lockers and drinking water bags to build a radiation storm shelter inside the cabin during solar events.',
            nasaSource: 'NASA Orion Spacecraft Radiation Protection Design'
          },
          {
            id: 'm3-c2-opt-active-magnetic',
            title: 'Overdrive Active Superconducting Magnetic Deflector Coil',
            tagline: 'Electromagnetic shield deflects charged particles, consumes extreme electricity.',
            description: 'Channel high-voltage current into the exterior magnetic coils to bend charged protons away from the habitat just like Earth’s magnetosphere.',
            benefits: ['Deflects particles cleanly without moving any cargo (+15% Protection)', 'Habitat remains roomy'],
            costs: ['Massive electrical drain (-25% Power)', 'Thermal coils overheat (-5% Life Support)'],
            resourceDeltas: { lifeSupport: -5, power: -25, protection: 15, food: 0, science: 10 },
            feedbackText: 'Magnetic deflector powered on with an electric hum! Charged particles diverted around the habitat, though power gauges dropped dangerously.',
            scientificExplanation: 'Lorentz force (F = q * v x B) deflects moving charged particles perpendicular to magnetic field lines. However, generating multi-Tesla fields requires massive electrical power.',
            nasaFact: 'NASA NIAC (Innovative Advanced Concepts) studies active magnetic shielding concepts for deep-space Mars transit vehicles.',
            nasaSource: 'NASA NIAC Active Radiation Deflection Study'
          }
        ]
      },
      {
        id: 'm3-c3-avionics-hardening',
        order: 3,
        category: 'power',
        title: 'Challenge 3: Avionics & Solar Array Hardening',
        situation: 'The solar storm’s intense electromagnetic pulse (EMP) and ionizing flux threaten to fry unshielded computer chips and solar inverter microcontrollers.',
        contextFact: 'When high-energy ions pass through a computer microchip, they can flip bits from 0 to 1 (Single Event Upset) or cause destructive short circuits (latch-ups).',
        visualState: 'alert',
        hint: 'Putting solar panels into standby sleep mode protects circuits, but halts battery charging during peak sunlight.',
        choices: [
          {
            id: 'm3-c3-opt-deep-safe-mode',
            title: 'Safe-Mode Power Down & Faraday Isolation',
            tagline: 'Disconnect and ground delicate electronics, rely on internal battery backup.',
            description: 'Feather solar arrays edge-to-sun, disconnect vulnerable communication antennas, and power down all non-essential scientific mainframes.',
            benefits: ['100% protection against electronic chip burnout (+20% Protection)', 'Avionics safe from permanent destruction'],
            costs: ['Halts power generation for 12 hours (-15% Power reserve)', 'Zero science processing (-10% Science)'],
            resourceDeltas: { lifeSupport: 0, power: -15, protection: 20, food: 0, science: -10 },
            feedbackText: 'Grid successfully insulated in safe mode. The storm washed over the base with zero computer hardware damage.',
            scientificExplanation: 'A Faraday cage enclosure and galvanic isolation switches prevent induced electrical currents from burning sensitive silicon transistors during solar geomagnetic events.',
            nasaFact: 'Mars rovers Spirit and Opportunity routinely entered "deep sleep" modes during severe weather and solar conjunctions to protect their instruments.',
            nasaSource: 'NASA JPL Mars Exploration Rover Engineering Logs'
          },
          {
            id: 'm3-c3-opt-triple-modular',
            title: 'Triple-Modular Redundant (TMR) Voting Architecture',
            tagline: 'Keep power flowing while three parallel computers vote on corrupted calculations.',
            description: 'Keep the power grid online while running triple redundant rad-hardened processors that cross-check every calculation to correct bit flips on the fly.',
            benefits: ['Maintains 100% full electrical generation (+10% Power)', 'Records real-time storm data (+20% Science)'],
            costs: ['Heavy processor computing load consumes extra cooling (-10% Life Support)', 'Small risk of circuit degradation (-10% Protection)'],
            resourceDeltas: { lifeSupport: -10, power: 10, protection: -10, food: 0, science: 20 },
            feedbackText: 'TMR systems intercepted 1,420 single-event upsets in memory! Power stayed strong and science sensors recorded valuable solar physics data.',
            scientificExplanation: 'Triple Modular Redundancy (TMR) runs three identical processors doing the same math. If radiation flips a bit in Computer B, Computers A and C outvote it 2-to-1 to keep operating.',
            nasaFact: 'The Space Shuttle and Orion spacecraft both use redundant flight computers with majority voting to survive cosmic ray strikes.',
            nasaSource: 'NASA Computers in Spaceflight History'
          }
        ]
      },
      {
        id: 'm3-c4-post-storm-survey',
        order: 4,
        category: 'emergency',
        title: 'Challenge 4: Post-Storm Surface Sensor Recovery',
        situation: 'The solar storm has subsided. Atmospheric sensors show the CME shock wave has passed. However, exterior cameras reveal solar arrays are covered in static-charged dust.',
        contextFact: 'Solar storms create strong electrostatic fields across dry planetary surfaces, lifting fine regolith dust clouds that cling stubbornly to solar glass.',
        visualState: 'nominal',
        hint: 'Electrodynamic dust shields use tiny electric ripples to shake off dust without physical scraping.',
        choices: [
          {
            id: 'm3-c4-opt-electrodynamic-shield',
            title: 'Activate Electrodynamic Dust Shield (EDS) Wave Pulse',
            tagline: 'Pulses electric waves across panel glass to levitate dust away.',
            description: 'Fire microscopic electrode wires embedded across the solar panel covers to create moving electric fields that levitate and flick charged dust grains off.',
            benefits: ['Restores solar generation to 95% (+20% Power)', 'Requires no astronauts to step outside (+10% Protection)'],
            costs: ['Consumes -10% stored battery power for the high-voltage pulse'],
            resourceDeltas: { lifeSupport: 5, power: 15, protection: 10, food: 0, science: 5 },
            feedbackText: 'EDS pulse triggered! Visible puffs of dust levitated and flew off the panels. Solar telemetry leaped back to nominal green.',
            scientificExplanation: 'NASA’s Electrodynamic Dust Shield uses high-voltage, low-current traveling dielectric waves to lift and transport dielectric dust particles off surfaces without moving parts.',
            nasaFact: 'NASA Kennedy Space Center developed EDS for lunar exploration, where sharp dust is one of the top threats to solar panels and spacesuits.',
            nasaSource: 'NASA Kennedy Space Center Electrodynamic Dust Shield Project'
          },
          {
            id: 'm3-c4-opt-manual-brush-eva',
            title: 'Manual Wiper & Carbon Fiber Brush EVA',
            tagline: 'Conserves battery power, sends crew into residual radiation environment.',
            description: 'Send two astronauts on the surface with carbon-fiber grounding brushes to physically wipe down each solar panel wing.',
            benefits: ['Saves electrical battery energy (+5% Power)'],
            costs: ['Exposes crew to residual low-level ground radiation (-10% Protection)', 'Crew fatigue (-10% Food/Stamina)'],
            resourceDeltas: { lifeSupport: -5, power: 5, protection: -10, food: -10, science: 0 },
            feedbackText: 'Crew swept the panels clean by hand. Power output is restored, but the astronauts are tired and spacesuit boots picked up heavy dust.',
            scientificExplanation: 'Physical brushing on dry surfaces can cause triboelectric charging, sometimes causing dust to cling even tighter if grounded improperly.',
            nasaFact: 'Apollo 12 astronauts noted that wiping cameras with brushes scratched the lenses due to the abrasive glass-like edges of lunar dust.',
            nasaSource: 'NASA Apollo Lunar Surface Journal (ALSJ)'
          }
        ]
      }
    ]
  },

  // ==========================================
  // MISSION 04: MAYDAY
  // ==========================================
  {
    id: 'mission-04',
    number: 4,
    code: 'M-04',
    title: 'Mayday',
    subtitle: 'Cascading Extreme Emergency & Deep Survival Protocol',
    objective: 'Survive an extreme compound outpost emergency under communications blackout, balancing emergency crops, drill blowout, and power depletion.',
    learningGoal: 'Long-duration space exploration requires relentless adaptability, conservation of non-renewables, and psychological endurance.',
    durationSols: 90,
    environmentCondition: 'Long expedition phase. Earth communication delay: 14 minutes round-trip (Mars) or 2.6 seconds (Moon). Deep sub-surface drilling active.',
    badgeId: 'badge-deep-explorer',
    badgeTitle: 'Interplanetary Expedition Commander',
    badgeDescription: 'Completed the full 90-sol expedition with thriving greenhouse crops and major scientific discoveries.',
    potentialEvents: [
      {
        id: 'event-dust-season',
        title: 'Global Dust Storm Haze (High Optical Depth)',
        description: 'Atmospheric dust storms darkened the sky, dropping solar power by 40%.',
        severity: 'critical',
        resourceImpact: { power: -15, science: -5 },
        explanation: 'Martian dust storms can wrap around the entire planet for months, choking off sunlight for solar panels.',
        nasaRealWorldCase: 'The 2018 global Martian dust storm ended the 14-year mission of NASA’s Opportunity rover when solar batteries were starved of light.'
      }
    ],
    challenges: [
      {
        id: 'm4-c1-greenhouse-crops',
        order: 1,
        category: 'food',
        title: 'Challenge 1: Hydroponic Crop Lighting & Calorie Deficit',
        situation: 'The greenhouse crops (dwarf wheat, sweet potatoes, and leafy microgreens) need high-intensity photosynthetic LED lighting, but the base power budget is tight.',
        contextFact: 'Astronauts need about 2,500 to 3,000 calories per day. Packaged rations lose vitamins (like vitamin C and B1) over multi-year storage, making fresh crops vital for health.',
        visualState: 'nominal',
        hint: 'Tuning LEDs to specific red and blue wavelengths gives plants maximum growth while using 50% less electricity than broad white light.',
        choices: [
          {
            id: 'm4-c1-opt-targeted-leds',
            title: 'Targeted Red-Blue Narrowband LED Photoperiod',
            tagline: 'Maximizes chlorophyll absorption, saves 40% power, plants look magenta.',
            description: 'Switch greenhouse lamps from white light to targeted 660 nm (deep red) and 450 nm (royal blue) wavelengths timed to a 16-hour plant daylight schedule.',
            benefits: ['+25% Food growth and fresh vitamins', 'Saves +10% Power compared to full-spectrum lamps', '+10% Crew Morale'],
            costs: ['Slightly reduced visual inspection clarity for plant fungus (-5% Science)'],
            resourceDeltas: { lifeSupport: 10, power: 10, protection: 0, food: 25, science: -5 },
            feedbackText: 'Greenhouse glowing with purple-pink light! Crop growth rates jumped by 30%. Astronauts harvested fresh crisp salad for dinner!',
            scientificExplanation: 'Chlorophyll A and B pigments in plant leaves absorb light most strongly in the blue (430-450 nm) and red (640-660 nm) spectrums, reflecting green. Narrowband LEDs waste zero energy on unneeded wavelengths.',
            nasaFact: 'NASA’s Veggie and Advanced Plant Habitat (APH) on the ISS use custom red/blue/green LED arrays to grow space lettuce, peppers, and zinnia flowers.',
            nasaSource: 'NASA Kennedy Space Center Space Crop Production'
          },
          {
            id: 'm4-c1-opt-ration-rations',
            title: 'Conserve Power & Rely on Freeze-Dried Prepackaged Rations',
            tagline: 'Powers down greenhouse grow-lights, crew eats 100% packaged meals.',
            description: 'Put the greenhouse into dormant low-light maintenance mode and feed the crew exclusively from the prepackaged foil pouch storage pantry.',
            benefits: ['Saves massive electrical energy (+20% Power)', 'Frees up time for geology research (+15% Science)'],
            costs: ['Food reserves drop quickly (-20% Food)', 'Lack of fresh food degrades crew morale (-10% Life Support)'],
            resourceDeltas: { lifeSupport: -10, power: 20, protection: 0, food: -20, science: 15 },
            feedbackText: 'Power reserves surged, but crew morale took a hit after eating freeze-dried beef paste for the fourteenth day in a row.',
            scientificExplanation: 'Food is both fuel and psychological medicine for astronauts. NASA behavioral studies prove that preparing and eating fresh vegetables significantly reduces isolation stress and anxiety.',
            nasaFact: 'NASA food scientists design space menus with over 200 items, but menu fatigue remains a significant psychological challenge on long missions.',
            nasaSource: 'NASA Nutritional Biochemistry Laboratory Space Food Systems'
          }
        ]
      },
      {
        id: 'm4-c2-comm-delay-dilemma',
        order: 2,
        category: 'comms',
        title: 'Challenge 2: Communication Delay & Autonomous Decision',
        situation: 'Deep drill telemetry detects an unexpected pressurized subterranean pocket (possible subsurface ice-brine or pocket gas). Radio signals to Earth take 14 minutes each way (28-minute turnaround).',
        contextFact: 'On Mars, commanders cannot wait for Mission Control on Earth to approve immediate emergency actions because light-speed delay creates an information lag.',
        visualState: 'warning',
        hint: 'Exercising autonomous command authority avoids drilling blowout, while waiting for Earth risks losing instrument calibration.',
        choices: [
          {
            id: 'm4-c2-opt-autonomous-abort',
            title: 'Exercise Commander Autonomy: Safe Retract & Pressure Valve Vent',
            tagline: 'Act immediately without waiting for Earth permission to protect drill rig.',
            description: 'Command the drill string to retract 2 meters immediately and seal the borehole blowout preventer, logging full telemetry for Houston to review later.',
            benefits: ['Protects drill rig from pressure damage (+15% Protection)', 'Demonstrates crew autonomy (+10% Crew Morale)'],
            costs: ['Slight delay in confirming whether it was liquid water or dry gas (-5% Science)'],
            resourceDeltas: { lifeSupport: 5, power: 0, protection: 15, food: 0, science: 10 },
            feedbackText: 'Drill safely locked! Telemetry arrived at Earth 14 minutes later; Houston CAPCOM praised your rapid, decisive autonomous action.',
            scientificExplanation: 'In deep space, autonomous crew decision-making is mandatory. NASA protocols grant Mission Commanders on-site operational authority during time-critical events.',
            nasaFact: 'NASA’s Autonomous Medical and Operations Systems (AMOS) project trains astronauts for Mars missions where real-time Earth guidance is physically impossible.',
            nasaSource: 'NASA Human Research Program Autonomous Operations Architecture'
          },
          {
            id: 'm4-c2-opt-wait-earth',
            title: 'Maintain Current Drill Depth & Await Houston Protocol Instructions',
            tagline: 'Strict adherence to Earth chain-of-command, holds position for 30 minutes.',
            description: 'Leave the drill bit humming at current depth in the pressurized zone while waiting for Earth flight controllers to analyze telemetry and transmit instructions.',
            benefits: ['Follows standard protocol strictly (+5% Science precision)'],
            costs: ['Borehole pressure spike overheats drill motor bearings (-15% Power, -10% Protection)'],
            resourceDeltas: { lifeSupport: 0, power: -15, protection: -10, food: 0, science: 5 },
            feedbackText: 'By the time Houston’s response arrived ("CAUTION: VENT PRESSURE IMMEDIATELY"), the drill motor had overheated from the pressurized back-flow.',
            scientificExplanation: 'A 20-minute communication lag means that by the time you see Earth’s advice, the physical state of your equipment has already changed. Local initiative is critical.',
            nasaFact: 'Rovers like Perseverance are programmed with autonomous navigation (AutoNav) because Earth engineers cannot steer a rover with a 20-minute joystick delay.',
            nasaSource: 'NASA JPL Mars 2020 Perseverance AutoNav Technical Brief'
          }
        ]
      },
      {
        id: 'm4-c3-water-ice-harvest',
        order: 3,
        category: 'eclss',
        title: 'Challenge 3: Subsurface Glacial Ice Extraction',
        situation: 'The autonomous exploration rover locates a pure water-ice glacier 1.5 meters beneath the surface. You must choose how to extract and purify it.',
        contextFact: 'Water is the "gold of space": it provides drinking water, oxygen via electrolysis, and rocket propellant (liquid hydrogen and liquid oxygen) for the return flight to Earth.',
        visualState: 'nominal',
        hint: 'Subsurface Rodriguez wells melt ice in place underground using thermal probes, preventing water vapor from flashing into vacuum.',
        choices: [
          {
            id: 'm4-c3-opt-rodriguez-well',
            title: 'Subsurface Thermal Sub-Melt Rodriguez Well',
            tagline: 'Pumps warm water down to melt a cavity, pumps clean liquid water up.',
            description: 'Drill a narrow heated tube into the ice sheet, circulate warm fluid to create an expanding subterranean pool, and pump clean water directly into insulated habitat tanks.',
            benefits: ['Massive water surplus (+30% Life Support water reserves)', 'Zero dust contamination', 'Enables long-term greenhouse expansion (+15% Food)'],
            costs: ['High initial thermal heater power draw (-20% Power)'],
            resourceDeltas: { lifeSupport: 30, power: -20, protection: 5, food: 15, science: 15 },
            feedbackText: 'Rodriguez well operational! Clean glacial water is flowing directly into base reservoir tanks. Water self-sufficiency achieved!',
            scientificExplanation: 'Rodriguez wells (used by scientists at the South Pole in Antarctica) melt an insulated bulb of ice underground, using the surrounding ice shelf as a natural clean tank.',
            nasaFact: 'NASA’s Subsurface Water Ice Mapping (SWIM) project maps massive sheets of pure water ice buried just below the surface across Mars.',
            nasaSource: 'NASA Subsurface Water Ice Mapping (SWIM) Project'
          },
          {
            id: 'm4-c3-opt-mechanical-excavation',
            title: 'Mechanical Rover Shoveling & Solar Oven Retort',
            tagline: 'Excavates icy dirt, uses concentrated solar mirrors to bake water out.',
            description: 'Send autonomous bulldozer rovers to scrape icy regolith into a sealed solar kiln that uses focused parabolic mirrors to bake out the water vapor.',
            benefits: ['Uses zero electrical battery power (100% passive solar heat) (+10% Power saved)'],
            costs: ['Abrasive frozen gravel wears down rover blades (-10% Protection)', 'Lower extraction yield (+15% Life Support)'],
            resourceDeltas: { lifeSupport: 15, power: 10, protection: -10, food: 5, science: 10 },
            feedbackText: 'Solar kiln baked the gravel and condensed water vapor into collection jugs. Power remained untouched, though rover blades show significant pitting.',
            scientificExplanation: 'Baking water out of icy regolith requires condensing steam that contains corrosive salts (like perchlorates on Mars), requiring robust chemical filtering.',
            nasaFact: 'Perchlorates in Martian soil must be thoroughly washed out of water before it is safe for humans to drink or use for crops.',
            nasaSource: 'NASA Mars Phoenix Lander Wet Chemistry Laboratory'
          }
        ]
      },
      {
        id: 'm4-c4-grand-expedition-culmination',
        order: 4,
        category: 'science',
        title: 'Challenge 4: Grand Scientific Discovery vs. Return Preparation',
        situation: 'The expedition reaches its final phase. Orbital sensors detect a pristine, exposed geological outcrop that might contain fossilized ancient biosignatures, 5 km away.',
        contextFact: 'The primary scientific goal of exploring Mars and the Moon is discovering whether life ever arose elsewhere in the universe, and uncovering the early history of planet formation.',
        visualState: 'nominal',
        hint: 'Committing full rover battery power and life support reserves enables a historic scientific breakthrough, but leaves less margin for return launch prep.',
        choices: [
          {
            id: 'm4-c4-opt-full-scientific-push',
            title: 'Launch Full Rover Scientific Expedition to Biosignature Outcrop',
            tagline: 'Dedicate all available rover power to high-resolution spectrometers and core drills.',
            description: 'Deploy both rovers and remote Raman/Fluorescence spectrometers to conduct deep scanning of the fossilized strata, transmitting discovery data to Earth.',
            benefits: ['Major breakthrough discovery: potential micro-fossils detected! (+35% Science)', 'Generates historic mission prestige'],
            costs: ['Pushes rover power and base batteries to the limit (-15% Power)', 'Slight wear on life-support reserves (-10% Life Support)'],
            resourceDeltas: { lifeSupport: -10, power: -15, protection: 0, food: 0, science: 35 },
            feedbackText: 'HISTORIC DISCOVERY! Spectrometers identified organic amino-acid compounds locked in ancient clay strata. Earth and NASA celebrate!',
            scientificExplanation: 'Raman and Luminescence spectroscopy detect organic macromolecules non-destructively by bouncing laser light off mineral crystals and measuring molecular vibrations.',
            nasaFact: 'NASA’s Perseverance rover carries the SHERLOC and PIXL instruments on its robotic arm, specifically searching for microscopic ancient biosignatures in Jezero Crater.',
            nasaSource: 'NASA Mars 2020 Perseverance Science Team'
          },
          {
            id: 'm4-c4-opt-conservative-closure',
            title: 'Consolidate Outpost Infrastructure & Fuel Ascent Vehicle Tanks',
            tagline: 'Prioritize 100% crew safety, base winterization, and clean propellant production.',
            description: 'Focus all remaining kilowatts and water electrolysis on filling the Mars/Lunar Ascent Vehicle (MAV) liquid oxygen and methane tanks for a seamless return.',
            benefits: ['Ascent vehicle 100% fueled and verified (+25% Life Support)', 'All systems secure for winter dormancy (+15% Protection)'],
            costs: ['Leaves the distant geological outcrop unexplored for future missions (-10% Science opportunity)'],
            resourceDeltas: { lifeSupport: 25, power: 5, protection: 15, food: 5, science: 5 },
            feedbackText: 'Ascent vehicle tanks 100% filled and pressurized! Outpost is safely secured in winterization mode. Crew is guaranteed a safe ride home.',
            scientificExplanation: 'In-Situ Propellant Production (ISPP) turns local water and atmospheric carbon dioxide into rocket fuel, eliminating the need to launch return propellant from Earth.',
            nasaFact: 'NASA’s MOXIE experiment on Mars proved that oxygen can be reliably generated directly from the Martian carbon dioxide atmosphere.',
            nasaSource: 'NASA MOXIE Instrument Results (MIT / JPL)'
          }
        ]
      }
    ]
  }
];

export const BADGES_LIST = [
  {
    id: 'badge-first-footprint',
    title: 'Pioneer Architect',
    icon: 'Flag',
    description: 'Successfully established the outpost foundation and balanced primary survival infrastructure.',
    rarity: 'common' as const
  },
  {
    id: 'badge-eclss-hero',
    title: 'Master Systems Engineer',
    icon: 'Activity',
    description: 'Diagnosed and solved cascade life-support failures without running out of air or water.',
    rarity: 'rare' as const
  },
  {
    id: 'badge-solar-guardian',
    title: 'Solar Guardian',
    icon: 'Shield',
    description: 'Safely guided the outpost through an extreme space radiation storm with zero radiation casualties.',
    rarity: 'rare' as const
  },
  {
    id: 'badge-deep-explorer',
    title: 'Interplanetary Expedition Commander',
    icon: 'Award',
    description: 'Completed the full 90-sol expedition with thriving greenhouse crops and major scientific discoveries.',
    rarity: 'legendary' as const
  },
  {
    id: 'badge-zero-casualty',
    title: 'Flawless Safety Record',
    icon: 'Heart',
    description: 'Kept Life Support and Protection above 70% across all missions.',
    rarity: 'legendary' as const
  },
  {
    id: 'badge-science-virtuoso',
    title: 'Chief Science Officer',
    icon: 'Sparkles',
    description: 'Accumulated over 120 Science Research points through rigorous exploration.',
    rarity: 'rare' as const
  }
];
