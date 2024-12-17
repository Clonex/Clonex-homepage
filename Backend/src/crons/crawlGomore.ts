// Crawling other rentals in my ares to see if its profitable.
import { database } from "../connections";

const sellerIds = [
  "3926795",
  "3446683",
  "1195701",
  "1013486",
  "3560002",
  "3650066",
] as const;

export async function crawlGomoreSellers() {
  const sellerRentals: { sellerId: string; amount: number }[] = [];
  for (const sellerId of sellerIds) {
    const rentals = await api<{ sections: GomoreSection[] }>(
      `users/${sellerId}/profile`
    );

    for (const section of rentals.data.sections) {
      const rental = getRentalSection(section);
      if (rental) {
        sellerRentals.push({
          sellerId,
          amount: Number(rental.split(" ")[0]),
        });
        continue;
      }
    }
  }

  await database.crawlLog.createMany({
    data: sellerRentals.map((rental) => ({
      type: rental.sellerId,
      value: rental.amount.toString(),
    })),
  });

  console.log("Crawled rentals", sellerRentals);
}

interface GomoreSection {
  text?: string;
  element?: GomoreSection;
  body?: GomoreSection[];

  content?: GomoreSection;
  elements?: GomoreSection[];
}

function getRentalSection(section: GomoreSection): string | undefined {
  if (section.text?.toLowerCase().includes("rentals")) {
    return section.text;
  }

  if (section.content) {
    return getRentalSection(section.content);
  }

  if (section.element) {
    const elementSection = getRentalSection(section.element);
    if (elementSection) {
      return elementSection;
    }
  }

  for (const bodySection of section.body ?? []) {
    const rentals = getRentalSection(bodySection);
    if (rentals) {
      return rentals;
    }
  }

  for (const elementSection of section.elements ?? []) {
    const rentals = getRentalSection(elementSection);
    if (rentals) {
      return rentals;
    }
  }
}

async function api<Data>(endpoint: string) {
  const response = await fetch(
    `https://gomore.dk/api/javascript/v87/${endpoint}`,
    {
      method: "POST",
    }
  ).then((response) => response.json());

  return response as { data: Data; status: "success" };
}
