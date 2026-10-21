import { test } from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/analyze/route.ts";
const request = (body: unknown) =>
  new Request("http://localhost/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
test("empty input fails before contacting Gemini", async () => {
  const response = await POST(request({ text: "  " }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_INPUT");
});
test("malformed JSON produces a controlled 400", async () => {
  const response = await POST(
    new Request("http://localhost/api/analyze", { method: "POST", body: "{" }),
  );
  assert.equal(response.status, 400);
});
test("unsupported image input and oversized content fail validation", async () => {
  const image = await POST(
    request({ imageBase64: "data:image/svg+xml;base64,AAAA" }),
  );
  assert.equal(image.status, 400);
  const text = await POST(request({ text: "x".repeat(20001) }));
  assert.equal(text.status, 400);
});
test("a bare URL is not passed off as a fetched web page", async () => {
  const response = await POST(request({ text: "https://example.com/course" }));
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "URL_ONLY");
});
test("missing configuration returns a safe 503 with no internal secret details", async () => {
  const original = process.env.GEMINI_API_KEY;
  try {
    delete process.env.GEMINI_API_KEY;
    const response = await POST(
      request({ text: "A course with a syllabus and practical exercises." }),
    );
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, "NOT_CONFIGURED");
  } finally {
    if (original !== undefined) process.env.GEMINI_API_KEY = original;
  }
});

test('a transient unavailable provider is retried once instead of failing immediately', async (t) => {
 // Controlled outage test: Google returned real HTTP 503 during the image smoke.
 // Model quality is covered by separate real API smoke tests, not this transport fixture.
 const originalKey = process.env.GEMINI_API_KEY
 process.env.GEMINI_API_KEY = 'outage-test-key'
 let attempts = 0
 const provider = t.mock.method(globalThis, 'fetch', async () => {
  attempts++
  if (attempts === 1) return new Response('', {status:503})
  const extraction={title:{ru:'Курс',kz:'Курс',en:'Course'},qQuality:null,pPriceAnomaly:null,aAltCost:null,qualityEvidence:[],academicSignals:[],scamSignals:[],riskEvidence:[],triggers:[],price:{amount:null,currency:null}}
  return Response.json({candidates:[{content:{parts:[{text:JSON.stringify(extraction)}]}}]})
 })
 try{
  const response=await POST(request({text:'A course announcement.'}))
  assert.equal(response.status,200)
  assert.equal(attempts,2)
 }finally{
  provider.mock.restore()
  if(originalKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=originalKey
 }
})
