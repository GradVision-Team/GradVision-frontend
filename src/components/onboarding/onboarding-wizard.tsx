"use client";

import {
  startTransition,
  useEffect,
  useId,
  useState,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { AuthFormAlert } from "@/components/auth/auth-form-alert";
import { OnboardingNav } from "@/components/onboarding/onboarding-nav";
import { OnboardingProgress } from "@/components/onboarding/onboarding-progress";
import { StepAboutYou } from "@/components/onboarding/step-about-you";
import { StepGoals } from "@/components/onboarding/step-goals";
import { StepInterests } from "@/components/onboarding/step-interests";
import { ApiRequestError, updateCurrentUserProfile } from "@/lib/api";
import { refreshSessionWithDedup } from "@/lib/auth/refresh-session-client";
import {
  ONBOARDING_STORAGE_KEY,
  createEmptyOnboardingDraft,
  mapDraftToUserUpdate,
  parsePersistedOnboardingState,
  validateOnboardingStep,
  type OnboardingDraft,
  type OnboardingStep,
} from "@/lib/onboarding";

export function OnboardingWizard() {
  const router = useRouter();
  const errorId = useId();
  const [step, setStep] = useState<OnboardingStep>(1);
  const [draft, setDraft] = useState<OnboardingDraft>(createEmptyOnboardingDraft);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const persisted = parsePersistedOnboardingState(
      window.sessionStorage.getItem(ONBOARDING_STORAGE_KEY),
    );

    startTransition(() => {
      if (persisted) {
        setStep(persisted.step);
        setDraft(persisted.draft);
      }
      setHasHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.sessionStorage.setItem(
      ONBOARDING_STORAGE_KEY,
      JSON.stringify({ step, draft }),
    );
  }, [draft, hasHydrated, step]);

  function updateDraft(patch: Partial<OnboardingDraft>) {
    setValidationError(null);
    setSubmitError(null);
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleBack() {
    if (step === 1 || isSubmitting) {
      return;
    }
    setValidationError(null);
    setSubmitError(null);
    setStep((current) => (current === 3 ? 2 : 1));
  }

  async function submitPayload() {
    const payload = mapDraftToUserUpdate(draft);
    await updateCurrentUserProfile(payload);
    window.sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
    router.replace("/dashboard");
    router.refresh();
  }

  async function submitOnboarding() {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await submitPayload();
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        const refreshResult = await refreshSessionWithDedup();

        if (refreshResult.status === "success") {
          try {
            await submitPayload();
            return;
          } catch (retryError) {
            const message =
              retryError instanceof ApiRequestError
                ? retryError.message
                : "Something went wrong. Please try again.";
            setSubmitError(
              retryError instanceof ApiRequestError &&
                retryError.status === 401
                ? "Your session expired. Please sign in again."
                : message,
            );
            return;
          }
        }

        if (refreshResult.status === "unauthorized") {
          router.replace("/login");
          return;
        }

        setSubmitError(refreshResult.message);
        return;
      }

      const message =
        error instanceof ApiRequestError
          ? error.message
          : "Something went wrong. Please try again.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const error = validateOnboardingStep(step, draft);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    if (step < 3) {
      setStep((current) => (current === 1 ? 2 : 3));
      return;
    }

    await submitOnboarding();
  }

  const alertMessage = validationError ?? submitError;
  const continueLabel =
    step === 3
      ? isSubmitting
        ? "Building your GradVision…"
        : "Build my GradVision"
      : "Continue";

  return (
    <AuthForm onSubmit={handleSubmit}>
      <OnboardingProgress step={step} />

      {alertMessage ? (
        <AuthFormAlert variant="error" id={errorId}>
          {alertMessage}
        </AuthFormAlert>
      ) : null}

      {step === 1 ? (
        <StepAboutYou
          draft={draft}
          errorId={alertMessage ? errorId : undefined}
          invalid={Boolean(validationError)}
          onChange={updateDraft}
        />
      ) : null}

      {step === 2 ? (
        <StepInterests
          draft={draft}
          errorId={alertMessage ? errorId : undefined}
          invalid={Boolean(validationError)}
          onChange={updateDraft}
        />
      ) : null}

      {step === 3 ? (
        <StepGoals
          draft={draft}
          errorId={alertMessage ? errorId : undefined}
          invalid={Boolean(validationError)}
          onChange={updateDraft}
        />
      ) : null}

      <OnboardingNav
        showBack={step > 1}
        isSubmitting={isSubmitting}
        continueLabel={continueLabel}
        onBack={handleBack}
      />
    </AuthForm>
  );
}
