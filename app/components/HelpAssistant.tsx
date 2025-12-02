"use client";

import { useEffect, useMemo, useState, type RefObject } from "react";

type TourStep = {
  id: string;
  title: string;
  description: string;
  bullets?: string[];
  targetRef?: RefObject<HTMLElement>;
};

type SectionTour = {
  id: string;
  label: string;
  description?: string;
  stepIds: string[];
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

  const currentStep = steps[currentStepIndex];

  const badgeForStep = useMemo(() => {
    if (!currentStep?.id) return "";
    const [section] = currentStep.id.split(":");
    return section;
  }, [currentStep]);

  const visibleSectionTours = useMemo(
    () =>
      (sectionTours ?? []).filter(
        (section) => !activeSection || section.id === activeSection,
      ),
    [activeSection, sectionTours],
  );

  useEffect(() => {
    if (isTourActive && currentStep?.id && onStepChange) {
      onStepChange(currentStep.id);
    }
  }, [currentStep?.id, isTourActive, onStepChange]);

  useEffect(() => {
    if (!isTourActive) {
      setSpotlight(null);
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

        setSpotlight({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
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

  function startTour(stepId?: string) {
    const startIndex = stepId
      ? steps.findIndex((step) => step.id === stepId)
      : 0;

    if (startIndex === -1) return;

    setIsTourActive(true);
    setCurrentStepIndex(startIndex);
    setIsOpen(true);
  }

  function stopTour() {
    setIsTourActive(false);
    setSpotlight(null);
  }

  function goToStep(direction: 1 | -1) {
    setCurrentStepIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return prev;
      if (next >= steps.length) return prev;
      return next;
    });
  }

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
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f1c2f] text-white shadow-xl transition hover:scale-105"
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
        <div className="pointer-events-none fixed inset-0 z-30 flex items-end justify-end bg-transparent p-4 sm:items-start sm:p-8">
          <div className="pointer-events-auto w-full min-w-[380px] max-w-[420px] rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Asistencia interactiva
                </p>
                <h2 className="text-xl font-semibold text-slate-900">¿Necesitas ayuda?</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Sigue el recorrido guiado o descarga el manual para conocer cada funcionalidad de la plataforma.
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
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => startTour()}
                  className="flex w-full items-center justify-between rounded-2xl bg-[#0f1c2f] px-4 py-3 text-left text-sm font-semibold text-white shadow-md transition hover:translate-y-[-1px] hover:shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6"
                      >
                        <path d="M12 2.25a.75.75 0 0 0-.671.414L8.68 7.5H4.75a.75.75 0 0 0-.543 1.282l3.224 3.395-1.022 4.623a.75.75 0 0 0 1.11.81L12 15.777l4.48 1.833a.75.75 0 0 0 1.07-.852l-.983-4.53 3.178-3.356A.75.75 0 0 0 18.934 7.5h-3.902l-2.61-4.836A.75.75 0 0 0 12 2.25Z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Recorrido completo</p>
                      <p className="text-xs text-slate-200">Activa el spotlight y sigue todas las secciones.</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">{steps.length} pasos</span>
                </button>

                {visibleSectionTours.length ? (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                      Recorridos de la vista actual
                    </p>
                    <div className="space-y-2">
                      {visibleSectionTours.map((section) => {
                        const firstStep = steps.find((step) => section.stepIds.includes(step.id));
                        if (!firstStep) return null;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() => startTour(firstStep.id)}
                            className="flex flex-col items-start gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-900 shadow-sm transition hover:border-[#0f1c2f] hover:shadow-lg"
                          >
                            <span className="inline-flex rounded-full bg-[#0f1c2f]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#0f1c2f]">
                              {section.label}
                            </span>
                            <span className="text-xs font-normal text-slate-600">
                              {section.description ?? "Recorrido específico de esta sección"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

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
                  {steps.map((step) => (
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
        <div className="pointer-events-none fixed inset-0 z-50">
          <div
            className="fixed rounded-3xl ring-4 ring-white/80 transition-all duration-200 ease-out"
            style={{
              top: spotlight.top - 12,
              left: spotlight.left - 12,
              width: spotlight.width + 24,
              height: spotlight.height + 24,
              boxShadow: "0 0 0 9999px rgba(15, 28, 47, 0.65)",
            }}
          />

          <div
            className="pointer-events-auto fixed z-50 max-w-sm rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-slate-200"
            style={{
              top: spotlight.top + spotlight.height + 16,
              left: Math.min(spotlight.left, window.innerWidth - 340),
            }}
          >
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
              {badgeForStep}
            </div>

            <div className="relative">
              <div className="absolute -top-4 left-10 h-3 w-3 rotate-45 bg-white ring-1 ring-slate-200" />
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
                Paso {currentStepIndex + 1} de {steps.length}
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
                  disabled={currentStepIndex === 0}
                >
                  Anterior
                </button>
                {currentStepIndex < steps.length - 1 ? (
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
        </div>
      )}
    </>
  );
}

export type { TourStep };
