'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import type { JSX } from 'react';
import {
  accompanyingReadinesses,
  communityEngagementStatuses,
  consecratedStatuses,
  genders,
  maritalStatuses,
} from '@/types/community-member';
import {
  accompanyingReadinessLabels,
  communityEngagementLabels,
  consecratedStatusLabels,
  genderLabels,
  maritalStatusLabels,
} from './community-member-labels';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import {
  maritalStatusIsConsecrated,
  type CommunityMemberFormState,
  type CommunityMemberFormValues,
} from './community-member-form-state';

const emptyFormValues: CommunityMemberFormValues = {
  first_name: '',
  last_name: '',
  gender: '',
  marital_status: '',
  consecrated_status: '',
  community_engagement_status: '',
  accompanying_readiness: 'Not Candidate',
  email: '',
  phone: '',
  notes: '',
};

type CommunityMemberFormAction = (
  state: CommunityMemberFormState | undefined,
  formData: FormData
) => Promise<CommunityMemberFormState>;

const selectOptionClassName = 'bg-white text-gray-900';

function FieldError({
  message,
  className,
}: {
  message?: string;
  className: string;
}): JSX.Element | null {
  if (!message) {
    return null;
  }
  return <p className={`text-sm ${className}`}>{message}</p>;
}

export function CommunityMemberForm({
  action,
  initialValues,
  loginHint,
}: {
  action: CommunityMemberFormAction;
  initialValues?: CommunityMemberFormValues;
  loginHint?: string;
}): JSX.Element {
  const [state, formAction] = useActionState(action, undefined);
  const values = state?.values ?? initialValues ?? emptyFormValues;
  const [maritalStatus, setMaritalStatus] = useState(values.marital_status);
  const surfaces = visualSurfaces(useVisualStyle());
  const fieldControlClassName = surfaces.field;

  return (
    <form action={formAction} className="flex flex-col gap-4 text-left">
      {loginHint ? (
        <p className={surfaces.hint}>
          {loginHint}
        </p>
      ) : null}

      {state?.formError ? (
        <p className={surfaces.formError}>
          {state.formError}
        </p>
      ) : null}

      <label className="flex flex-col gap-1">
        <span>Imię</span>
        <input
          name="first_name"
          defaultValue={values.first_name}
          className={fieldControlClassName}
          required
        />
        <FieldError message={state?.fieldErrors?.first_name} className={surfaces.dangerText} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Nazwisko</span>
        <input
          name="last_name"
          defaultValue={values.last_name}
          className={fieldControlClassName}
          required
        />
        <FieldError message={state?.fieldErrors?.last_name} className={surfaces.dangerText} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Płeć</span>
        <select
          name="gender"
          defaultValue={values.gender}
          className={fieldControlClassName}
        >
          <option value="" className={selectOptionClassName}>
            nie wybrano
          </option>
          {genders.map((gender) => (
            <option key={gender} value={gender} className={selectOptionClassName}>
              {genderLabels[gender]}
            </option>
          ))}
        </select>
        <FieldError message={state?.fieldErrors?.gender} className={surfaces.dangerText} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Stan cywilny</span>
        <select
          name="marital_status"
          value={maritalStatus}
          onChange={(event) => setMaritalStatus(event.target.value)}
          className={fieldControlClassName}
        >
          <option value="" className={selectOptionClassName}>
            nie wybrano
          </option>
          {maritalStatuses.map((status) => (
            <option key={status} value={status} className={selectOptionClassName}>
              {maritalStatusLabels[status]}
            </option>
          ))}
        </select>
        <FieldError message={state?.fieldErrors?.marital_status} className={surfaces.dangerText} />
      </label>

      {maritalStatusIsConsecrated(maritalStatus) ? (
        <label className="flex flex-col gap-1">
          <span>Typ osoby konsekrowanej / seminarzysty</span>
          <select
            name="consecrated_status"
            defaultValue={values.consecrated_status}
            className={fieldControlClassName}
          >
            <option value="" className={selectOptionClassName}>
            nie wybrano
          </option>
            {consecratedStatuses.map((status) => (
              <option key={status} value={status} className={selectOptionClassName}>
                {consecratedStatusLabels[status]}
              </option>
            ))}
          </select>
          <FieldError message={state?.fieldErrors?.consecrated_status} className={surfaces.dangerText} />
        </label>
      ) : null}

      <label className="flex flex-col gap-1">
        <span>Zaangażowanie we wspólnocie</span>
        <select
          name="community_engagement_status"
          defaultValue={values.community_engagement_status}
          className={fieldControlClassName}
        >
          <option value="" className={selectOptionClassName}>
            nie wybrano
          </option>
          {communityEngagementStatuses.map((status) => (
            <option key={status} value={status} className={selectOptionClassName}>
              {communityEngagementLabels[status]}
            </option>
          ))}
        </select>
        <FieldError message={state?.fieldErrors?.community_engagement_status} className={surfaces.dangerText} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Gotowość do akompaniamentu</span>
        <select
          name="accompanying_readiness"
          defaultValue={values.accompanying_readiness}
          className={fieldControlClassName}
        >
          {accompanyingReadinesses.map((readiness) => (
            <option key={readiness} value={readiness} className={selectOptionClassName}>
              {accompanyingReadinessLabels[readiness]}
            </option>
          ))}
        </select>
        <FieldError message={state?.fieldErrors?.accompanying_readiness} className={surfaces.dangerText} />
      </label>

      <label className="flex flex-col gap-1">
        <span>E-mail</span>
        <input
          name="email"
          type="email"
          defaultValue={values.email}
          className={fieldControlClassName}
        />
        <FieldError message={state?.fieldErrors?.email} className={surfaces.dangerText} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Telefon</span>
        <input
          name="phone"
          defaultValue={values.phone}
          className={fieldControlClassName}
        />
        <FieldError message={state?.fieldErrors?.phone} className={surfaces.dangerText} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Notatki</span>
        <textarea
          name="notes"
          defaultValue={values.notes}
          rows={4}
          className={fieldControlClassName}
        />
        <FieldError message={state?.fieldErrors?.notes} className={surfaces.dangerText} />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href="/app/members"
          className={surfaces.secondaryButton}
        >
          Anuluj
        </Link>
        <button
          type="submit"
          className={surfaces.primaryButton}
        >
          Zapisz
        </button>
      </div>
    </form>
  );
}
