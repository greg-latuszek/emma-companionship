'use client';

import { useEffect, useState } from 'react';
import type { JSX } from 'react';
import { useTranslate } from '@/i18n/LocaleProvider';
import { useVisualStyle } from '@/components/VisualStyleProvider';
import { visualSurfaces } from '@/components/visual-style-surfaces';
import type { CoupleListItem, CoupleParticipant } from '@/types/couple';
import { DecoupleCoupleButton } from './DecoupleCoupleButton';
import {
  coupleDisplayName,
  coupleListExtraFields,
  coupleListFieldLabelKeys,
  coupleParticipantFieldText,
  defaultCoupleListExtraFields,
  readStoredCoupleListExtraFields,
  storeCoupleListExtraFields,
  toggleCoupleListExtraField,
  type CoupleListExtraField,
} from './couple-list-state';

function CouplePersonDetails({
  person,
  extraFields,
}: {
  person: CoupleParticipant;
  extraFields: CoupleListExtraField[];
}): JSX.Element {
  const translate = useTranslate();
  const surfaces = visualSurfaces(useVisualStyle());

  return (
    <div className="flex flex-col gap-1">
      <span className={`font-medium ${surfaces.strongText}`}>
        {person.first_name} {person.last_name}
      </span>
      {extraFields.map((field) => {
        const text = coupleParticipantFieldText(person, field);
        if (!text) {
          return null;
        }
        return (
          <span key={field} className={`text-sm ${surfaces.mutedText}`}>
            {translate(coupleListFieldLabelKeys[field])}: {text}
          </span>
        );
      })}
    </div>
  );
}

export function CoupleList({
  couples,
}: {
  couples: CoupleListItem[];
}): JSX.Element {
  const translate = useTranslate();
  const [extraFields, setExtraFields] = useState<CoupleListExtraField[]>(
    defaultCoupleListExtraFields
  );
  const surfaces = visualSurfaces(useVisualStyle());

  useEffect(() => {
    setExtraFields(readStoredCoupleListExtraFields(window.localStorage));
  }, []);

  function rememberExtraFields(next: CoupleListExtraField[]): void {
    setExtraFields(next);
    storeCoupleListExtraFields(next, window.localStorage);
  }

  if (couples.length === 0) {
    return (
      <p className={`text-center ${surfaces.mutedText}`}>
        {translate('members.couples.empty')}
      </p>
    );
  }

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <fieldset className="flex flex-col gap-2 text-left">
        <legend className={`text-sm font-medium ${surfaces.strongText}`}>
          {translate('common.visibleFields')}
        </legend>
        <div className="flex flex-wrap gap-3">
          {coupleListExtraFields.map((field) => (
            <label
              key={field}
              className={`inline-flex items-center gap-2 text-sm ${surfaces.mutedText}`}
            >
              <input
                type="checkbox"
                checked={extraFields.includes(field)}
                onChange={() => {
                  rememberExtraFields(
                    toggleCoupleListExtraField(extraFields, field)
                  );
                }}
              />
              {translate(coupleListFieldLabelKeys[field])}
            </label>
          ))}
        </div>
      </fieldset>

      <ul className="flex flex-col gap-4 lg:hidden">
        {couples.map((couple) => (
          <li
            key={couple.id}
            className={`flex flex-col gap-3 border-b pb-4 ${surfaces.rowDivider}`}
          >
            <CouplePersonDetails person={couple.husband} extraFields={extraFields} />
            <CouplePersonDetails person={couple.wife} extraFields={extraFields} />
            <DecoupleCoupleButton
              coupleId={couple.id}
              coupleName={coupleDisplayName(couple)}
            />
          </li>
        ))}
      </ul>

      <div className="hidden min-w-0 overflow-x-auto lg:block">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <thead>
            <tr className={`border-b ${surfaces.rowDivider}`}>
              <th className={`py-2 pr-4 font-medium ${surfaces.strongText}`}>
                {translate('members.couples.husband')}
              </th>
              <th className={`py-2 pr-4 font-medium ${surfaces.strongText}`}>
                {translate('members.couples.wife')}
              </th>
              <th className={`py-2 font-medium ${surfaces.strongText}`}>
                <span className="sr-only">{translate('members.couples.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {couples.map((couple) => (
              <tr key={couple.id} className={`border-b ${surfaces.rowDivider}`}>
                <td className="py-3 pr-4 align-top">
                  <CouplePersonDetails
                    person={couple.husband}
                    extraFields={extraFields}
                  />
                </td>
                <td className="py-3 pr-4 align-top">
                  <CouplePersonDetails
                    person={couple.wife}
                    extraFields={extraFields}
                  />
                </td>
                <td className="py-3 align-top">
                  <DecoupleCoupleButton
                    coupleId={couple.id}
                    coupleName={coupleDisplayName(couple)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
