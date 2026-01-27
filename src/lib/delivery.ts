export interface DeliveryEstimate {
  method: string;
  minDays: number;
  maxDays: number;
  description: string;
}

export function getDeliveryEstimate(method: "inpost" | "courier"): DeliveryEstimate {
  const estimates = {
    inpost: {
      method: "InPost Paczkomat",
      minDays: 1,
      maxDays: 2,
      description: "Dostawa do paczkomatu następnego dnia roboczego"
    },
    courier: {
      method: "Kurier",
      minDays: 2,
      maxDays: 3,
      description: "Dostawa kurierem pod wskazany adres"
    }
  };

  return estimates[method];
}

export function formatDeliveryDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toLocaleDateString("pl-PL", { 
    weekday: "long", 
    day: "numeric", 
    month: "long" 
  });
}
