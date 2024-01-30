export type HeartRateZone = {
  name: string;
  lowerLimit: number;
  higherLimit: number;
};

export function calculateHeartRateZones(
  maxHr: number,
  restingHr: number
): HeartRateZone[] {
  const zones = [
    { name: "Zone 1", lowerLimit: 0.5, higherLimit: 0.6 },
    { name: "Zone 2", lowerLimit: 0.6, higherLimit: 0.7 },
    { name: "Zone 3", lowerLimit: 0.7, higherLimit: 0.8 },
    { name: "Zone 4", lowerLimit: 0.8, higherLimit: 0.9 },
    { name: "Zone 5", lowerLimit: 0.9, higherLimit: 1.0 },
  ];

  return zones.map((zone) => ({
    name: zone.name,
    lowerLimit: Math.round(restingHr + (maxHr - restingHr) * zone.lowerLimit),
    higherLimit: Math.round(restingHr + (maxHr - restingHr) * zone.higherLimit),
  }));
}
