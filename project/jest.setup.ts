import "@testing-library/jest-dom"
import { TextEncoder, TextDecoder } from "util"
import { ReadableStream, WritableStream, TransformStream } from "stream/web"
import { MessageChannel, MessagePort } from "worker_threads"

// Polyfill TextEncoder/Decoder
Object.assign(global, { TextDecoder, TextEncoder })

// Polyfill Web Streams (Required by undici)
Object.assign(global, { ReadableStream, WritableStream, TransformStream })

// Polyfill MessageChannel/MessagePort (Required by undici)
Object.assign(global, { MessageChannel, MessagePort })

// Polyfill Fetch API Request/Response
if (typeof global.Request === "undefined") {
  const { Request, Response, Headers, fetch } = require("undici")
  Object.assign(global, { Request, Response, Headers, fetch })
}

process.env.DATABASE_URL = "postgresql://dummy_user:dummy_password@localhost:5432/dummy_db"
