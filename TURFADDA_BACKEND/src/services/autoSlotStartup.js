import Turf from "../features/turf/turf.model.js";
import Slot from "../features/turf/slot.model.js";

const timeToMinutes = (time, isClosing = false) => {
  if (isClosing && time === "00:00") {
    return 24 * 60;
  }
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

const minutesToTime = (minutes) => {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
};

export const generateSlotsForAllTurfs = async (days = 30) => {
  try {
    console.log("🚀 Auto slot generation started...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const turfs = await Turf.find({
      isActive: true,
      status: "active",
    }).lean();

    console.log(`🔎 Found ${turfs.length} active turfs`);

    let totalCreated = 0;

    for (const turf of turfs) {
      let turfCreatedCount = 0;

      const openMinutes = timeToMinutes(turf.openingTime);
      const closeMinutes = timeToMinutes(turf.closingTime, true);
      const duration = turf.slotDurationMinutes;

      console.log(`\n📍 Processing Turf: ${turf.name}`);
      console.log("Opening:", turf.openingTime, openMinutes);
      console.log("Closing:", turf.closingTime, closeMinutes);
      console.log("Duration:", duration);

      if (
        isNaN(openMinutes) ||
        isNaN(closeMinutes) ||
        openMinutes >= closeMinutes
      ) {
        console.log("⚠️ Invalid opening/closing time. Skipping turf.");
        continue;
      }

      for (let i = 0; i < days; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);
        targetDate.setHours(0, 0, 0, 0);

        for (
          let current = openMinutes;
          current + duration <= closeMinutes;
          current += duration
        ) {
          const startTime = minutesToTime(current);
          const endTime = minutesToTime(current + duration);

          const result = await Slot.updateOne(
            {
              turf: turf.id,
              date: targetDate,
              startTime,
            },
            {
              $setOnInsert: {
                endTime,
                durationMinutes: duration,
                price: turf.pricePerSlot,
                createdBy: turf.owner,
              },
            },
            { upsert: true }
          );

          if (result.upsertedCount > 0) {
            turfCreatedCount++;
            totalCreated++;
          }
        }
      }

      console.log(
        `✅ Slots processed for turf: ${turf.name} | New slots created: ${turfCreatedCount}`
      );
    }

    console.log("\n🎉 Auto slot generation completed");
    console.log(`📊 Total new slots created: ${totalCreated}`);
  } catch (error) {
    console.error("❌ Slot generation failed:", error.message);
  }
};
