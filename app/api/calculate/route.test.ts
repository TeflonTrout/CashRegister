import { describe, expect, it } from "@jest/globals";
import { POST } from "./route";

describe("POST /api/calculate", () => {
  it("returns calculated change for valid input", async () => {
    const request = new Request("http://localhost/api/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lines: ["2.12,3.00"],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.results).toHaveLength(1);
    expect(body.results[0].changeOwed).toBe(88);
    expect(body.results[0].isRandomized).toBe(false);
  });

  it("returns 400 for invalid transaction input", async () => {
    const request = new Request("http://localhost/api/calculate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lines: [],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe(
      "Expected a non-empty array of transaction lines.",
    );
  });
});

it("calculates change for multiple transaction lines", async () => {
  const request = new Request("http://localhost/api/calculate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      lines: [
        "2.12,3.00",
        "1.97,2.00",
        "3.33,5.00",
      ],
    }),
  });

  const response = await POST(request);
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.results).toHaveLength(3);

  expect(body.results[0].changeOwed).toBe(88);
  expect(body.results[1].changeOwed).toBe(3);
  expect(body.results[2].changeOwed).toBe(167);

  expect(body.results[0].isRandomized).toBe(false);
  expect(body.results[1].isRandomized).toBe(false);
  expect(body.results[2].isRandomized).toBe(true);
});