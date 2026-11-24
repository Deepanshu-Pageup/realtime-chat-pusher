import { app } from "./app"
import { env } from "./config/env";

const PORT = env.PORT

const server = app.listen(PORT, () => {
    console.log(`Server is running in the PORT: ${PORT}`)
})

server.on("error", (error: NodeJS.ErrnoException) => {
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`)
    } else {
        console.error("Server error:", error)
    }
    process.exit(1)
})

const shutdown = (signal: string) => {
    console.log(`${signal} received, shutting down...`)
    server.close(() => process.exit(0))
    setTimeout(() => process.exit(1), 10_000).unref()
}

process.on("SIGINT", () => shutdown("SIGINT"))
process.on("SIGTERM", () => shutdown("SIGTERM"))
process.on("unhandledRejection", (reason) => {
    console.error("Unhandled rejection:", reason)
})
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error)
    process.exit(1)
})
