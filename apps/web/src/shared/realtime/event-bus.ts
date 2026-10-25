type Handler = (payload: unknown) => void;

/** Distribui os eventos recebidos do hub para quem se inscreveu (telas e hooks). */
export class EventBus {
  private readonly handlers = new Map<string, Set<Handler>>();

  /** Retorna a função que cancela a inscrição. */
  readonly on = (event: string, handler: Handler): (() => void) => {
    const set = this.handlers.get(event) ?? new Set<Handler>();
    this.handlers.set(event, set);
    set.add(handler);
    return () => {
      set.delete(handler);
    };
  };

  readonly emit = (event: string, payload: unknown): void => {
    this.handlers.get(event)?.forEach((handler) => handler(payload));
  };
}
