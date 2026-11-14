import { GlossaryTerm } from '../types/game';

export const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    id: 'radiation',
    term: 'Space Radiation',
    phonetic: 'ray-dee-AY-shun',
    category: 'Radiation & Sun',
    simpleDefinition: 'Invisible high-energy waves and tiny particles streaming from the Sun and deep space. Without Earth’s protective magnetic bubble, astronauts need thick shields made of water, plastic, or rock.',
    funFact: 'Did you know? Moon dirt (called regolith) contains iron and titanium that can block radiation if piled 1 to 2 meters thick over a habitat!',
    nasaLink: 'https://www.nasa.gov/science-research/heliophysics/space-radiation/'
  },
  {
    id: 'solar-storm',
    term: 'Solar Storm (CME & Flares)',
    phonetic: 'SO-lar storm',
    category: 'Radiation & Sun',
    simpleDefinition: 'A giant magnetic explosion on the Sun that flings millions of tons of super-hot electrified gas and radiation across space at thousands of miles per second.',
    funFact: 'NASA satellites like SOHO and SDO act like solar weather forecasters, giving astronauts between 15 to 30 hours warning before the storm hits!',
    nasaLink: 'https://www.nasa.gov/mission_pages/sunearth/spaceweather/'
  },
  {
    id: 'life-support',
    term: 'Life Support System (ECLSS)',
    phonetic: 'EE-cliss',
    category: 'Life Support',
    simpleDefinition: 'The machines that keep humans alive inside a spaceship or base. ECLSS scrubs carbon dioxide from the air, generates fresh oxygen, and cleans recycled water.',
    funFact: 'On the International Space Station, ECLSS recycles up to 98% of all water, including astronauts’ sweat and breath moisture!',
    nasaLink: 'https://www.nasa.gov/international-space-station/space-station-eclss/'
  },
  {
    id: 'regolith',
    term: 'Regolith (Space Soil)',
    phonetic: 'REG-oh-lith',
    category: 'Planetary Science',
    simpleDefinition: 'The powdery, sharp dust and crushed rock covering the surface of the Moon and Mars. Because there is no wind or water erosion, the grains are sharp like broken glass.',
    funFact: 'Engineers are building 3D-printing rovers that melt regolith into hard brick structures for landing pads and base domes!',
    nasaLink: 'https://www.nasa.gov/stem-ed-resources/lunar-regolith.html'
  },
  {
    id: 'martian-sol',
    term: 'Martian Sol',
    phonetic: 'sahl',
    category: 'Planetary Science',
    simpleDefinition: 'One full day and night cycle on Mars. A Martian Sol lasts 24 hours, 39 minutes, and 35 seconds—just about 40 minutes longer than an Earth day!',
    funFact: 'Scientists who pilot rovers like Perseverance wear special watches tuned to Mars time so they stay awake during Martian daylight!',
    nasaLink: 'https://mars.nasa.gov/news/9200/'
  },
  {
    id: 'comm-delay',
    term: 'Communication Delay',
    phonetic: 'kuh-myoo-nih-KAY-shun dee-LAY',
    category: 'Spacecraft & Habitat',
    simpleDefinition: 'Radio signals travel at the speed of light (300,000 km/s). Talking to the Moon only takes 1.3 seconds, but talking to Mars takes between 4 and 24 minutes depending on where Earth and Mars are in their orbits.',
    funFact: 'Because of the delay to Mars, an astronaut can’t have a real-time phone call with Mission Control—they have to send recorded audio messages and wait!',
    nasaLink: 'https://www.nasa.gov/directorates/somd/space-communications-navigation-scan/'
  },
  {
    id: 'hydroponics',
    term: 'Hydroponic Greenhouse',
    phonetic: 'hy-dro-PAHN-iks',
    category: 'Life Support',
    simpleDefinition: 'Growing fresh plants, salads, and crops in water rich with minerals instead of traditional outdoor soil, illuminated by special red and blue LED lights.',
    funFact: 'Plants in space don’t just provide crunchy fresh food; they also produce oxygen and boost astronaut happiness and morale!',
    nasaLink: 'https://www.nasa.gov/kennedy/features/veggie-space-crops/'
  },
  {
    id: 'renewable-energy',
    term: 'Renewable Space Energy',
    phonetic: 're-NEW-uh-bul EN-er-jee',
    category: 'Power & Energy',
    simpleDefinition: 'Harnessing energy that never runs out, like sunlight with photovoltaic solar arrays, or compact nuclear fission (Kilopower) that generates power day and night.',
    funFact: 'At the Moon’s South Pole, some high crater peaks receive sunlight for hundreds of days continuously, nicknamed "Peaks of Eternal Light"!',
    nasaLink: 'https://www.nasa.gov/technology/power-to-the-planets/'
  },
  {
    id: 'sabatier',
    term: 'Sabatier Reactor',
    phonetic: 'sah-bah-tee-AY',
    category: 'Life Support',
    simpleDefinition: 'A chemical reactor that takes waste carbon dioxide exhaled by astronauts, mixes it with hydrogen, and turns it into water and methane gas.',
    funFact: 'Named after French chemist Paul Sabatier, this clever reaction closes the survival loop so astronauts don’t run out of drinking water!',
    nasaLink: 'https://www.nasa.gov/mission_pages/station/research/experiments/explorer/Investigation.html?#id=750'
  },
  {
    id: 'microgravity',
    term: 'Microgravity & Low Gravity',
    phonetic: 'my-kroh-GRAV-ih-tee',
    category: 'Planetary Science',
    simpleDefinition: 'The Moon has 1/6th of Earth’s gravity (you feel six times lighter), while Mars has about 1/3rd of Earth’s gravity. Astronauts can bounce high in their suits!',
    funFact: 'Apollo astronauts on the Moon learned that the best way to travel was doing "bunny hops" because walking normally was too clumsy in 1/6th gravity!',
    nasaLink: 'https://www.nasa.gov/audience/forstudents/5-8/features/nasa-knows/what-is-microgravity-58.html'
  }
];
