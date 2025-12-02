"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

type TourStep = {
  id: string;
  title: string;
  description: string;
  bullets?: string[];
  targetRef?: RefObject<HTMLElement>;
};

type SectionTourCard = {
  id: string;
  label: string;
  description: string;
  startStepId: string;
};

type SectionTour = {
  id: string;
  label: string;
  cards: SectionTourCard[];
};

type HelpAssistantProps = {
  steps: TourStep[];
  sectionTours?: SectionTour[];
  manualUrl: string;
  activeSection?: string;
  onStepChange?: (stepId: string) => void;
};

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function HelpAssistant({
  steps,
  sectionTours,
  manualUrl,
  activeSection,
  onStepChange,
}: HelpAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tourScope, setTourScope] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<{
    transform: string;
    opacity: number;
  }>({ transform: "translate(0, 0) scale(1)", opacity: 1 });

  const currentStep = steps[currentStepIndex];

  const scopedSteps = useMemo(
    () => (tourScope ? steps.filter((step) => step.id.startsWith(tourScope)) : steps),
    [steps, tourScope],
  );

  const scopePosition = useMemo(() => {
    const position = scopedSteps.findIndex((step) => step.id === currentStep?.id);
    return { position, total: scopedSteps.length };
  }, [currentStep?.id, scopedSteps]);

  const badgeForStep = useMemo(() => {
    if (!currentStep?.id) return "";
    const [section] = currentStep.id.split(":");
    return section;
  }, [currentStep]);

  const visibleSectionTours = useMemo(() => {
    const scoped = (sectionTours ?? []).filter(
      (section) => !activeSection || section.id === activeSection,
    );

    if (!scoped.length && sectionTours?.length) {
      return [sectionTours[0]];
    }

    return scoped;
  }, [activeSection, sectionTours]);

  useEffect(() => {
    if (isTourActive && currentStep?.id && onStepChange) {
      onStepChange(currentStep.id);
    }
  }, [currentStep?.id, isTourActive, onStepChange]);

  useEffect(() => {
    if (!isTourActive) {
      setSpotlight(null);
      setPanelStyle({ transform: "translate(0, 0) scale(1)", opacity: 1 });
      return;
    }

    let animationId: number | null = null;
    const cleanups: Array<() => void> = [];

    const ensureTargetAndHighlight = () => {
      const targetElement = currentStep?.targetRef?.current;
      if (!targetElement) {
        animationId = requestAnimationFrame(ensureTargetAndHighlight);
        return;
      }

      const updateSpotlight = () => {
        const rect = targetElement.getBoundingClientRect();
        const spotlightRect = {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        };

        setSpotlight(spotlightRect);

        const panelElement = panelRef.current;
        if (!panelElement) return;

        const panelRect = panelElement.getBoundingClientRect();
        const spotlightViewport = {
          top: spotlightRect.top - window.scrollY,
          left: spotlightRect.left - window.scrollX,
          width: spotlightRect.width,
          height: spotlightRect.height,
        };

        const buffer = 16;
        const intersects = !(
          spotlightViewport.left + spotlightViewport.width + buffer < panelRect.left ||
          spotlightViewport.left - buffer > panelRect.right ||
          spotlightViewport.top + spotlightViewport.height + buffer < panelRect.top ||
          spotlightViewport.top - buffer > panelRect.bottom
        );

        if (!intersects) {
          setPanelStyle({ transform: "translate(0, 0) scale(1)", opacity: 1 });
          return;
        }

        const spotlightCenterY = spotlightViewport.top + spotlightViewport.height / 2;
        const panelCenterY = panelRect.top + panelRect.height / 2;
        const verticalShift = spotlightCenterY < panelCenterY ? 32 : -32;

        setPanelStyle({
          transform: `translate(36px, ${verticalShift}px) scale(0.94)`,
          opacity: 0.92,
        });
      };

      updateSpotlight();
      targetElement.scrollIntoView({ behavior: "smooth", block: "center" });

      window.addEventListener("resize", updateSpotlight);
      window.addEventListener("scroll", updateSpotlight, true);

      cleanups.push(() => window.removeEventListener("resize", updateSpotlight));
      cleanups.push(() => window.removeEventListener("scroll", updateSpotlight, true));
    };

    ensureTargetAndHighlight();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      cleanups.forEach((fn) => fn());
    };
  }, [currentStep, isTourActive]);

  function startTour(stepId: string) {
    const startIndex = steps.findIndex((step) => step.id === stepId);

    const [scopePrefix] = stepId.split(":");
    setTourScope(scopePrefix ?? null);

    if (startIndex === -1) return;

    setIsTourActive(true);
    setCurrentStepIndex(startIndex);
    setIsOpen(true);
  }

  function stopTour() {
    setIsTourActive(false);
    setSpotlight(null);
    setTourScope(null);
  }

  function goToStep(direction: 1 | -1) {
    setCurrentStepIndex((prev) => {
      const prefix = tourScope;
      let candidate = prev + direction;

      while (candidate >= 0 && candidate < steps.length) {
        if (!prefix || steps[candidate].id.startsWith(prefix)) {
          return candidate;
        }

        candidate += direction;
      }

      return prev;
    });
  }

  const hasNextInScope = useMemo(() => {
    const prefix = tourScope;
    for (let i = currentStepIndex + 1; i < steps.length; i += 1) {
      if (!prefix || steps[i].id.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }, [currentStepIndex, steps, tourScope]);

  const hasPrevInScope = useMemo(() => {
    const prefix = tourScope;
    for (let i = currentStepIndex - 1; i >= 0; i -= 1) {
      if (!prefix || steps[i].id.startsWith(prefix)) {
        return true;
      }
    }
    return false;
  }, [currentStepIndex, steps, tourScope]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => {
            const next = !prev;
            if (prev && isTourActive) {
              stopTour();
            }
            return next;
          });
        }}
        className="fixed bottom-6 right-6 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f1c2f] text-white shadow-xl transition hover:scale-105"
        aria-label="Abrir asistencia"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-7 w-7"
        >
          <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 14a1.25 1.25 0 1 1 1.25-1.25A1.251 1.251 0 0 1 12 16Zm1.67-5.74a2.4 2.4 0 0 0-1.17 1.69 1 1 0 0 1-2-.4 4.36 4.36 0 0 1 2.13-3.08 1.63 1.63 0 0 0 .76-1.39 1.75 1.75 0 1 0-3.5 0 1 1 0 0 1-2 0 3.75 3.75 0 1 1 5.51 3.18Z" />
        </svg>
      </button>

      {isOpen && (
        <div className="pointer-events-none fixed inset-0 z-20 flex items-end justify-end bg-transparent p-4 sm:items-start sm:p-8">
          <div
            ref={panelRef}
            style={panelStyle}
            className="pointer-events-auto w-full min-w-[380px] max-w-[420px] rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 transition-transform duration-200 ease-out"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Asistencia interactiva
                </p>
                <h2 className="text-xl font-semibold text-slate-900">¿Necesitas ayuda?</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Elige el recorrido de esta vista o descarga el manual para conocer cada funcionalidad sin salir de la pantalla.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  stopTour();
                }}
                className="rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
                aria-label="Cerrar panel de ayuda"
              >
                ×
              </button>
            </div>

            <div className="mt-4 max-h-[72vh] space-y-4 overflow-y-auto pr-1">
              {visibleSectionTours.length ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                    Recorridos de la vista actual
                  </p>
                  {visibleSectionTours.map((section) => (
                    <div key={section.id} className="grid grid-cols-1 gap-3">
                      {section.cards.slice(0, 4).map((card) => {
                        const startingStep = steps.find((step) => step.id === card.startStepId);
                        if (!startingStep) return null;

                        return (
                          <button
                            key={card.id}
                            type="button"
                            onClick={() => startTour(card.startStepId)}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:-translate-y-[1px] hover:border-[#0f1c2f] hover:shadow-lg"
                          >
                            <div className="mt-1 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0f1c2f]/10 text-[#0f1c2f]">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="h-5 w-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 6v6h4.5m4.125-1.5a8.625 8.625 0 1 1-17.25 0 8.625 8.625 0 0 1 17.25 0Z"
                                />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{card.label}</p>
                              <p className="text-xs font-normal text-slate-600">{card.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ) : null}

              <a
                href={manualUrl}
                download
                className="flex items-center gap-3 rounded-2xl bg-blue-100 px-4 py-3 text-sm font-semibold text-[#0f1c2f] shadow-sm transition hover:bg-blue-200"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1c2f] text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-6 w-6"
                  >
                    <path d="M13 3a1 1 0 0 0-1 1v9.586l-2.293-2.293a1 1 0 0 0-1.414 1.414l4 4a1 1 0 0 0 1.414 0l4-4a1 1 0 0 0-1.414-1.414L14 13.586V4a1 1 0 0 0-1-1Z" />
                    <path d="M5 18a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 1 0-2 0v1H7v-1a1 1 0 1 0-2 0Z" />
                  </svg>
                </span>
                Manual de Usuario (PDF)
              </a>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <p className="font-semibold text-slate-900">Contenido del tour</p>
                <ul className="mt-2 space-y-1 text-slate-600">
                  {(tourScope ? scopedSteps : steps.filter((step) => step.id.startsWith(activeSection ?? ""))).map((step) => (
                    <li key={step.id} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#0f1c2f]" aria-hidden />
                      <span>
                        <strong className="text-slate-800">{step.title}:</strong> {step.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {isTourActive && currentStep && spotlight && (
        <div className="pointer-events-none fixed inset-0 z-[9999]">
          <div
            className="fixed rounded-3xl ring-4 ring-white/80 transition-all duration-200 ease-out"
            style={{
              top: spotlight.top - 12,
              left: spotlight.left - 12,
              width: spotlight.width + 24,
              height: spotlight.height + 24,
              boxShadow: "0 0 0 18px rgba(15, 28, 47, 0.2)",
            }}
          />

          {(() => {
            const placeTooltipAbove =
              currentStep.id === "clientes:registrar" ||
              currentStep.id === "propiedades:registrar" ||
              currentStep.id === "simulador:cronograma";

            const tooltipTop = placeTooltipAbove
              ? spotlight.top
              : spotlight.top + spotlight.height + 16;

            const tooltipTransform = placeTooltipAbove
              ? "translateY(-100%) translateY(-16px)"
              : undefined;

            return (
          <div
            className="pointer-events-auto fixed z-[9999] max-w-sm rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200"
            style={{
              top: tooltipTop,
              left: Math.min(spotlight.left, window.innerWidth - 340),
              transform: tooltipTransform,
            }}
          >
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {badgeForStep}
            </div>

            <div className="relative">
              <div
                className={`absolute left-10 h-3 w-3 rotate-45 bg-white ring-1 ring-slate-200 ${
                  placeTooltipAbove ? "-bottom-4" : "-top-4"
                }`}
              />
              <h3 className="text-base font-semibold text-slate-900">{currentStep.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{currentStep.description}</p>
              {currentStep.bullets && (
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {currentStep.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2">
                      <span className="mt-1 h-2 w-2 rounded-full bg-[#0f1c2f]" aria-hidden />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="text-xs text-slate-500">
                Paso {scopePosition.position >= 0 ? scopePosition.position + 1 : currentStepIndex + 1} de
                {" "}
                {scopePosition.total || steps.length}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={stopTour}
                  className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200"
                >
                  Omitir
                </button>
                <button
                  type="button"
                  onClick={() => goToStep(-1)}
                  className="rounded-xl bg-slate-100 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!hasPrevInScope}
                >
                  Anterior
                </button>
                {hasNextInScope ? (
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="rounded-xl bg-[#0f1c2f] px-3 py-2 font-semibold text-white shadow-md hover:translate-y-[-1px] hover:shadow-lg"
                  >
                    Siguiente
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopTour}
                    className="rounded-xl bg-emerald-500 px-3 py-2 font-semibold text-white shadow-md hover:bg-emerald-600"
                  >
                    Finalizar
                  </button>
                )}
              </div>
            </div>
          </div>
            );
          })()}
        </div>
      )}
    </>
  );
}

export type { TourStep };
