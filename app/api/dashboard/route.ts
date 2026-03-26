import { NextResponse } from "next/server";
import { getDashboardData } from "@/services/persistenceService";
import { importCsvLeads } from "@/data/importLeads";

export async function GET() {
  const data = await getDashboardData();
  const importSummary = importCsvLeads().summary;
  return NextResponse.json({ ...data, importSummary });
}
