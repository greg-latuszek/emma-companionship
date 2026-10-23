import type { CommunityMember } from '@/types/community-member';
import { messageRef, type MessageRef } from '@/i18n/translator';

export type CommunityMemberFormValues = {
  first_name: string;
  last_name: string;
  gender: string;
  marital_status: string;
  consecrated_status: string;
  community_engagement_status: string;
  accompanying_readiness: string;
  email: string;
  phone: string;
  notes: string;
};

export type CommunityMemberFormState = {
  fieldErrors?: Partial<Record<keyof CommunityMemberFormValues, MessageRef>>;
  formError?: MessageRef;
  values?: CommunityMemberFormValues;
};

const communityMemberFormFields = [
  'first_name',
  'last_name',
  'gender',
  'marital_status',
  'consecrated_status',
  'community_engagement_status',
  'accompanying_readiness',
  'email',
  'phone',
  'notes',
] as const;

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export function maritalStatusIsConsecrated(maritalStatus: string): boolean {
  return maritalStatus === 'consecrated';
}

export function communityMemberFormValuesFromMember(
  member: Pick<
    CommunityMember,
    | 'first_name'
    | 'last_name'
    | 'gender'
    | 'marital_status'
    | 'consecrated_status'
    | 'community_engagement_status'
    | 'accompanying_readiness'
    | 'email'
    | 'phone'
    | 'notes'
  >
): CommunityMemberFormValues {
  return {
    first_name: member.first_name,
    last_name: member.last_name,
    gender: member.gender ?? '',
    marital_status: member.marital_status ?? '',
    consecrated_status: member.consecrated_status ?? '',
    community_engagement_status: member.community_engagement_status ?? '',
    accompanying_readiness: member.accompanying_readiness ?? 'Not Candidate',
    email: member.email ?? '',
    phone: member.phone ?? '',
    notes: member.notes ?? '',
  };
}

export function communityMemberFormValuesFromForm(
  formData: FormData
): CommunityMemberFormValues {
  const marital_status = formText(formData, 'marital_status');

  return {
    first_name: formText(formData, 'first_name'),
    last_name: formText(formData, 'last_name'),
    gender: formText(formData, 'gender'),
    marital_status,
    consecrated_status: maritalStatusIsConsecrated(marital_status)
      ? formText(formData, 'consecrated_status')
      : '',
    community_engagement_status: formText(formData, 'community_engagement_status'),
    accompanying_readiness: formText(formData, 'accompanying_readiness'),
    email: formText(formData, 'email'),
    phone: formText(formData, 'phone'),
    notes: formText(formData, 'notes'),
  };
}

function fieldErrorMessage(field: string, code: string): MessageRef {
  if (field === 'first_name') {
    return messageRef('memberValidation.firstName');
  }
  if (field === 'last_name') {
    return messageRef('memberValidation.lastName');
  }
  if (field === 'email') {
    return messageRef('memberValidation.email');
  }
  if (field === 'phone') {
    return messageRef('memberValidation.phone');
  }
  if (code === 'invalid_enum_value' || code === 'invalid_type') {
    return messageRef('memberValidation.chooseValue');
  }
  return messageRef('memberValidation.fixField');
}

export function communityMemberWriteIssueMessages(
  issues: { path: (string | number)[]; code: string }[]
): NonNullable<CommunityMemberFormState['fieldErrors']> {
  const fieldErrors: NonNullable<CommunityMemberFormState['fieldErrors']> = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (
      typeof field === 'string' &&
      communityMemberFormFields.includes(field as (typeof communityMemberFormFields)[number]) &&
      !fieldErrors[field as keyof CommunityMemberFormValues]
    ) {
      fieldErrors[field as keyof CommunityMemberFormValues] = fieldErrorMessage(
        field,
        issue.code
      );
    }
  }

  return fieldErrors;
}
