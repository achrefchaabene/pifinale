import { describe, expect, it } from "vitest";
import { generateChatbotReply } from "@/lib/chatbotEngine";

describe("chatbotEngine", () => {
  it("prioritizes emergency responses", () => {
    const reply = generateChatbotReply("Mon pere est tombe et il ne parle plus", "fr");

    expect(reply.source).toContain("securite");
    expect(reply.confidence).toBe(1);
  });

  it("answers from the uploaded document base in French", () => {
    const reply = generateChatbotReply("Quels sont les premiers signes de la maladie d'Alzheimer ?", "fr");

    expect(reply.source).toContain("Base documentaire Alzheimer");
    expect(reply.answer).toContain("oublis");
  });

  it("answers from the uploaded document base in Arabic", () => {
    const reply = generateChatbotReply("واش هوما أول علامات مرض الزهايمر؟", "ar");

    expect(reply.source).toContain("Base documentaire Alzheimer");
    expect(reply.answer).toContain("النسيان");
  });
});
