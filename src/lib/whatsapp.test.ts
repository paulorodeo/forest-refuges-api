import assert from "node:assert/strict";
import test from "node:test";
import { DEFAULT_WHATSAPP_NUMBER, normalizeWhatsAppNumber, selectWhatsAppNumber, whatsappMessage, whatsappUrl } from "./whatsapp";

test("selects property, agent, agency, then global fallback", () => {
  assert.equal(selectWhatsAppNumber({ property: "+55 (65) 4042-6464", agent: "11999999999" }), "556540426464");
  assert.equal(selectWhatsAppNumber({ agent: "(11) 99999-9999", agency: "21999999999" }), "5511999999999");
  assert.equal(selectWhatsAppNumber({ agency: "21 99999-9999" }), "5521999999999");
  assert.equal(selectWhatsAppNumber({ property: "inválido" }), DEFAULT_WHATSAPP_NUMBER);
});

test("creates an encoded wa.me message with accents and a canonical URL", () => {
  const url = whatsappUrl("Chácara São João", "https://www.casanafloresta.com.br/imovel/chacara-sao-joao");
  assert.ok(url.startsWith("https://wa.me/556540426464?text="));
  assert.ok(url.includes("Ol%C3%A1%2C"));
  assert.equal(decodeURIComponent(url.split("text=")[1]!), whatsappMessage("Chácara São João", "https://www.casanafloresta.com.br/imovel/chacara-sao-joao"));
});
