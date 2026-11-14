export interface CsaFoodResource {
  id: string;
  title: string;
  program: string;
  sourceName: string;
  sourceUrl: string;
  measurementContext: string;
  description: string;
  keyPrinciples: string[];
  limitations: string;
  gameplayRelevance: string;
  dataOrigin: 'curated';
}

export const CSA_FOOD_PRODUCTION_RESOURCES: CsaFoodResource[] = [
  {
    id: 'CSA-FOOD-TOOLKIT',
    title: 'Food Production on the Moon & in Space',
    program: 'CSA Youth & Educators STEM Toolkit',
    sourceName: 'Canadian Space Agency (CSA)',
    sourceUrl: 'https://www.asc-csa.gc.ca/eng/youth-educators/toolkits/food-production/',
    measurementContext: 'Curated Educational STEM Resource (No live JSON API)',
    description:
      'Official Canadian Space Agency educational toolkit examining why long-duration lunar and Martian crews must supplement pre-packaged rations with fresh, locally grown food using minimal water, power, and volume.',
    keyPrinciples: [
      'Fresh crops replenish vitamins and micronutrients that degrade over multi-year shelf storage.',
      'Closed-loop greenhouses recycle transpired water vapor back into the habitat potable water loop.',
      'Psychological well-being improves when astronauts tend living plants in isolated environments.'
    ],
    limitations:
      'Educational curriculum resource — does not publish quantitative per-crop growth rates or real-time sensor feeds. In-game crop timers remain simulated.',
    gameplayRelevance:
      'Provides authentic scientific context for Mission 04 (Sustainable Farming): building a Hydroponics Bay and Water Recycler.',
    dataOrigin: 'curated'
  },
  {
    id: 'CSA-DEEP-SPACE-FOOD-CHALLENGE',
    title: 'Deep Space Food Challenge',
    program: 'CSA & NASA Joint Innovation Challenge',
    sourceName: 'Canadian Space Agency (CSA)',
    sourceUrl: 'https://www.asc-csa.gc.ca/eng/sciences/food-production/deep-space-food-challenge.asp',
    measurementContext: 'Curated Program Brief — Moon, Mars & Remote Earth Dual-Use',
    description:
      'Joint Canadian Space Agency and NASA competition challenging teams to engineer novel food production systems capable of sustaining crews on long-duration space missions while minimizing energy, water, mass, and waste.',
    keyPrinciples: [
      'Compact modular systems designed to fit inside pressurized habitat racks.',
      'High nutrient density with low agricultural waste and rapid sanitation between harvests.',
      'Dual-use Earth benefit for northern and remote communities facing food supply disruptions.'
    ],
    limitations:
      'Competition documentation and design criteria; experimental yields vary by competing prototype.',
    gameplayRelevance:
      'Explains why the Outpost Greenhouse consumes electrical power (LED lighting and pumps) and requires reliable solar/battery storage.',
    dataOrigin: 'curated'
  },
  {
    id: 'CSA-NAURVIK-CEA',
    title: 'Growing Healthy Food in Space and Remote Areas (Naurvik)',
    program: 'CSA Controlled Environment Agriculture (CEA)',
    sourceName: 'Canadian Space Agency (CSA)',
    sourceUrl: 'https://www.asc-csa.gc.ca/eng/sciences/food-production/growing-healthy-food-in-space-and-remote-areas.asp',
    measurementContext: 'Curated Earth-Analog Field Project (Gjoa Haven, Nunavut)',
    description:
      'Research partnership applying Controlled Environment Agriculture (CEA) — soil-less hydroponic cultivation under tailored LED spectra — in Nunavut’s Arctic climate as a real-world analog for lunar and Martian greenhouses.',
    keyPrinciples: [
      'Hydroponics delivers dissolved nutrients directly to roots without heavy Earth soil transport.',
      'Tuned red/blue LED lighting reduces electrical load and thermal waste compared to broadband lamps.',
      'Closed-loop humidity condensation recovers water lost through plant transpiration.'
    ],
    limitations:
      'Field project documentation; exact cultivar harvest weights depend on facility configuration and are not fabricated in this simulator.',
    gameplayRelevance:
      'Connects real Arctic space-analog engineering directly to the player’s Greenhouse + Water Recycler survival loop.',
    dataOrigin: 'curated'
  },
  {
    id: 'CSA-TOMATOSPHERE',
    title: 'Tomatosphere Space Seed Investigation',
    program: 'CSA / Let’s Talk Science STEM Experiment',
    sourceName: 'Canadian Space Agency (CSA)',
    sourceUrl: 'https://www.asc-csa.gc.ca/eng/youth-educators/tomatosphere.asp',
    measurementContext: 'Curated Spaceflight Seed Germination Program',
    description:
      'Space education investigation studying how exposure to spaceflight aboard the ISS or simulated space environments affects tomato seed germination compared with Earth control seeds.',
    keyPrinciples: [
      'Controlled comparisons test whether radiation, vacuum, or microgravity storage alter seed viability.',
      'Teaches cadets why seed shielding and botanical diversity matter for long-duration outposts.'
    ],
    limitations:
      'Classroom blind-experiment framework; results are collected by participating students rather than streamed via API.',
    gameplayRelevance:
      'Pairs with NASA OSDR plant-radiation studies (OSD-120, OSD-520) to ground space botany in real biology.',
    dataOrigin: 'curated'
  }
];
