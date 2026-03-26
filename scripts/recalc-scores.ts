import { recalculateAllLeadScores } from "../services/persistenceService";

void recalculateAllLeadScores()
  .then((n) => {
    console.log(`Recalculated scores for ${n} leads.`);
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
