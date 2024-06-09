export type HeartRateZone = {
  name: string;
  description: HRZoneDescription;
  lowerLimit: number;
  upperLimit: number;
  expanded?: boolean;
};

export type HRZoneDescription = {
  title: string;
  characteristics: string;
  energySource: string;
  muscleFiberType: string;
  benefits: string;
  example: string;
};

export const zoneDescriptions: HRZoneDescription[] = [
  {
    title: "Zone 1: Recovery",
    characteristics:
      "Low-intensity exercise used primarily for recovery, minimal ATP requirement.",
    energySource: "Mix of fat and glucose, minimal lactate production.",
    muscleFiberType: "Primarily slow-twitch muscle fibers.",
    benefits: "Facilitates recovery and minimizes metabolic stress.",
    example: "Light cycling or jogging, focusing on recovery.",
  },
  {
    title: "Zone 2: Aerobic",
    characteristics:
      "Maximizes fat oxidation and lactate clearance capacity. Threshold before shifting to fast-twitch muscle fibers.",
    energySource: "Fat as primary fuel source, alongside glucose.",
    muscleFiberType:
      "Slow-twitch muscle fibers with high mitochondrial content.",
    benefits:
      "Improves mitochondrial function, enhances endurance and fat oxidation.",
    example: "Steady-state cycling or running at a controlled pace.",
  },
  {
    title: "Zone 3: Transition",
    characteristics:
      "Shift from fat to carbohydrate oxidation due to increasing ATP demands.",
    energySource:
      "Increasing reliance on carbohydrates, reduction in fat utilization.",
    muscleFiberType: "Transition to fast-twitch muscle fibers.",
    benefits:
      "Prepares body for higher intensity efforts, begins to improve glycolytic capacity.",
    example:
      "Moderate-intensity training sessions that start to challenge endurance.",
  },
  {
    title: "Zone 4: Threshold",
    characteristics:
      "High-intensity training zone, complete reliance on carbohydrates, significant lactate production.",
    energySource: "Mostly Carbohydrates, minimal fat oxidation.",
    muscleFiberType: "Fast-twitch muscle fibers.",
    benefits:
      "Develops glycolytic capacity, critical for short, intense efforts.",
    example:
      "High-intensity interval training (HIIT), time trials, or efforts at lactate threshold.",
  },
  {
    title: "Zone 5: VO2 Max",
    characteristics:
      "Peak aerobic capacity efforts, characterized by maximal effort and high lactate accumulation.",
    energySource: "Primarily carbohydrates, significant lactate production.",
    muscleFiberType: "Fast-twitch muscle fibers for peak effort.",
    benefits: "Enhances upper limits of aerobic performance and capacity.",
    example:
      "Short, maximal bursts of activity like sprinting or VO2 max intervals.",
  },
];

export function calculateHeartRateZonesBasedOnAge(
  age: number,
  maxHr: number
): HeartRateZone[] {
  const zone2UpperLimit = 180 - age;
  const zone2LowerLimit = zone2UpperLimit - 12;

  // Zones 1 and 2 are now defined
  let zones = [
    {
      name: "Zone 1",
      lowerLimit: 0,
      upperLimit: zone2LowerLimit,
      description: zoneDescriptions[0],
    }, // Lower limit of Zone 1 isn't strictly defined here
    {
      name: "Zone 2",
      lowerLimit: zone2LowerLimit,
      upperLimit: zone2UpperLimit,
      description: zoneDescriptions[1],
    },
  ];

  // Calculate the evenly split range for Zones 3, 4, and 5
  const remainingRange = maxHr - zone2UpperLimit;
  const zoneWidth = remainingRange / 3;

  // Define the limits for Zones 3, 4, and 5
  zones.push(
    {
      name: "Zone 3",
      lowerLimit: zone2UpperLimit,
      upperLimit: zone2UpperLimit + zoneWidth,
      description: zoneDescriptions[2],
    },
    {
      name: "Zone 4",
      lowerLimit: zone2UpperLimit + zoneWidth,
      upperLimit: zone2UpperLimit + 2 * zoneWidth,
      description: zoneDescriptions[3],
    },
    {
      name: "Zone 5",
      lowerLimit: zone2UpperLimit + 2 * zoneWidth,
      upperLimit: maxHr,
      description: zoneDescriptions[4],
    }
  );

  return zones.map((zone) => ({
    name: zone.name,
    description: zone.description,
    lowerLimit: Math.round(zone.lowerLimit),
    upperLimit: Math.round(zone.upperLimit),
    expanded: false,
  }));
}

export function calculateHeartRateZonesBasedOnHR(
  maxHr: number,
  restingHr: number
): HeartRateZone[] {
  const zones = [
    {
      name: "Zone 1",
      description: zoneDescriptions[0],
      lowerLimit: 0.5,
      upperLimit: 0.6,
    },
    {
      name: "Zone 2",
      description: zoneDescriptions[1],
      lowerLimit: 0.6,
      upperLimit: 0.7,
    }, // Zone 2 is defined by 180 - age, adjust as needed
    {
      name: "Zone 3",
      description: zoneDescriptions[2],
      lowerLimit: 0.7,
      upperLimit: 0.8,
    },
    {
      name: "Zone 4",
      description: zoneDescriptions[3],
      lowerLimit: 0.8,
      upperLimit: 0.9,
    },
    {
      name: "Zone 5",
      description: zoneDescriptions[4],
      lowerLimit: 0.9,
      upperLimit: 1.0,
    },
  ];

  return zones.map((zone) => ({
    name: zone.name,
    description: zone.description,
    lowerLimit: Math.round(restingHr + (maxHr - restingHr) * zone.lowerLimit),
    upperLimit: Math.round(restingHr + (maxHr - restingHr) * zone.upperLimit),
  }));
}

export function calculateHeartRateZones(
  age?: number,
  maxHr?: number,
  restingHr?: number
): HeartRateZone[] {
  if (maxHr && restingHr) {
    return calculateHeartRateZonesBasedOnHR(maxHr, restingHr);
  } else if (age) {
    console.log("age", age);
    return calculateHeartRateZonesBasedOnAge(age, maxHr ?? 220 - age);
  } else {
    throw new Error("Invalid input for HR Zones calculation");
  }
}
