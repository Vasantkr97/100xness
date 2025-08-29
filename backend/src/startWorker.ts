import { tradeWorker } from "./uploader/worker";

console.log("🚀 Starting trade worker...");

// Enable error handling
tradeWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed successfully`);
});

tradeWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err);
});

tradeWorker.on("error", (err) => {
    console.error("❌ Worker error:", err);
});

console.log("✅ Trade worker started and listening for jobs...");

// Keep the process alive
process.on('SIGINT', async () => {
    console.log('Shutting down worker...');
    await tradeWorker.close();
    process.exit(0);
});
