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
  maritalStatusIsConsecrated,
  type CommunityMemberFormState,
  type CommunityMemberFormValues,
} from './community-member-form-state';

const genderLabels: Record<(typeof genders)[number], string> = {
  male: 'mężczyzna',
  female: 'kobieta',
};

const maritalStatusLabels: Record<(typeof maritalStatuses)[number], string> = {
  single: 'osoba stanu wolnego',
  married: 'w małżeństwie',
  widowed: 'wdowa / wdowiec',
  consecrated: 'osoba konsekrowana lub seminarzysta',
};

const consecratedStatusLabels: Record<(typeof consecratedStatuses)[number], string> = {
  priest: 'kapłan',
  deacon: 'diakon',
  seminarian: 'seminarzysta',
  sister: 'siostra konsekrowana',
  brother: 'brat konsekrowany',
};

const communityEngagementLabels: Record<
  (typeof communityEngagementStatuses)[number],
  string
> = {
  'Looker-On': 'Przyglądający(a) się',
  'In-Probation': 'Na etapie przyjęcia i rozeznania',
  Commited: 'Zaangażowany(a)',
  'In-Fraternity-Probation': 'W okresie próbnym Bractwa Jezusowego',
  Fraternity: 'Konsekrowany(a) w Bractwie Jezusowym',
};

const accompanyingReadinessLabels: Record<
  (typeof accompanyingReadinesses)[number],
  string
> = {
  'Not Candidate': 'Nie jest kandydatem',
  Candidate: 'Kandydat',
  Ready: 'Gotowy',
  Active: 'Aktywny',
  Overwhelmed: 'Przeciążony',
  Deactivated: 'Dezaktywowany',
};

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

const fieldControlClassName =
  'rounded border border-white/35 bg-white/15 px-3 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/40';

const selectOptionClassName = 'bg-white text-gray-900';

function FieldError({ message }: { message?: string }): JSX.Element | null {
  if (!message) {
    return null;
  }
  return <p className="text-sm text-red-200">{message}</p>;
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

  return (
    <form action={formAction} className="flex flex-col gap-4 text-left">
      {loginHint ? (
        <p className="rounded border border-white/25 bg-white/10 px-3 py-2 text-sm text-white/90">
          {loginHint}
        </p>
      ) : null}

      {state?.formError ? (
        <p className="rounded border border-red-300/50 bg-red-500/20 px-3 py-2 text-red-50">
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
        <FieldError message={state?.fieldErrors?.first_name} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Nazwisko</span>
        <input
          name="last_name"
          defaultValue={values.last_name}
          className={fieldControlClassName}
          required
        />
        <FieldError message={state?.fieldErrors?.last_name} />
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
        <FieldError message={state?.fieldErrors?.gender} />
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
        <FieldError message={state?.fieldErrors?.marital_status} />
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
          <FieldError message={state?.fieldErrors?.consecrated_status} />
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
        <FieldError message={state?.fieldErrors?.community_engagement_status} />
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
        <FieldError message={state?.fieldErrors?.accompanying_readiness} />
      </label>

      <label className="flex flex-col gap-1">
        <span>E-mail</span>
        <input
          name="email"
          type="email"
          defaultValue={values.email}
          className={fieldControlClassName}
        />
        <FieldError message={state?.fieldErrors?.email} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Telefon</span>
        <input
          name="phone"
          defaultValue={values.phone}
          className={fieldControlClassName}
        />
        <FieldError message={state?.fieldErrors?.phone} />
      </label>

      <label className="flex flex-col gap-1">
        <span>Notatki</span>
        <textarea
          name="notes"
          defaultValue={values.notes}
          rows={4}
          className={fieldControlClassName}
        />
        <FieldError message={state?.fieldErrors?.notes} />
      </label>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end">
        <Link
          href="/app/members"
          className="rounded-full border border-white/35 bg-white/10 px-4 py-2 text-center text-white backdrop-blur-md hover:bg-white/20"
        >
          Anuluj
        </Link>
        <button
          type="submit"
          className="rounded-full border border-white/35 bg-white/25 px-4 py-2 text-white backdrop-blur-md hover:bg-white/35"
        >
          Zapisz
        </button>
      </div>
    </form>
  );
}
