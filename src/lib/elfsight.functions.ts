import { createServerFn } from "@tanstack/react-start";

const SUPPORTED_WIDGET_IDS = [1, 2, 3, 8, 9, 10] as const;

export type ElfsightWidgetId = (typeof SUPPORTED_WIDGET_IDS)[number];
export type ElfsightWidgetConfig = {
  id: ElfsightWidgetId;
  version: string;
  optionsJson: string;
  scriptUrl: string;
};

function validateWidgetId(data: unknown): { id: ElfsightWidgetId } {
  const id = (data as { id?: unknown })?.id;
  if (typeof id !== "number" || !SUPPORTED_WIDGET_IDS.includes(id as ElfsightWidgetId)) {
    throw new Error("widget Elfsight inválido");
  }
  return { id: id as ElfsightWidgetId };
}

/**
 * The configuration is read from the active WordPress widget on each cache refresh. Phone,
 * avatar, wording and schedules therefore remain managed in Elfsight's WordPress panel.
 */
export const fetchElfsightWidget = createServerFn({ method: "GET" })
  .inputValidator(validateWidgetId)
  .handler(async ({ data }): Promise<ElfsightWidgetConfig | null> => {
    const { getElfsightWidgetConfig } = await import("./wp.server");
    return getElfsightWidgetConfig(data.id) as Promise<ElfsightWidgetConfig | null>;
  });
